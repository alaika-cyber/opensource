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
  TrendingUp,
  Link as LinkIcon,
  Users,
  Award,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  FileText,
  AlertCircle,
  Video,
} from "lucide-react";

export default async function ProfessionalDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const payableBalanceCents = await getUserPayableBalance(user.id);

  // User's active project memberships
  const projectMemberships = await db.projectMember.findMany({
    where: { userId: user.id },
    include: {
      project: true,
    },
    orderBy: { joinedAt: "desc" },
  });

  // User's submitted applications
  const applications = await db.opportunityApplication.findMany({
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

  // User's assigned tasks
  const assignedTasks = await db.teamTask.findMany({
    where: { assigneeId: user.id },
    include: {
      project: true,
      team: true,
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // User's upcoming meetings across projects they are a member of
  const projectIds = projectMemberships.map((m) => m.projectId);
  const upcomingMeetings = projectIds.length > 0 ? await db.projectMeeting.findMany({
    where: {
      projectId: { in: projectIds },
      scheduledAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    include: {
      project: true,
    },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  }) : [];

  // Fetch professional commissions & financial records
  const commissions = await db.commissionEntry.findMany({
    where: { userId: user.id },
    include: {
      order: {
        include: { product: true },
      },
      team: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalGrossCents = commissions.reduce((sum, c) => sum + c.grossCommissionCents, 0);
  const totalNetCents = commissions.reduce((sum, c) => sum + c.netCommissionCents, 0);
  const totalFeesPaidCents = commissions.reduce((sum, c) => sum + c.platformFeeCents, 0);

  // User's referral links
  const referralLinks = await db.referralLink.findMany({
    where: { userId: user.id },
    include: {
      product: true,
      team: true,
    },
  });

  // User's active syndicate memberships
  const syndicates = await db.teamMember.findMany({
    where: { userId: user.id },
    include: {
      team: {
        include: {
          leader: true,
          members: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Professional Performance Hub
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track active project workspaces, applications, assigned tasks, and verified compensation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="default" size="sm" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Discover Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Active Workspaces</span>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {projectMemberships.length}
          </p>
          <span className="text-[11px] text-zinc-500 block">Projects you contribute to</span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Submitted Applications</span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {applications.length}
          </p>
          <span className="text-[11px] text-zinc-500 block">
            {applications.filter((a) => a.status === "PENDING" || a.status === "UNDER_REVIEW").length} pending review
          </span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Assigned Deliverables</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {assignedTasks.filter((t) => t.status !== "DONE").length}
          </p>
          <span className="text-[11px] text-zinc-500 block">Open tasks across projects</span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Available Balance</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCents(payableBalanceCents)}
          </p>
          <span className="text-[11px] text-zinc-500 block">Verified ledger balance</span>
        </Card>
      </div>

      {/* Section 1: Active Project Workspaces */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                Active Project Workspaces
              </CardTitle>
              <CardDescription>
                Business projects where you are a confirmed team member.
              </CardDescription>
            </div>
            <Link href="/products">
              <Button size="sm" variant="outline" className="text-xs">
                Explore More
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {projectMemberships.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                You haven&apos;t joined any project workspaces yet
              </p>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Explore open opportunities to join growing SaaS, AI, consumer brands, or startup teams.
              </p>
              <div className="pt-3">
                <Link href="/products">
                  <Button size="sm" variant="default" className="text-xs">
                    Browse Open Opportunities
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectMemberships.map((membership) => (
                <div
                  key={membership.id}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {membership.project.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {membership.department}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {membership.role}
                        </Badge>
                        {membership.project.businessStage && (
                          <span className="text-[10px] text-zinc-400">
                            • {membership.project.businessStage}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge variant="success" className="text-[10px]">
                      {membership.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {membership.project.shortDesc}
                  </p>

                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">
                      Joined {new Date(membership.joinedAt).toLocaleDateString()}
                    </span>
                    <Link href={`/products/${membership.project.slug}/workspace`}>
                      <Button size="sm" variant="glow" className="text-xs gap-1.5 h-8">
                        Enter Workspace
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Submitted Project Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-violet-500" />
            Submitted Project Applications
          </CardTitle>
          <CardDescription>
            Status of your applications to join project teams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500">
              You have not submitted any project applications yet.
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${app.opportunity.product.slug}`}
                        className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 transition-colors"
                      >
                        {app.opportunity.product.name}
                      </Link>
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
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                      Proposed Role: <strong className="text-zinc-800 dark:text-zinc-200">{app.proposedRole || "General Contributor"}</strong>
                      {app.requestedCompensation && (
                        <span> • Requested: {app.requestedCompensation}</span>
                      )}
                    </p>
                    {app.reviewNotes && (
                      <p className="text-[11px] text-zinc-500 italic mt-1">
                        Feedback: &quot;{app.reviewNotes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[11px] text-zinc-400">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                    {app.status === "ACCEPTED" && (
                      <Link href={`/products/${app.opportunity.product.slug}/workspace`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          Workspace
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 3 & 4: Assigned Tasks & Upcoming Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Assigned Deliverables */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Your Assigned Deliverables
            </CardTitle>
            <CardDescription>
              Tasks and deliverables assigned to you across projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignedTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">
                No deliverables currently assigned.
              </div>
            ) : (
              <div className="space-y-2.5">
                {assignedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {task.title}
                      </p>
                      <p className="text-zinc-400 text-[11px] mt-0.5">
                        {task.project?.name || task.team?.name} {task.department ? `• ${task.department}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          task.status === "DONE"
                            ? "success"
                            : task.status === "IN_PROGRESS"
                            ? "default"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {task.status}
                      </Badge>
                      <Badge
                        variant={
                          task.priority === "URGENT" || task.priority === "HIGH"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              Upcoming Meetings
            </CardTitle>
            <CardDescription>
              Scheduled team syncs and review meetings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">
                No upcoming meetings scheduled.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {m.title}
                      </p>
                      <p className="text-zinc-400 text-[11px] mt-0.5">
                        {m.project.name} • {new Date(m.scheduledAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })} ({m.timezone})
                      </p>
                    </div>
                    {m.meetingUrl ? (
                      <a href={m.meetingUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          <Video className="h-3 w-3" />
                          Join
                        </Button>
                      </a>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        {m.durationMinutes} min
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Syndicates & Financial Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Syndicates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-500" />
              Active Growth Syndicates
            </CardTitle>
            <CardDescription>
              Syndicates and sales teams with agreed commission allocations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {syndicates.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">
                You are not a member of any syndicates yet.
              </div>
            ) : (
              <div className="space-y-3">
                {syndicates.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <Link
                        href={`/dashboard/teams/${m.team.id}`}
                        className="font-bold text-sm text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 transition-colors"
                      >
                        {m.team.name}
                      </Link>
                      <p className="text-zinc-500 mt-0.5">Role: {m.role} • Leader: {m.team.leader.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block">Agreed Split</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                          {formatBps(m.allocationBps)}
                        </span>
                      </div>
                      <Link href={`/dashboard/teams/${m.team.id}`}>
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          Workspace
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tracked Referral Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-indigo-500" />
              Tracked Attribution Links
            </CardTitle>
            <CardDescription>
              Attribution codes for qualifying commercial sales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referralLinks.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">
                No attribution links active yet.
              </div>
            ) : (
              <div className="space-y-3">
                {referralLinks.map((link) => (
                  <div
                    key={link.id}
                    className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {link.product.name}
                      </span>
                      <p className="text-zinc-500 mt-0.5 font-mono text-[11px] truncate max-w-xs">
                        {link.targetUrl}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 text-[11px]">
                        Clicks: <strong>{link.clickCount}</strong>
                      </span>
                      <Badge variant="secondary" className="text-[10px]">Code: {link.code}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
