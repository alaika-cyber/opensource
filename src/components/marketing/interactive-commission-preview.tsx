"use client";

import React, { useState } from "react";
import { formatCents, formatBps } from "@/lib/utils";
import { calculateCommissions } from "@/lib/commission";
import { Users, DollarSign, Percent, Shield, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function InteractiveCommissionPreview() {
  const [productPriceDollars, setProductPriceDollars] = useState(199);
  const [unitsSold, setUnitsSold] = useState(25);
  const [poolBps, setPoolBps] = useState(2500); // 25.00%
  const [leaderBps, setLeaderBps] = useState(4000); // 40%
  const [closerBps, setCloserBps] = useState(3500); // 35%
  const marketerBps = 10000 - (leaderBps + closerBps);

  const grossSaleCents = productPriceDollars * unitsSold * 100;

  const calculation = calculateCommissions({
    grossSaleCents: grossSaleCents > 0 ? grossSaleCents : 100,
    commissionPoolBps: poolBps,
    platformFeeBps: 500, // 5.00%
    memberAllocations: [
      { userId: "lead-1", memberRole: "Growth Architect", allocationBps: leaderBps },
      { userId: "close-1", memberRole: "Outbound Closer", allocationBps: closerBps },
      { userId: "mark-1", memberRole: "Content Strategist", allocationBps: marketerBps },
    ],
  });

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50/50 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800/80">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="default" className="mb-3">
            <Sparkles className="h-3 w-3 mr-1" /> Interactive Revenue Engine
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Simulate Collaborative Revenue Sharing
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
            See how transparent commission pools divide verified sales between product owners and multidisciplinary growth teams with zero hidden fees.
          </p>
          <p className="mt-1 text-xs text-zinc-400 italic">
            *Illustrative simulation tool. Actual earnings depend on agreed terms and verified orders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Campaign Parameters</CardTitle>
                <CardDescription>
                  Configure product pricing, sales volume, and agreed commission pool.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-zinc-600 dark:text-zinc-400">Product Price</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      ${productPriceDollars}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="10"
                    value={productPriceDollars}
                    onChange={(e) => setProductPriceDollars(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-zinc-600 dark:text-zinc-400">Verified Monthly Units</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {unitsSold} units
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={unitsSold}
                    onChange={(e) => setUnitsSold(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-zinc-600 dark:text-zinc-400">Commission Pool</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatBps(poolBps)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={poolBps}
                    onChange={(e) => setPoolBps(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <span className="text-xs text-zinc-400">Percentage of qualifying sales allocated to the team</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Internal Team Allocation</CardTitle>
                <CardDescription>
                  Defined and accepted by the team before commercial work starts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-600 dark:text-zinc-400">Lead Strategist</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatBps(leaderBps)}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="6000"
                    step="500"
                    value={leaderBps}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val + closerBps < 10000) setLeaderBps(val);
                    }}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-600 dark:text-zinc-400">Outbound Closer</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{formatBps(closerBps)}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="6000"
                    step="500"
                    value={closerBps}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val + leaderBps < 10000) setCloserBps(val);
                    }}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 flex justify-between items-center text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">Content & Marketing Specialist</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatBps(marketerBps)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Preview */}
          <div className="lg:col-span-7 space-y-6">
            {/* High level financial outcome */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <span className="text-xs text-zinc-500 font-medium">Gross Sales Volume</span>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {formatCents(grossSaleCents)}
                </p>
                <span className="text-xs text-zinc-400 mt-1 block">From verified orders</span>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm">
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Team Commission Pool</span>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">
                  {formatCents(calculation.totalCommissionPoolCents)}
                </p>
                <span className="text-xs text-indigo-500/80 mt-1 block">{formatBps(poolBps)} of gross sales</span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <span className="text-xs text-zinc-500 font-medium">Product Owner Net</span>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatCents(grossSaleCents - calculation.totalCommissionPoolCents)}
                </p>
                <span className="text-xs text-zinc-400 mt-1 block">Zero upfront ad spend</span>
              </div>
            </div>

            {/* Member distribution details */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Member Settlement Breakdown</CardTitle>
                    <CardDescription>
                      Calculated in precise minor units with platform fee disclosure.
                    </CardDescription>
                  </div>
                  <Badge variant="success">Reconciled</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {calculation.memberDistributions.map((dist, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {dist.memberRole}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                        <span>Share: {formatBps(dist.allocationBps)}</span>
                        <span>•</span>
                        <span>Gross: {formatCents(dist.grossCommissionCents)}</span>
                        <span>•</span>
                        <span>Platform fee (5%): {formatCents(dist.platformFeeCents)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block">Net Payout</span>
                      <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                        {formatCents(dist.netCommissionCents)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-indigo-500" />
                    <span>Protected by tamper-evident agreement checksums & SHA256 audit logs</span>
                  </div>
                  <span>Total Platform Fee: {formatCents(calculation.totalPlatformFeeCents)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
