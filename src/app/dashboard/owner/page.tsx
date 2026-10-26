import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCents, formatBps } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Users,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Calendar,
  Layers,
} from "lucide-react";
import { OwnerRefundClient } from "./owner-refund-client";
import { FounderApplicationsClient } from "./founder-applications-client";

export default async function FounderDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Projects owned by user
  const projects = await db.product.findMany({
    where: { ownerId: user.id },
    include: {
      projectMembers: {
        include: { user: true },
      },
      tasks: true,
      milestones: true,
      goals: true,
      opportunities: {
        include: {
          applications: {
            include: {
              applicantUser: {
                include: { profile: true },
              },
              opportunity: {
                include: {
                  product: { select: { id: true, name: true, slug: true } },
                },
              },
            },
          },
        },
      },
      orders: {
        include: {
          commissions: true,
          referralLink: true,
        },
      },
      agreements: {
        include: {
          team: {
            include: { members: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate project metrics
  let totalTeamMembers = 0;
  let totalOpenTasks = 0;
  let totalPendingApplications = 0;
  let grossSalesCents = 0;
  let commissionPoolCommittedCents = 0;
  let allOrders: any[] = [];
  let allApplications: any[] = [];

  for (const project of projects) {
    totalTeamMembers += project.projectMembers.length;
    totalOpenTasks += project.tasks.filter((t) => t.status !== "DONE").length;

    for (const opp of project.opportunities) {
      for (const app of opp.applications) {
        allApplications.push({
          id: app.id,
          proposedRole: app.proposedRole,
          skills: app.skills,
          coverLetter: app.coverLetter,
          proposedStrategy: app.proposedStrategy,
          requestedCompensation: app.requestedCompensation,
          status: app.status,
          createdAt: app.createdAt.toISOString(),
          applicantUser: {
            id: app.applicantUser.id,
            name: app.applicantUser.name,
            email: app.applicantUser.email,
            avatarUrl: app.applicantUser.avatarUrl,
            profile: app.applicantUser.profile
              ? {
                  headline: app.applicantUser.profile.headline,
                  skills: app.applicantUser.profile.skills,
                }
              : null,
          },
          opportunity: {
            id: opp.id,
            productId: project.id,
            product: { id: project.id, name: project.name, slug: project.slug },
          },
        });
        if (app.status === "PENDING" || app.status === "UNDER_REVIEW") {
          totalPendingApplications += 1;
        }
      }
    }

    for (const order of project.orders) {
      if (order.status === "COMPLETED") {
        grossSalesCents += order.grossAmountCents;
        const orderComm = order.commissions.reduce((s: number, c: any) => s + c.grossCommissionCents, 0);
        commissionPoolCommittedCents += orderComm;
      }
      allOrders.push({ ...order, productName: project.name });
    }
  }

  const netOwnerRevenueCents = grossSalesCents - commissionPoolCommittedCents;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            <FolderKanban className="h-7 w-7 text-indigo-600" />
            Founder Command Center
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your business ventures, review contributor applications, track departmental execution, and monitor verified revenue.
          </p>
        </div>

        <Link href="/dashboard/products/new">
          <Button size="sm" variant="glow" className="gap-1.5 text-xs">
            <PlusCircle className="h-4 w-4" />
            Create New Project
          </Button>
        </Link>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium block">Projects Owned</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{projects.length}</p>
          <span className="text-[10px] text-zinc-500 block">Active ventures</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium block">Pending Applications</span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {totalPendingApplications}
          </p>
          <span className="text-[10px] text-zinc-500 block">Awaiting your review</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium block">Team Members</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {totalTeamMembers}
          </p>
          <span className="text-[10px] text-zinc-500 block">Across departments</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium block">Open Deliverables</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {totalOpenTasks}
          </p>
          <span className="text-[10px] text-zinc-500 block">In progress & review</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium block">Gross Sales</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {formatCents(grossSalesCents)}
          </p>
          <span className="text-[10px] text-zinc-500 block">Verified revenue</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium block">Net Revenue</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCents(netOwnerRevenueCents)}
          </p>
          <span className="text-[10px] text-zinc-500 block">After commissions</span>
        </Card>
      </div>

      {/* Contributor Applications Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-500" />
              Contributor Applications Awaiting Review
            </h2>
            <p className="text-xs text-zinc-500">
              Review candidate cover statements, execution strategies, and assign accepted contributors to departments.
            </p>
          </div>
        </div>

        <FounderApplicationsClient initialApplications={allApplications} />
      </div>

      {/* Projects Management Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-indigo-500" />
              Your Ventures & Projects
            </h2>
            <p className="text-xs text-zinc-500">
              Direct access to authorized project workspaces, milestone roadmaps, and tasks.
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <Card className="p-12 text-center border-dashed space-y-3">
            <FolderKanban className="h-10 w-10 text-zinc-400 mx-auto" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              You haven&apos;t published any business projects yet.
            </p>
            <Link href="/dashboard/products/new">
              <Button size="sm" variant="default">
                Publish Your First Project
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <Card
                key={p.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {p.category}
                    </Badge>
                    <Badge variant="default" className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                      Stage: {p.businessStage}
                    </Badge>
                    <Badge variant={p.status === "ACTIVE" ? "success" : "secondary"} className="text-[10px]">
                      {p.status}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    <Link href={`/products/${p.slug}`} className="hover:text-indigo-600 transition-colors">
                      {p.name}
                    </Link>
                  </h3>

                  <p className="text-xs text-zinc-500 line-clamp-1">{p.shortDesc}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 pt-1">
                    <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                      <Users className="h-3 w-3 text-indigo-500" />
                      {p.projectMembers.length} Team Members
                    </span>
                    <span className="flex items-center gap-1">
                      <ListTodo className="h-3 w-3 text-sky-500" />
                      {p.tasks.length} Deliverables ({p.tasks.filter((t) => t.status === "DONE").length} completed)
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      {p.milestones.length} Milestones
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Link href={`/products/${p.slug}`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      Public Page
                    </Button>
                  </Link>

                  <Link href={`/products/${p.slug}/workspace`}>
                    <Button size="sm" variant="glow" className="text-xs gap-1.5 font-semibold">
                      Open Workspace
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Orders & Auditable Ledger Reconciliations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verified Customer Transactions & Commission Liability</CardTitle>
          <CardDescription>
            Audit trail of customer purchases, attributed sales, and reversible transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allOrders.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500">
              No customer orders recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {allOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        Order #{order.orderNumber}
                      </span>
                      <span className="text-zinc-500 font-medium">({order.productName})</span>
                      <Badge
                        variant={order.status === "COMPLETED" ? "success" : "destructive"}
                        className="text-[10px]"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-zinc-500 mt-0.5">
                      Customer: {order.customerEmail} • Amount: {formatCents(order.grossAmountCents, order.currency)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.status === "COMPLETED" && (
                      <OwnerRefundClient orderId={order.id} orderNumber={order.orderNumber} />
                    )}
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
