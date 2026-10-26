import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { MeetingsDashboardClient } from "./meetings-client";

export default async function DashboardMeetingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

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

  const meetings = await db.projectMeeting.findMany({
    where: {
      OR: [
        { creatorId: user.id },
        { projectId: { in: allProjectIds } },
      ],
    },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      creator: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  const serializableMeetings = meetings.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    scheduledAt: m.scheduledAt.toISOString(),
    durationMinutes: m.durationMinutes,
    timezone: m.timezone,
    meetingUrl: m.meetingUrl,
    agenda: m.agenda,
    notes: m.notes,
    decisions: m.decisions,
    status: m.status,
    project: m.project,
    creator: m.creator,
  }));

  const userProjectsList = Array.from(projectMap.entries()).map(([id, name]) => ({ id, name }));

  return (
    <MeetingsDashboardClient
      initialMeetings={serializableMeetings}
      userProjects={userProjectsList}
      currentUserId={user.id}
    />
  );
}
