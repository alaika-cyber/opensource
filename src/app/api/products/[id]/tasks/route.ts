import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TaskPriority, TaskStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function verifyProjectAccess(projectIdOrSlug: string, userId: string, role: string) {
  const project = await db.product.findFirst({
    where: { OR: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }] },
    include: {
      projectMembers: true,
    },
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

    const tasks = await db.teamTask.findMany({
      where: { projectId: project.id },
      include: {
        assignee: {
          select: { id: true, name: true, avatarUrl: true },
        },
        creator: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tasks });
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
      priority = "MEDIUM",
      assigneeId,
      dueDate,
      department,
      subtasks = [],
      labels = [],
      acceptanceCriteria,
    } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const task = await db.teamTask.create({
      data: {
        projectId: project.id,
        creatorId: user.id,
        assigneeId: assigneeId || null,
        title: title.trim(),
        description: description?.trim() || null,
        priority: (priority as TaskPriority) || TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        dueDate: dueDate ? new Date(dueDate) : null,
        department: department || null,
        subtasks: Array.isArray(subtasks) ? subtasks : [],
        labels: Array.isArray(labels) ? labels : [],
        acceptanceCriteria: acceptanceCriteria?.trim() || null,
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatarUrl: true },
        },
        creator: {
          select: { id: true, name: true },
        },
      },
    });

    if (assigneeId && assigneeId !== user.id) {
      await db.notification.create({
        data: {
          userId: assigneeId,
          title: "New Project Task Assigned",
          message: `${user.name} assigned you: "${task.title}" in ${project.name}`,
          type: "TASK",
          linkUrl: `/products/${project.slug}/workspace?tab=tasks`,
        },
      });
    }

    return NextResponse.json({ success: true, task }, { status: 201 });
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
    const {
      taskId,
      status,
      priority,
      assigneeId,
      title,
      description,
      dueDate,
      department,
      subtasks,
      labels,
      acceptanceCriteria,
    } = body;

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const existingTask = await db.teamTask.findUnique({
      where: { id: taskId },
    });

    if (!existingTask || existingTask.projectId !== project.id) {
      return NextResponse.json({ error: "Task not found in this project" }, { status: 404 });
    }

    const updatedTask = await db.teamTask.update({
      where: { id: taskId },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        status: status !== undefined ? (status as TaskStatus) : undefined,
        priority: priority !== undefined ? (priority as TaskPriority) : undefined,
        assigneeId: assigneeId !== undefined ? assigneeId : undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        department: department !== undefined ? department : undefined,
        subtasks: subtasks !== undefined ? subtasks : undefined,
        labels: labels !== undefined ? labels : undefined,
        acceptanceCriteria: acceptanceCriteria !== undefined ? acceptanceCriteria : undefined,
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatarUrl: true },
        },
        creator: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ success: true, task: updatedTask });
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
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const task = await db.teamTask.findUnique({
      where: { id: taskId },
    });

    if (!task || task.projectId !== project.id) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (!isOwner && !isAdmin && task.creatorId !== user.id) {
      return NextResponse.json({ error: "Unauthorized to delete this task" }, { status: 403 });
    }

    await db.teamTask.delete({ where: { id: taskId } });

    return NextResponse.json({ success: true, message: "Task deleted successfully" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
