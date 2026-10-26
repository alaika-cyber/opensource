import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  ShieldCheck,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
} from "lucide-react";

export default function ForProductOwnersPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="default">Zero Upfront Ad Spend</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Scale Global Sales With Verified Execution Teams
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
          OpenSource connects you with independent growth syndicates who market and sell your product in exchange for an agreed percentage of verified commercial results.
        </p>
        <div className="pt-2">
          <Link href="/dashboard/products/new">
            <Button size="lg" variant="glow" className="gap-2">
              List Your Product
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <DollarSign className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Performance-Only Capital</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Stop losing budget on unproven marketing agencies and rising ad costs. Pay commissions solely after customer transactions clear.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Multidisciplinary Syndicates</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Gain complete teams—including outbound closers, technical writers, and growth hackers—without full-time hiring liabilities.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Tamper-Evident Terms</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Every commercial agreement is versioned and secured with SHA256 checksums to safeguard all parties against unilateral changes.
          </p>
        </Card>
      </div>
    </div>
  );
}
