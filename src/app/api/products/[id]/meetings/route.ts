import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function verifyProjectAccess(projectIdOrSlug: string, userId: string, role: string) {
  const project = await db.product.findFirst({
    where: { OR: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }] },
    include: { projectMembers: true },
  });

  if (!project) return { error: "Project not found", status: 404 } as const;

  const isOwner = project.ownerId === userId;
  const isMember = project.projectMembers.some((m) => m.userId === userId);
  const isAdmin = role === "ADMIN";

  if (!isOwner && !isMember && !isAdmin) {
    return { error: "Forbidden: Not an authorized member of this project workspace", status: 403 } as const;
  }

  return { project, isOwner, isMember, isAdmin };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const auth = await verifyProjectAccess(id, user.id, user.role);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { project } = auth;

    const meetings = await db.projectMeeting.findMany({
      where: { projectId: project.id },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json({ meetings });
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

    const auth = await verifyProjectAccess(id, user.id, user.role);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { project } = auth;
    const body = await req.json();
    const {
      title,
      description,
      scheduledAt,
      durationMinutes = 30,
      timezone = "UTC",
      meetingUrl,
      agenda,
      attendees = [],
    } = body;

    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Meeting title and scheduled time are required" }, { status: 400 });
    }

    const meeting = await db.projectMeeting.create({
      data: {
        projectId: project.id,
        creatorId: user.id,
        title: title.trim(),
        description: description?.trim() || null,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: Number(durationMinutes),
        timezone,
        meetingUrl: meetingUrl?.trim() || null,
        agenda: agenda?.trim() || null,
        attendees: Array.isArray(attendees) ? attendees : [],
        status: "SCHEDULED",
      },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    // Notify project members or specific attendees
    const notifyUserIds = project.projectMembers
      .map((m) => m.userId)
      .concat(project.ownerId)
      .filter((uid) => uid !== user.id);

    const uniqueUids = Array.from(new Set(notifyUserIds));

    for (const uid of uniqueUids) {
      await db.notification.create({
        data: {
          userId: uid,
          title: "New Team Meeting Scheduled",
          message: `${user.name} scheduled "${meeting.title}" for ${new Date(meeting.scheduledAt).toLocaleString()}`,
          type: "MEETING",
          linkUrl: `/products/${project.slug}/workspace?tab=meetings`,
        },
      });
    }

    return NextResponse.json({ success: true, meeting }, { status: 201 });
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

    const auth = await verifyProjectAccess(id, user.id, user.role);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { project } = auth;
    const body = await req.json();
    const { meetingId, notes, decisions, status, agenda, meetingUrl } = body;

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID required" }, { status: 400 });
    }

    const meeting = await db.projectMeeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting || meeting.projectId !== project.id) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const updated = await db.projectMeeting.update({
      where: { id: meetingId },
      data: {
        notes: notes !== undefined ? notes : undefined,
        decisions: decisions !== undefined ? decisions : undefined,
        status: status !== undefined ? status : undefined,
        agenda: agenda !== undefined ? agenda : undefined,
        meetingUrl: meetingUrl !== undefined ? meetingUrl : undefined,
      },
      include: {
        creator: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({ success: true, meeting: updated });
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

    const auth = await verifyProjectAccess(id, user.id, user.role);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { project, isOwner, isAdmin } = auth;
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get("meetingId");

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID required" }, { status: 400 });
    }

    const meeting = await db.projectMeeting.findUnique({
      where: { id: meetingId },
    });

    if (!meeting || meeting.projectId !== project.id) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (!isOwner && !isAdmin && meeting.creatorId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to cancel this meeting" }, { status: 403 });
    }

    await db.projectMeeting.delete({ where: { id: meetingId } });

    return NextResponse.json({ success: true, message: "Meeting cancelled" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
