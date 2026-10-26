import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCents, formatBps } from "@/lib/utils";
import { getUserPayableBalance } from "@/lib/ledger";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default async function DashboardOverviewPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const payableBalanceCents = await getUserPayableBalance(user.id);

  // Fetch user's data
  const commissions = await db.commissionEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        include: { product: true },
      },
      team: true,
    },
    take: 5,
  });

  const confirmedCommissions = await db.commissionEntry.aggregate({
    where: { userId: user.id, status: { in: ["CONFIRMED", "PAYABLE"] } },
    _sum: { netCommissionCents: true },
  });

  const products = await db.product.findMany({
    where: { ownerId: user.id },
    include: {
      orders: true,
      agreements: true,
    },
  });

  const teamMemberships = await db.teamMember.findMany({
    where: { userId: user.id },
    include: {
      team: {
        include: {
          members: true,
          agreements: true,
        },
      },
    },
  });

  const assignedTasks = await db.teamTask.findMany({
    where: { assigneeId: user.id, status: { in: ["TODO", "IN_PROGRESS"] } },
    take: 4,
    include: { team: true },
  });

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Welcome back, {user.name}. Here is your commercial execution summary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/products/new">
            <Button size="sm" variant="default" className="text-xs">
              + List Product
            </Button>
          </Link>
          <Link href="/dashboard/teams">
            <Button size="sm" variant="outline" className="text-xs">
              Create Team
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2">
          <span className="text-xs text-zinc-400 font-medium">Available Payout Balance</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {formatCents(payableBalanceCents)}
          </p>
          <span className="text-[11px] text-zinc-500 block">Verified ledger credits</span>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-xs text-zinc-400 font-medium">Commissions Earned</span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {formatCents(confirmedCommissions._sum.netCommissionCents || 0)}
          </p>
          <span className="text-[11px] text-zinc-500 block">Net after platform fees</span>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-xs text-zinc-400 font-medium">Active Growth Teams</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {teamMemberships.length}
          </p>
          <span className="text-[11px] text-zinc-500 block">Collaborative syndicates</span>
        </Card>

        <Card className="p-5 space-y-2">
          <span className="text-xs text-zinc-400 font-medium">Listed Products</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {products.length}
          </p>
          <span className="text-[11px] text-zinc-500 block">Commercial offerings</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Commissions & Tasks */}
        <div className="lg:col-span-8 space-y-8">
          {/* Recent Attributed Commissions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base">Recent Attributed Commissions</CardTitle>
                <CardDescription>
                  Verified orders allocated according to accepted agreements.
                </CardDescription>
              </div>
              <Link href="/dashboard/payouts">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                  View Ledger
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {commissions.length === 0 ? (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No commissions attributed yet. Join an active syndicate or share your referral links.
                </div>
              ) : (
                <div className="space-y-3">
                  {commissions.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {c.order.product.name} (Order #{c.order.orderNumber})
                        </p>
                        <p className="text-zinc-500 mt-0.5">
                          Sale: {formatCents(c.calculationBasisCents)} • Pool: {formatBps(c.rateBps)} • Share: {formatBps(c.memberShareBps)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 block">
                          +{formatCents(c.netCommissionCents)}
                        </span>
                        <Badge variant="secondary" className="text-[10px] mt-0.5">
                          {c.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assigned Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Active Team Tasks</CardTitle>
              <CardDescription>
                Deliverables assigned to you in team workspaces.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignedTasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">
                  No pending tasks assigned to you.
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {t.title}
                        </span>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          Team: {t.team.name}
                        </span>
                      </div>
                      <Badge variant="default" className="text-[10px]">
                        {t.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Notifications & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notifications */}
          <Card className="p-5 space-y-3">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Activity & Alerts
            </h4>
            {notifications.length === 0 ? (
              <p className="text-xs text-zinc-500">No new alerts.</p>
            ) : (
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 text-xs space-y-1">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{n.title}</p>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Shortcuts */}
          <Card className="p-5 space-y-3">
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Quick Shortcuts
            </h4>
            <div className="space-y-2">
              <Link href="/products" className="block">
                <Button variant="outline" size="sm" className="w-full text-xs justify-start gap-2">
                  <Layers className="h-3.5 w-3.5 text-indigo-500" />
                  Explore Products Catalog
                </Button>
              </Link>
              <Link href="/teams" className="block">
                <Button variant="outline" size="sm" className="w-full text-xs justify-start gap-2">
                  <Users className="h-3.5 w-3.5 text-violet-500" />
                  Find Growth Syndicates
                </Button>
              </Link>
              <Link href="/dashboard/payouts" className="block">
                <Button variant="outline" size="sm" className="w-full text-xs justify-start gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                  Request Payout Settlement
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
