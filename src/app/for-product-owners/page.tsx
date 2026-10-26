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
        <Badge variant="default">Founder & Product Owner Infrastructure</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Build & Scale Your Business With Dedicated Execution Teams
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
          OpenSource connects entrepreneurs, startups, and product owners with skilled marketing, sales, engineering, and operational specialists. Organize execution in shared workspaces and align incentives through transparent milestone fees, commissions, or equity proposals.
        </p>
        <div className="pt-2">
          <Link href="/dashboard/products/new">
            <Button size="lg" variant="glow" className="gap-2">
              Publish Your Project
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Users className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Multidisciplinary Talent</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Recruit specialists across Marketing, Sales, Engineering, Design, and Operations without the overhead and rigidity of traditional agency retainers or full-time hires.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">End-to-End Workspaces</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Organize everything in one place: task boards, time-zone scheduled meetings, confidential document sharing, business plan templates, sales CRM leads, and decision logs.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Flexible Compensation</h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Support voluntary contributions, fixed milestone payments, sales commissions, revenue shares, or proposed equity terms secured with SHA256 cryptographic checksums.
          </p>
        </Card>
      </div>
    </div>
  );
}
