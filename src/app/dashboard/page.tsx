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
  FolderKanban,
  Sparkles,
  ListTodo,
  Calendar,
  MessageSquare,
  Bell,
  ExternalLink,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";

export default async function PersonalDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const payableBalanceCents = await getUserPayableBalance(user.id);

  // 1. Projects Owned
  const ownedProjects = await db.product.findMany({
    where: { ownerId: user.id },
    include: {
      projectMembers: true,
      tasks: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Projects as Member
  const memberProjects = await db.projectMember.findMany({
    where: { userId: user.id },
    include: {
      project: {
        include: {
          owner: true,
          tasks: true,
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  // 3. User's Applications to join projects
  const myApplications = await db.opportunityApplication.findMany({
    where: { applicantUserId: user.id },
    include: {
      opportunity: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 4. Assigned Tasks
  const assignedTasks = await db.teamTask.findMany({
    where: { assigneeId: user.id, status: { in: ["TODO", "IN_PROGRESS", "REVIEW"] } },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      team: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // 5. Upcoming Meetings
  const now = new Date();
  const allProjectIds = [
    ...ownedProjects.map((p) => p.id),
    ...memberProjects.map((m) => m.project.id),
  ];

  const upcomingMeetings = await db.projectMeeting.findMany({
    where: {
      projectId: { in: allProjectIds },
      scheduledAt: { gte: now },
      status: "SCHEDULED",
    },
    include: {
      project: { select: { id: true, name: true, slug: true } },
      creator: { select: { id: true, name: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: 4,
  });

  // 6. Recent Notifications
  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  // 7. Verified Commission & Contribution History
  const commissions = await db.commissionEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        include: { product: true },
      },
      team: true,
    },
    take: 4,
  });

  const confirmedCommissions = await db.commissionEntry.aggregate({
    where: { userId: user.id, status: { in: ["CONFIRMED", "PAYABLE"] } },
    _sum: { netCommissionCents: true },
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 mb-1.5">
            <Sparkles className="h-3 w-3" />
            Personal Collaboration Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monitor your ventures, active applications, assigned deliverables, and upcoming meetings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/products/new">
            <Button size="sm" variant="glow" className="gap-1.5 text-xs">
              <PlusCircle className="h-4 w-4" />
              Publish Project
            </Button>
          </Link>
          <Link href="/products">
            <Button size="sm" variant="outline" className="text-xs">
              Discover Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium block">My Projects</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{ownedProjects.length}</p>
          <span className="text-[10px] text-zinc-500 block">Founding ventures</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium block">Contributed Ventures</span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{memberProjects.length}</p>
          <span className="text-[10px] text-zinc-500 block">Active memberships</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium block">My Applications</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{myApplications.length}</p>
          <span className="text-[10px] text-zinc-500 block">Submitted roles</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium block">Assigned Tasks</span>
          <p className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">{assignedTasks.length}</p>
          <span className="text-[10px] text-zinc-500 block">Pending deliverables</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium block">Commissions Earned</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCents(confirmedCommissions._sum.netCommissionCents || 0)}
          </p>
          <span className="text-[10px] text-zinc-500 block">Verified splits</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] text-zinc-400 font-medium block">Available Payout</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {formatCents(payableBalanceCents)}
          </p>
          <span className="text-[10px] text-zinc-500 block">Ready to withdraw</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Projects, Applications & Tasks */}
        <div className="lg:col-span-8 space-y-8">
          {/* Active Projects (Owned & Member) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-indigo-500" />
                  My Active Projects & Workspaces
                </h2>
                <p className="text-xs text-zinc-500">
                  Projects you own or contribute to as an authorized collaborator.
                </p>
              </div>
              <Link href="/dashboard/owner">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                  Manage Ventures →
                </Button>
              </Link>
            </div>

            {ownedProjects.length === 0 && memberProjects.length === 0 ? (
              <Card className="p-8 text-center text-xs text-zinc-500 border-dashed space-y-2">
                <FolderKanban className="h-8 w-8 text-zinc-400 mx-auto" />
                <p>You haven&apos;t created or joined any business projects yet.</p>
                <div className="pt-2 flex justify-center gap-2">
                  <Link href="/dashboard/products/new">
                    <Button size="sm" variant="default">Create Project</Button>
                  </Link>
                  <Link href="/products">
                    <Button size="sm" variant="outline">Discover Projects</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ownedProjects.map((p) => (
                  <Card key={p.id} className="p-4 space-y-3 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <Badge variant="default" className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                          Founder
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">{p.businessStage}</Badge>
                      </div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        <Link href={`/products/${p.slug}/workspace`} className="hover:text-indigo-600 transition-colors">
                          {p.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{p.shortDesc}</p>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                      <span>{p.projectMembers.length} Members</span>
                      <Link href={`/products/${p.slug}/workspace`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Workspace →
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}

                {memberProjects.map((m) => (
                  <Card key={m.id} className="p-4 space-y-3 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <Badge variant="secondary" className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                          {m.role}
                        </Badge>
                        <span className="text-[10px] text-zinc-400">{m.department}</span>
                      </div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        <Link href={`/products/${m.project.slug}/workspace`} className="hover:text-indigo-600 transition-colors">
                          {m.project.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{m.project.shortDesc}</p>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                      <span>Founder: {m.project.owner.name}</span>
                      <Link href={`/products/${m.project.slug}/workspace`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          Workspace →
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* My Applications & Recruitment Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-violet-500" />
                  My Applications to Join Projects
                </h2>
                <p className="text-xs text-zinc-500">
                  Track status of applications you submitted to project founders.
                </p>
              </div>
              <Link href="/dashboard/professional">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                  Full View →
                </Button>
              </Link>
            </div>

            {myApplications.length === 0 ? (
              <Card className="p-6 text-center text-xs text-zinc-500 border-dashed">
                You haven&apos;t applied to any projects yet. Discover open roles in the marketplace.
              </Card>
            ) : (
              <div className="space-y-2.5">
                {myApplications.map((app) => (
                  <Card key={app.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {app.opportunity.product.name}
                        </span>
                        <Badge
                          variant={
                            app.status === "ACCEPTED"
                              ? "success"
                              : app.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-zinc-500 text-[11px] mt-0.5">
                        Role: {app.proposedRole || "Contributor"} • Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {app.status === "ACCEPTED" ? (
                        <Link href={`/products/${app.opportunity.product.slug}/workspace`}>
                          <Button size="sm" variant="glow" className="h-7 text-xs font-semibold">
                            Open Workspace →
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/products/${app.opportunity.product.slug}`}>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            View Project
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Tasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-sky-500" />
                  Deliverables Assigned to Me
                </h2>
                <p className="text-xs text-zinc-500">
                  Execution items requiring your attention across projects.
                </p>
              </div>
              <Link href="/dashboard/tasks">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                  Tasks Board →
                </Button>
              </Link>
            </div>

            {assignedTasks.length === 0 ? (
              <Card className="p-6 text-center text-xs text-zinc-500 border-dashed">
                No active tasks currently assigned to you.
              </Card>
            ) : (
              <div className="space-y-2">
                {assignedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block truncate">
                        {t.title}
                      </span>
                      <span className="text-[11px] text-zinc-400 block">
                        Project: {t.project?.name || t.team?.name || "General"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="default" className="text-[10px]">
                        {t.status}
                      </Badge>
                      <Link href={t.project ? `/products/${t.project.slug}/workspace?tab=tasks` : "/dashboard/tasks"}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upcoming Meetings, Notifications, Contribution History */}
        <div className="lg:col-span-4 space-y-6">
          {/* Upcoming Meetings */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-500" />
                Upcoming Meetings
              </h3>
              <Link href="/dashboard/meetings" className="text-xs text-indigo-600 hover:underline">
                View All
              </Link>
            </div>

            {upcomingMeetings.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No upcoming sessions scheduled.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingMeetings.map((m) => (
                  <div key={m.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-xs space-y-1">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 block truncate">
                      {m.title}
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 block">
                      {new Date(m.scheduledAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {m.meetingUrl && (
                      <a
                        href={m.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1 pt-1"
                      >
                        Join Call <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Activity & Alerts */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-500" />
                Notifications
              </h3>
              <Link href="/dashboard/notifications" className="text-xs text-indigo-600 hover:underline">
                All Alerts
              </Link>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No new alerts.</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 text-xs space-y-0.5">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{n.title}</p>
                    <p className="text-zinc-500 text-[11px] line-clamp-2">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Verified Contribution History */}
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Verified Contributions
              </h3>
              <Link href="/dashboard/payouts" className="text-xs text-indigo-600 hover:underline">
                Ledger
              </Link>
            </div>

            {commissions.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">
                Verified revenue splits will be credited as commercial milestones occur.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {commissions.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                        {c.order.product.name}
                      </span>
                      <span className="text-[10px] text-zinc-400">Order #{c.order.orderNumber}</span>
                    </div>
                    <span className="font-bold text-emerald-600">+{formatCents(c.netCommissionCents)}</span>
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
