import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatCents, formatBps } from "@/lib/utils";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { InteractiveCommissionPreview } from "@/components/marketing/interactive-commission-preview";

export default async function HomePage() {
  // Fetch real database records
  const featuredProducts = await db.product.findMany({
    where: { status: "ACTIVE" },
    take: 3,
    orderBy: { createdAt: "desc" },
    include: { owner: true },
  });

  const featuredTeams = await db.team.findMany({
    where: { status: "ACTIVE" },
    take: 2,
    include: {
      leader: true,
      members: {
        include: { user: true },
      },
    },
  });

  const featuredProfessionals = await db.user.findMany({
    where: {
      profile: {
        isNot: null,
      },
    },
    take: 3,
    include: {
      profile: true,
    },
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/15 via-zinc-950/0 to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Global Collaborative Commerce Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1]">
            Great Products Deserve <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-400">
              Great Teams.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            Bring products to market with independent professionals who share your ambition. Build a team, grow sales, and earn through transparent commission agreements.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/products">
              <Button size="lg" variant="glow" className="gap-2 w-full sm:w-auto">
                Explore Opportunities
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/products/new">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                List Your Product
              </Button>
            </Link>
          </div>

          {/* Social Proof & Trust Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Verified Sales Attribution</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-indigo-500" />
              <span>Tamper-Evident Agreements</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-violet-500" />
              <span>5% Disclosed Platform Fee</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Platform Preview */}
      <InteractiveCommissionPreview />

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="default" className="mb-3">
            Workflow Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            How OpenSource Works
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
            Whether you build world-class products or possess commercial execution expertise, OpenSource provides the framework to collaborate with complete clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="relative overflow-hidden border-indigo-100 dark:border-indigo-950/60">
            <div className="h-2 w-full bg-indigo-600" />
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2 font-bold">
                1
              </div>
              <CardTitle>For Product Owners</CardTitle>
              <CardDescription>
                Publish your product and specify commission pool terms. Review applications from specialized teams and unlock global distribution with zero upfront ad waste.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                <span>Versioned commission agreements</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                <span>Automated attribution & audit logs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                <span>Pay only upon verified commercial sales</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-violet-100 dark:border-violet-950/60">
            <div className="h-2 w-full bg-violet-600" />
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-2 font-bold">
                2
              </div>
              <CardTitle>For Independent Professionals</CardTitle>
              <CardDescription>
                Discover vetted products or join high-performing syndicates. Build an attributable track record of verified revenue and earn recurring commissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-violet-500" />
                <span>Verifiable sales outcomes portfolio</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-violet-500" />
                <span>Direct team invites and discovery</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-violet-500" />
                <span>Transparent payouts in integer minor units</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-emerald-100 dark:border-emerald-950/60">
            <div className="h-2 w-full bg-emerald-600" />
            <CardHeader>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 font-bold">
                3
              </div>
              <CardTitle>For Collaborative Teams</CardTitle>
              <CardDescription>
                Unite strategists, closers, and creators into dedicated commercial syndicates. Define internal revenue splits, manage tasks, and coordinate campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Pre-agreed internal revenue sharing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Collaborative workspaces and task boards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>B2B deal registration conflict resolution</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Real Product Marketplace Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-50/50 dark:bg-zinc-900/30 border-y border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="default" className="mb-2">
                Live Opportunities
              </Badge>
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Featured Product Opportunities
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
                Real published products actively seeking marketing and sales syndicates.
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="gap-2">
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="secondary">{product.category}</Badge>
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatBps(product.commissionRateBps)} Commission Pool
                    </span>
                  </div>
                  <CardTitle className="text-lg">
                    <Link href={`/products/${product.slug}`} className="hover:text-indigo-600 transition-colors">
                      {product.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.shortDesc}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 block">Price</span>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {formatCents(product.priceCents, product.currency)}
                    </span>
                  </div>
                  <Link href={`/products/${product.slug}`}>
                    <Button size="sm" variant="outline">
                      View Opportunity
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Teams & Specialists */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <Badge variant="default" className="mb-2">
              Collaborative Talent
            </Badge>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Active Growth Teams & Specialists
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
              Independent professionals forming multidisciplinary syndicates to grow products.
            </p>
          </div>
          <Link href="/teams">
            <Button variant="outline" className="gap-2">
              Explore All Teams
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredTeams.map((team) => (
            <Card key={team.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    <Link href={`/teams/${team.slug}`} className="hover:text-indigo-600 transition-colors">
                      {team.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">{team.industryFocus}</p>
                </div>
                <Badge variant="success">Active Syndicate</Badge>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {team.description}
              </p>
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-zinc-400" />
                  <span className="text-xs text-zinc-500">{team.members.length} members</span>
                </div>
                <Link href={`/teams/${team.slug}`}>
                  <Button size="sm" variant="secondary">
                    View Team Workspace
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust & Verification Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-900 text-zinc-100 border-t border-zinc-800">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <Badge variant="default" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
            Trust & Integrity Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Built on Verifiable Attribution, Not Speculation
          </h2>
          <p className="max-w-2xl mx-auto text-zinc-400 text-sm sm:text-base leading-relaxed">
            OpenSource never fabricates ratings, rankings, or earnings. Every commission requires cryptographic verification of commercial transactions and tamper-evident agreement acceptance.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-left">
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/60">
              <ShieldCheck className="h-6 w-6 text-emerald-400 mb-3" />
              <h4 className="font-semibold text-base">Attributed Evidence</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Sales qualify only through verified webhook events, registered B2B opportunities, or validated tracking attribution windows.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/60">
              <Lock className="h-6 w-6 text-indigo-400 mb-3" />
              <h4 className="font-semibold text-base">Tamper-Evident SHA256</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Agreements generate cryptographic checksums upon mutual acceptance. Existing commercial terms cannot be retroactively altered.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950/60">
              <TrendingUp className="h-6 w-6 text-violet-400 mb-3" />
              <h4 className="font-semibold text-base">Penny-Perfect Ledger</h4>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                All accounting uses integer minor units. Idempotency guarantees prevent duplicate credits, and refunds trigger auditable reversals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          Ready to Grow Together?
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
          Join product innovators and independent growth professionals executing collaborative commerce worldwide.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/create-account">
            <Button size="lg" variant="glow" className="gap-2">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
