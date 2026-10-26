import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatBps } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, PlusCircle, ArrowRight, Compass } from "lucide-react";
import { CreateTeamModalClient } from "./create-team-modal-client";

export default async function TeamsListPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const memberships = await db.teamMember.findMany({
    where: { userId: user.id },
    include: {
      team: {
        include: {
          leader: true,
          members: {
            include: { user: true },
          },
          agreements: {
            include: { product: true },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Growth Teams & Workspaces
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your collaborative syndicates, internal revenue splits, and active product campaigns.
          </p>
        </div>

        <CreateTeamModalClient />
      </div>

      {memberships.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <Users className="h-12 w-12 text-indigo-500 mx-auto" />
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
            No Active Growth Teams Yet
          </h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            Create a collaborative syndicate to source products together, or explore existing teams to request membership.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <CreateTeamModalClient />
            <Link href="/teams">
              <Button variant="outline">Browse Public Teams</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memberships.map((m) => {
            const team = m.team;
            return (
              <Card key={team.id} className="p-6 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                        <Link href={`/dashboard/teams/${team.id}`} className="hover:text-indigo-600 transition-colors">
                          {team.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {team.industryFocus}
                      </p>
                    </div>
                    <Badge variant={m.role === "LEADER" ? "default" : "secondary"}>
                      {m.role}
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {team.description}
                  </p>

                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Your Agreed Split</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      {formatBps(m.allocationBps)}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-500 flex items-center justify-between">
                    <span>{team.members.length} members</span>
                    <span>{team.agreements.length} active campaigns</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
                  <Link href={`/dashboard/teams/${team.id}`} className="block">
                    <Button variant="default" className="w-full text-xs gap-1.5">
                      Open Team Workspace
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
