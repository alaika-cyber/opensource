import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { TasksDashboardClient } from "./tasks-client";

export default async function DashboardTasksPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Get all tasks assigned to user or in projects user is member or owner of
  const ownedProjects = await db.product.findMany({
    where: { ownerId: user.id },
    select: { id: true, name: true },
  });

  const memberProjects = await db.projectMember.findMany({
    where: { userId: user.id },
    include: {
      project: { select: { id: true, name: true } },
    },
  });

  const projectMap = new Map<string, string>();
  ownedProjects.forEach((p) => projectMap.set(p.id, p.name));
  memberProjects.forEach((m) => projectMap.set(m.project.id, m.project.name));

  const allProjectIds = Array.from(projectMap.keys());

  const tasks = await db.teamTask.findMany({
    where: {
      OR: [
        { assigneeId: user.id },
        { creatorId: user.id },
        { projectId: { in: allProjectIds } },
      ],
    },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      team: { select: { id: true, name: true, slug: true } },
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializableTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    department: t.department,
    labels: t.labels,
    subtasks: t.subtasks,
    acceptanceCriteria: t.acceptanceCriteria,
    project: t.project,
    team: t.team,
    assignee: t.assignee,
    creator: t.creator,
  }));

  const userProjectsList = Array.from(projectMap.entries()).map(([id, name]) => ({ id, name }));

  return (
    <TasksDashboardClient
      initialTasks={serializableTasks}
      userProjects={userProjectsList}
      currentUserId={user.id}
    />
  );
}
