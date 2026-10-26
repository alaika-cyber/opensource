import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const project = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true, profile: true },
        },
        projectMembers: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true, profile: true },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        tasks: {
          select: { id: true, assigneeId: true, status: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Attach workload count to members
    const membersWithWorkload = project.projectMembers.map((member) => {
      const activeTasksCount = project.tasks.filter(
        (t) => t.assigneeId === member.userId && t.status !== "DONE"
      ).length;
      return {
        ...member,
        activeTasksCount,
      };
    });

    return NextResponse.json({
      owner: project.owner,
      members: membersWithWorkload,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const project = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only project owners can invite or add members" }, { status: 403 });
    }

    const body = await req.json();
    const { email, userId, role = "Contributor", department = "Operations" } = body;

    let targetUser = null;
    if (userId) {
      targetUser = await db.user.findUnique({ where: { id: userId } });
    } else if (email) {
      targetUser = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    }

    if (!targetUser) {
      return NextResponse.json({ error: "Target professional not found" }, { status: 404 });
    }

    const existingMember = await db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: project.id,
          userId: targetUser.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: "Professional is already a member of this project" }, { status: 400 });
    }

    const member = await db.projectMember.create({
      data: {
        projectId: project.id,
        userId: targetUser.id,
        role,
        department,
        status: "ACTIVE",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true, profile: true },
        },
      },
    });

    await db.notification.create({
      data: {
        userId: targetUser.id,
        title: "Added to Project Team",
        message: `${user.name} added you to the project "${project.name}" as ${role} (${department}).`,
        type: "INVITATION",
        linkUrl: `/products/${project.slug}/workspace`,
      },
    });

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const project = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only project owners can modify member roles" }, { status: 403 });
    }

    const body = await req.json();
    const { memberId, role, department, status } = body;

    const updated = await db.projectMember.update({
      where: { id: memberId },
      data: {
        role: role !== undefined ? role : undefined,
        department: department !== undefined ? department : undefined,
        status: status !== undefined ? status : undefined,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const project = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json({ error: "memberId parameter required" }, { status: 400 });
    }

    const member = await db.projectMember.findUnique({
      where: { id: memberId },
    });

    if (!member || member.projectId !== project.id) {
      return NextResponse.json({ error: "Member not found in this project" }, { status: 404 });
    }

    // Owner cannot be removed as founder
    if (member.userId === project.ownerId) {
      return NextResponse.json({ error: "The project founder cannot be removed" }, { status: 400 });
    }

    // Only founder, admin, or the member themselves can remove
    const isOwner = project.ownerId === user.id;
    const isAdmin = user.role === "ADMIN";
    const isSelf = member.userId === user.id;

    if (!isOwner && !isAdmin && !isSelf) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Reassign open tasks to unassigned
    await db.teamTask.updateMany({
      where: {
        projectId: project.id,
        assigneeId: member.userId,
        status: { not: "DONE" },
      },
      data: {
        assigneeId: null,
      },
    });

    await db.projectMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      success: true,
      message: "Member removed and tasks reassigned",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
