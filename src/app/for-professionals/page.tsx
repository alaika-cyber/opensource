import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Award,
  Users,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  PieChart,
} from "lucide-react";

export default function ForProfessionalsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="default">Commercial Execution Freedom</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Turn Your Growth Skills Into High-Leverage Equity & Earnings
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
          OpenSource is the platform for elite independent growth strategists, B2B closers, and technical creators who want to build attributable track records and earn transparent commissions.
        </p>
        <div className="pt-2">
          <Link href="/create-account">
            <Button size="lg" variant="glow" className="gap-2">
              Join as a Professional
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Award className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Attributable Track Record</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Every dollar in commercial sales you generate is cryptographically verified on your public profile, proving your actual value.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
            <PieChart className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Team Revenue Sharing</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Form or join growth syndicates where commission pools are split mathematically in integer minor units according to member agreements.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Recurring SaaS Commissions</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Earn continuous recurring commissions on monthly subscription products with transparent attribution windows.
          </p>
        </Card>
      </div>
    </div>
  );
}
