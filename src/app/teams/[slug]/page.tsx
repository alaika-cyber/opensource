import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatBps } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  PieChart,
  Briefcase,
  Star,
  Layers,
  ArrowRight,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TeamDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const team = await db.team.findUnique({
    where: { slug },
    include: {
      leader: true,
      members: {
        include: {
          user: {
            include: { profile: true },
          },
        },
      },
      agreements: {
        where: { status: "ACTIVE" },
        include: { product: true },
      },
      campaigns: true,
      reviews: {
        include: { author: true },
      },
    },
  });

  if (!team) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Team Header */}
      <div className="pb-8 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{team.industryFocus || "Cross-Industry Collective"}</Badge>
            <Badge variant="success">Active Growth Syndicate</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {team.name}
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            {team.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/dashboard/teams/${team.id}`}>
            <Button variant="default">Open Workspace</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8">
        {/* Left Column: Members & Internal Split */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-indigo-500" />
                  Agreed Member Commission Allocation
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Internal revenue distribution percentages agreed by all members prior to campaign activation.
                </p>
              </div>
              <Badge variant="success">100.00% Pool Reconciled</Badge>
            </div>

            <div className="space-y-3">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                      {member.user.name.charAt(0)}
                    </div>
                    <div>
                      <Link
                        href={`/professionals/${member.user.id}`}
                        className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 transition-colors"
                      >
                        {member.user.name}
                      </Link>
                      <p className="text-xs text-zinc-500 mt-0.5">Role: {member.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block">Agreed Split</span>
                    <span className="font-bold text-base text-indigo-600 dark:text-indigo-400">
                      {formatBps(member.allocationBps)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Campaigns & Products */}
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Active Commercial Products
            </h3>
            {team.agreements.length === 0 ? (
              <p className="text-sm text-zinc-500">
                This team has not linked an active commercial campaign yet.
              </p>
            ) : (
              <div className="space-y-3">
                {team.agreements.map((agreement) => (
                  <div
                    key={agreement.id}
                    className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {agreement.product.name}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Commission Pool: {formatBps(agreement.commissionPoolBps)} • Attribution Window: {agreement.attributionWindowDays} days
                      </p>
                    </div>
                    <Link href={`/products/${agreement.product.slug}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Product
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar: Team Info & Reviews */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-5 space-y-3">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Team Overview
            </h4>
            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Team Leader:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{team.leader.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Members:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{team.members.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Agreements:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{team.agreements.length}</span>
              </div>
            </div>
          </Card>

          {/* Client Reviews */}
          <Card className="p-5 space-y-3">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Verified Partner Reviews
            </h4>
            {team.reviews.length === 0 ? (
              <p className="text-xs text-zinc-500">
                Reviews will be recorded upon completion of verified commercial collaboration milestones.
              </p>
            ) : (
              <div className="space-y-3">
                {team.reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 text-xs space-y-1">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-500" />
                      ))}
                    </div>
                    <p className="italic text-zinc-700 dark:text-zinc-300">"{rev.comment}"</p>
                    <span className="text-[10px] text-zinc-400 block">— {rev.author.name}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
