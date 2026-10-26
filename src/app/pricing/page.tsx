import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles, HelpCircle } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="default">Transparent Monetization</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Simple, Fair, Result-Based Pricing
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
          OpenSource charges zero membership fees, zero listing fees, and zero upfront platform charges. We succeed only when your collaborative campaigns succeed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Free Core Tier */}
        <Card className="flex flex-col justify-between p-6 border-zinc-200 dark:border-zinc-800">
          <div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Access</span>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">Platform Free</h3>
            <p className="text-xs text-zinc-500 mt-1">Everything you need to discover, assemble, and agree.</p>

            <div className="my-6">
              <span className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">$0</span>
              <span className="text-xs text-zinc-400"> / forever</span>
            </div>

            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Unlimited product browsing & team discovery</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Publish unlimited product listings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Create and join unlimited growth teams</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Tamper-evident agreement contracts with SHA256</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Task management & team discussion boards</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-6">
            <Link href="/create-account">
              <Button variant="outline" className="w-full">
                Get Started Free
              </Button>
            </Link>
          </div>
        </Card>

        {/* 5% Disclosed Fee Tier */}
        <Card className="flex flex-col justify-between p-6 border-indigo-200 dark:border-indigo-900/80 bg-indigo-50/20 dark:bg-indigo-950/20 relative shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Attributed Revenue Sharing
              </span>
              <Badge variant="default">Disclosed Fee</Badge>
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">Platform Settlement</h3>
            <p className="text-xs text-zinc-500 mt-1">Applied only upon verified paid contributor commissions.</p>

            <div className="my-6">
              <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">5.0%</span>
              <span className="text-xs text-zinc-500"> of paid contributor commissions</span>
            </div>

            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Zero charge if no sales are generated</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Automated attribution verification & reconciliation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Double-entry penny-perfect financial ledger</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Automated clawback & refund adjustments</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Platform mediation and dispute resolution</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-indigo-100 dark:border-indigo-900/60 mt-6">
            <Link href="/create-account">
              <Button variant="glow" className="w-full gap-2">
                Start Collaborating
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Transparent Fee Math Callout */}
      <Card className="p-6 bg-zinc-50 dark:bg-zinc-900/50 space-y-3">
        <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-indigo-500" />
          Example Fee Mathematics
        </h4>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Suppose a product sale is verified at <strong>$1,000.00</strong> with an agreed <strong>20% team commission pool ($200.00)</strong>.
          OpenSource deducts exactly <strong>5% of the contributor commission ($10.00)</strong>.
          The team receives <strong>$190.00</strong> net, distributed penny-perfectly according to agreed member percentages. The product owner keeps <strong>$800.00</strong> net.
        </p>
      </Card>
    </div>
  );
}
