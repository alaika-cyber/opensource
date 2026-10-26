import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { TaskPriority, TaskStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: teamId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check membership
    const membership = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: user.id,
        },
      },
    });

    if (!membership && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not a member of this team" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, priority, assigneeId } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const task = await db.teamTask.create({
      data: {
        teamId,
        creatorId: user.id,
        assigneeId: assigneeId || null,
        title: title.trim(),
        description: description?.trim() || null,
        priority: (priority as TaskPriority) || TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
      },
      include: {
        assignee: true,
        creator: true,
      },
    });

    if (assigneeId && assigneeId !== user.id) {
      await db.notification.create({
        data: {
          userId: assigneeId,
          title: "New Task Assigned",
          message: `${user.name} assigned you the task: "${task.title}"`,
          type: "TASK",
          linkUrl: `/dashboard/teams/${teamId}`,
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
    const { id: teamId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const membership = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: user.id,
        },
      },
    });

    if (!membership && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not a member of this team" }, { status: 403 });
    }

    const body = await req.json();
    const { taskId, status, priority, assigneeId } = body;

    const task = await db.teamTask.update({
      where: { id: taskId },
      data: {
        status: status ? (status as TaskStatus) : undefined,
        priority: priority ? (priority as TaskPriority) : undefined,
        assigneeId: assigneeId !== undefined ? assigneeId : undefined,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
