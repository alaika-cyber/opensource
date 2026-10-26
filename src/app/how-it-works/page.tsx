import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase,
  Layers,
  Scale,
  DollarSign,
  FileCheck,
} from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="default">Business Execution Operating Model</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          How OpenSource Works
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
          The collaborative infrastructure connecting ambitious founders, startups, and product owners with skilled professionals across engineering, marketing, sales, and design to build and grow businesses.
        </p>
      </div>

      {/* Dual Workflows */}
      <div className="space-y-12">
        {/* Workflow A */}
        <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Founder-Led Business Projects
              </h2>
              <p className="text-xs text-zinc-500">From project opportunity to structured team execution</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-indigo-500">Step 1</span>
              <h4 className="font-semibold text-sm">Publish Project</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Define business goals, stage, required skills, open positions, and compensation model (commissions, milestones, or equity).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-indigo-500">Step 2</span>
              <h4 className="font-semibold text-sm">Review & Onboard</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Review applicant portfolios and accept members directly into dedicated project departments (Marketing, Sales, Engineering, Design).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-indigo-500">Step 3</span>
              <h4 className="font-semibold text-sm">Execute in Workspace</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Coordinate sprints, assign tasks, schedule video meetings, craft business plans, track CRM leads, and log decisions.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-indigo-500">Step 4</span>
              <h4 className="font-semibold text-sm">Track Milestones & Payouts</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Attributed commercial sales and completed milestones are recorded in a tamper-evident integer ledger for transparent settlement.
              </p>
            </div>
          </div>
        </div>

        {/* Workflow B */}
        <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-600/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 flex items-center justify-center font-bold">
              B
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Specialist & Syndicate Collaboration
              </h2>
              <p className="text-xs text-zinc-500">Professionals discover high-impact ventures and deliver measurable outcomes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-violet-500">Step 1</span>
              <h4 className="font-semibold text-sm">Discover Opportunities</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Browse projects spanning physical consumer goods, SaaS, AI tools, and startups by business stage and required skills.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-violet-500">Step 2</span>
              <h4 className="font-semibold text-sm">Apply with Terms</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Submit your proposed role, capabilities, and requested compensation structure directly to the project founder.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-violet-500">Step 3</span>
              <h4 className="font-semibold text-sm">Enter Workspace</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Collaborate in real time: take ownership of tasks, attend video calls, share confidential briefs, and drive deliverables.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-violet-500">Step 4</span>
              <h4 className="font-semibold text-sm">Earn & Build Reputation</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Receive mathematically verified commission splits, milestone fees, or equity arrangements, and build a verifiable track record.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-8">
        <Link href="/create-account">
          <Button size="lg" variant="glow" className="gap-2">
            Get Started Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
