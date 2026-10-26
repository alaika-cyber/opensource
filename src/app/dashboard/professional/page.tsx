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
} from "lucide-react";

export default async function ProfessionalDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const payableBalanceCents = await getUserPayableBalance(user.id);

  // Fetch professional commissions
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

  // User's active team memberships
  const memberships = await db.teamMember.findMany({
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Professional Performance Hub
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Track attributable sales, active team splits, and verified commission earnings.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Available to Withdraw</span>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatCents(payableBalanceCents)}
          </p>
          <span className="text-[11px] text-zinc-500 block">Verified ledger balance</span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Net Commissions</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCents(totalNetCents)}
          </p>
          <span className="text-[11px] text-zinc-500 block">After 5% platform fee</span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Gross Pool Share</span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatCents(totalGrossCents)}
          </p>
          <span className="text-[11px] text-zinc-500 block">Prior to platform fee</span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Disclosed Platform Fees</span>
          <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">
            {formatCents(totalFeesPaidCents)}
          </p>
          <span className="text-[11px] text-zinc-500 block">5% service fee</span>
        </Card>
      </div>

      {/* Referral Links Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-indigo-500" />
            Your Tracked Referral Links
          </CardTitle>
          <CardDescription>
            Unique cryptographic attribution codes for qualifying sales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralLinks.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500">
              No referral links active yet. Join an active team campaign or generate one in your team workspace.
            </div>
          ) : (
            <div className="space-y-3">
              {referralLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {link.product.name}
                    </span>
                    <p className="text-zinc-500 mt-0.5 font-mono text-[11px] break-all">
                      {link.targetUrl}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-500">
                      Clicks: <strong className="text-zinc-800 dark:text-zinc-200">{link.clickCount}</strong>
                    </span>
                    <Badge variant="secondary">Code: {link.code}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teams and Splits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-500" />
            Active Growth Syndicates
          </CardTitle>
          <CardDescription>
            Teams you belong to and your agreed percentage of the team commission pool.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {memberships.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500">
              You are not a member of any teams yet.
            </div>
          ) : (
            <div className="space-y-3">
              {memberships.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs"
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
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-400 block">Agreed Split</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        {formatBps(m.allocationBps)}
                      </span>
                    </div>
                    <Link href={`/dashboard/teams/${m.team.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        Open Workspace
                      </Button>
                    </Link>
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
