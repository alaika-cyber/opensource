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
        <Badge variant="default">End-to-End Operating Model</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          How OpenSource Works
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
          The global infrastructure connecting ambitious product creators with independent growth syndicates through transparent, attributable commission agreements.
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
                Workflow A: Product Owner Initiated
              </h2>
              <p className="text-xs text-zinc-500">From product listing to active commercial syndicate</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-indigo-500">Step 1</span>
              <h4 className="font-semibold text-sm">Publish Product</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Define commercial commission rate, pricing, and required marketing skills.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-indigo-500">Step 2</span>
              <h4 className="font-semibold text-sm">Review Applications</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Receive proposals from vetted syndicates or invite specialized talent.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-indigo-500">Step 3</span>
              <h4 className="font-semibold text-sm">Agree to Terms</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Sign tamper-evident agreements with SHA256 checksums and clear attribution windows.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-indigo-500">Step 4</span>
              <h4 className="font-semibold text-sm">Verified Payouts</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Platform reconciles orders and coordinates eligible payouts automatically.
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
                Workflow B: Professional-Led Syndicate
              </h2>
              <p className="text-xs text-zinc-500">Professionals assemble first and source high-leverage products</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-violet-500">Step 1</span>
              <h4 className="font-semibold text-sm">Form Syndicate</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Unite strategists, closers, and creators. Define internal revenue splits.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-violet-500">Step 2</span>
              <h4 className="font-semibold text-sm">Discover Products</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Search catalogue for high-margin SaaS, AI tools, or digital products.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-violet-500">Step 3</span>
              <h4 className="font-semibold text-sm">Pitch Campaign</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Submit campaign strategy and agreed terms directly to the owner.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
              <span className="text-xs font-bold text-violet-500">Step 4</span>
              <h4 className="font-semibold text-sm">Execute & Earn</h4>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Generate verified sales and receive transparent revenue splits in real-time.
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
