import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { MessagesDashboardClient } from "./messages-client";

export default async function DashboardMessagesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Get user's teams
  const userMemberships = await db.teamMember.findMany({
    where: { userId: user.id },
    include: {
      team: { select: { id: true, name: true } },
    },
  });

  const userTeams = userMemberships.map((m) => m.team);
  const teamIds = userTeams.map((t) => t.id);

  const discussions = await db.teamDiscussion.findMany({
    where: {
      teamId: { in: teamIds },
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
      team: { select: { id: true, name: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializableDiscussions = discussions.map((d) => ({
    id: d.id,
    title: d.title,
    content: d.content,
    isPinned: d.isPinned,
    createdAt: d.createdAt.toISOString(),
    author: d.author,
    team: d.team,
    comments: d.comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: c.author,
    })),
  }));

  return (
    <MessagesDashboardClient
      initialDiscussions={serializableDiscussions}
      userTeams={userTeams}
      currentUserId={user.id}
    />
  );
}
