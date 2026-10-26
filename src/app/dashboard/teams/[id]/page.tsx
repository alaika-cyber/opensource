import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBps } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  CheckCircle2,
  PieChart,
  MessageSquare,
  ListTodo,
  ShieldCheck,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import { TeamWorkspaceClient } from "./team-workspace-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamWorkspacePage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const team = await db.team.findUnique({
    where: { id },
    include: {
      leader: true,
      members: {
        include: {
          user: true,
        },
      },
      tasks: {
        include: {
          assignee: true,
          creator: true,
        },
        orderBy: { createdAt: "desc" },
      },
      discussions: {
        include: {
          author: true,
          comments: {
            include: { author: true },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      agreements: {
        include: {
          product: true,
        },
      },
      referralLinks: {
        include: { product: true },
      },
    },
  });

  if (!team) notFound();

  // Server-side authorization: User must be member or platform admin
  const isMember = team.members.some((m) => m.userId === user.id);
  const isLeader = team.leaderId === user.id;

  if (!isMember && user.role !== "ADMIN") {
    redirect("/dashboard/teams");
  }

  const currentUserMembership = team.members.find((m) => m.userId === user.id);

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="pb-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary">{team.industryFocus}</Badge>
            <Badge variant="success">Active Workspace</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {team.name}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Leader: {team.leader.name} • {team.members.length} Members
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/teams/${team.slug}`} target="_blank">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              Public Profile
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Interactive Workspace (Client) */}
      <TeamWorkspaceClient
        team={team}
        currentUserId={user.id}
        isLeader={isLeader || user.role === "ADMIN"}
      />
    </div>
  );
}
