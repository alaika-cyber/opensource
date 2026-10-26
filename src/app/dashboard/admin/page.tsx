import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCents, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  Users,
  Layers,
  DollarSign,
  AlertTriangle,
  History,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { AdminActionsClient } from "./admin-actions-client";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // System-wide metrics
  const totalUsers = await db.user.count();
  const totalProducts = await db.product.count();
  const totalTeams = await db.team.count();
  const totalOrders = await db.order.count();

  const totalSalesAgg = await db.order.aggregate({
    _sum: { grossAmountCents: true },
    where: { status: "COMPLETED" },
  });

  const totalCommissionsAgg = await db.commissionEntry.aggregate({
    _sum: {
      grossCommissionCents: true,
      platformFeeCents: true,
      netCommissionCents: true,
    },
    where: { status: { in: ["CONFIRMED", "PAYABLE", "PAID"] } },
  });

  // Recent disputes
  const disputes = await db.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: true,
      order: true,
    },
  });

  // Moderation candidates: products & users
  const recentProducts = await db.product.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: { owner: true },
  });

  const recentUsers = await db.user.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  // Admin audit logs
  const auditLogs = await db.adminAuditLog.findMany({
    take: 15,
    orderBy: { createdAt: "desc" },
    include: { admin: true },
  });

  const grossSales = totalSalesAgg._sum.grossAmountCents || 0;
  const platformRevenue = totalCommissionsAgg._sum.platformFeeCents || 0;
  const netCommissionsPaid = totalCommissionsAgg._sum.netCommissionCents || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Platform Administration & Integrity Console
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            System-wide commercial analytics, compliance audit logs, and transaction reconciliation.
          </p>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            Total Sales Volume
          </span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {formatCents(grossSales)}
          </p>
          <span className="text-[11px] text-zinc-500 block">{totalOrders} completed orders</span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
            Platform 5% Fee Revenue
          </span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {formatCents(platformRevenue)}
          </p>
          <span className="text-[11px] text-zinc-500 block">5% from paid contributor pool</span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            Contributor Payout Volume
          </span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCents(netCommissionsPaid)}
          </p>
          <span className="text-[11px] text-zinc-500 block">Net distributed to teams</span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
            Registered Accounts
          </span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {totalUsers}
          </p>
          <span className="text-[11px] text-zinc-500 block">
            {totalProducts} products • {totalTeams} teams
          </span>
        </Card>
      </div>

      {/* Disputes Resolution Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Attribution & Commission Disputes ({disputes.length})
          </CardTitle>
          <CardDescription>
            Mediate conflicting attribution claims and customer dispute records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {disputes.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">
              No unresolved disputes in the system.
            </p>
          ) : (
            <div className="space-y-3">
              {disputes.map((dispute) => (
                <div
                  key={dispute.id}
                  className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {dispute.reason}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {dispute.status}
                      </Badge>
                    </div>
                    <p className="text-zinc-500 mt-1">{dispute.description}</p>
                    <span className="text-[11px] text-zinc-400 mt-0.5 block">
                      Filed by: {dispute.reporter.name} • {formatDate(dispute.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <AdminActionsClient
                      type="dispute"
                      id={dispute.id}
                      status={dispute.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Moderation Controls: Products & Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Products Moderation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-500" />
              Product Listings Moderation
            </CardTitle>
            <CardDescription>Verify and review commercial product offerings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProducts.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{p.name}</p>
                  <span className="text-zinc-400 text-[11px]">Owner: {p.owner.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.isVerified ? "success" : "secondary"}>
                    {p.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                  <AdminActionsClient
                    type="product"
                    id={p.id}
                    isVerified={p.isVerified}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Users Moderation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-500" />
              User Account Status
            </CardTitle>
            <CardDescription>Inspect registered contributors and account statuses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{u.name}</p>
                  <span className="text-zinc-400 text-[11px]">{u.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={u.status === "ACTIVE" ? "success" : "destructive"}>
                    {u.status}
                  </Badge>
                  <AdminActionsClient
                    type="user"
                    id={u.id}
                    accountStatus={u.status}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Admin Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-zinc-500" />
            Administrative Audit Trail
          </CardTitle>
          <CardDescription>
            Cryptographically timestamped record of administrative interventions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {auditLogs.length === 0 ? (
            <p className="text-xs text-zinc-500 py-4 text-center">
              No administrative audit events recorded yet.
            </p>
          ) : (
            <div className="space-y-2 text-xs">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {log.action}
                    </span>
                    <span className="text-zinc-400 ml-2">
                      Target: {log.targetEntity} #{log.targetId?.substring(0, 8)}
                    </span>
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    Admin: {log.admin.name} • {formatDate(log.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
