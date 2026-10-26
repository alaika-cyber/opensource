import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatBps } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Compass, ArrowRight, ShieldCheck, Briefcase } from "lucide-react";

export default async function TeamsExplorePage() {
  const teams = await db.team.findMany({
    where: {
      visibility: "PUBLIC",
      status: "ACTIVE",
    },
    include: {
      leader: true,
      members: {
        include: { user: true },
      },
      campaigns: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Collaborative Growth Teams
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            Discover multidisciplinary syndicates formed by independent strategists, closers, and creators to scale verified product revenue.
          </p>
        </div>
        <Link href="/dashboard/teams">
          <Button variant="default">Create a Team</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {teams.map((team) => (
          <Card key={team.id} className="p-6 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    <Link href={`/teams/${team.slug}`} className="hover:text-indigo-600 transition-colors">
                      {team.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                    {team.industryFocus || "Cross-Industry Collective"}
                  </p>
                </div>
                <Badge variant="success">Active Syndicate</Badge>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {team.description}
              </p>

              {/* Members */}
              <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">
                  Team Members ({team.members.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300"
                    >
                      <span className="font-semibold">{member.user.name}</span>
                      <span className="text-zinc-400 text-[10px]">({member.role})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between mt-6">
              <span className="text-xs text-zinc-500">
                Leader: <strong className="text-zinc-800 dark:text-zinc-200">{team.leader.name}</strong>
              </span>
              <Link href={`/teams/${team.slug}`}>
                <Button size="sm" variant="default" className="gap-1.5 text-xs">
                  View Workspace & Track Record
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
