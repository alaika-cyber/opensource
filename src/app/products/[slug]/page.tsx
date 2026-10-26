import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatCents, formatBps } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
} from "lucide-react";
import { ProductPurchaseClient } from "./product-purchase-client";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string }>;
}

export default async function ProductDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { ref: referralCode } = await searchParams;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      owner: {
        include: {
          profile: true,
        },
      },
      opportunities: {
        where: { isOpen: true },
      },
      agreements: {
        where: { status: "ACTIVE" },
        include: {
          team: {
            include: {
              members: {
                include: { user: true },
              },
            },
          },
        },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { author: true },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
        <Link href="/products" className="hover:text-indigo-600 transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-zinc-700 dark:text-zinc-300 font-medium">{product.category}</span>
        <span>/</span>
        <span className="truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Info & Opportunities */}
        <div className="lg:col-span-8 space-y-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <Badge variant="secondary">{product.category}</Badge>
              {product.isVerified && (
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Product
                </Badge>
              )}
              {referralCode && (
                <Badge variant="default" className="bg-indigo-600/10 text-indigo-700 dark:text-indigo-300">
                  Attributed Referral: {referralCode}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              {product.name}
            </h1>
            <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {product.shortDesc}
            </p>
          </div>

          {/* Media / Image Display */}
          {product.images && product.images.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 aspect-video relative">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Detailed Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Product Overview
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Target Audience & Fulfillment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {product.targetAudience && (
              <Card className="p-4">
                <span className="text-xs text-zinc-400 font-medium block mb-1">Target Customers</span>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {product.targetAudience}
                </p>
              </Card>
            )}
            {product.websiteUrl && (
              <Card className="p-4">
                <span className="text-xs text-zinc-400 font-medium block mb-1">Official Website</span>
                <a
                  href={product.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                >
                  Visit External Site
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Card>
            )}
          </div>

          {/* Open Commercial Opportunities */}
          <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Growth Opportunities & Roles
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  The product owner is actively looking for growth teams and sales specialists.
                </p>
              </div>
            </div>

            {product.opportunities.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  No specialized roles currently open. Teams may still pitch a commercial growth campaign directly to the owner.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {product.opportunities.map((opp) => (
                  <Card key={opp.id} className="p-5">
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{opp.title}</h3>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">{opp.description}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {opp.rolesNeeded.map((role) => (
                        <span key={role} className="text-[11px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full font-medium">
                          {role}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Active Collaborating Teams */}
          {product.agreements.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Active Commercial Teams
              </h2>
              <div className="space-y-3">
                {product.agreements.map((agreement) => (
                  <div
                    key={agreement.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {agreement.team?.name || "Independent Growth Syndicate"}
                      </span>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Pool: {formatBps(agreement.commissionPoolBps)} • Attribution Window: {agreement.attributionWindowDays} days
                      </p>
                    </div>
                    <Badge variant="success">Active Campaign</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing, Commission Terms & Purchase Simulator */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-indigo-200 dark:border-indigo-900/60 shadow-lg">
            <CardHeader>
              <span className="text-xs text-zinc-400 font-medium">Commercial Offering</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  {formatCents(product.priceCents, product.currency)}
                </span>
                <span className="text-xs text-zinc-500">
                  / {product.pricingModel === "SUBSCRIPTION_MONTHLY" ? "month" : "one-time"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-indigo-700 dark:text-indigo-300 font-medium">Commission Pool</span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">
                    {formatBps(product.commissionRateBps)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-500">
                  <span>Attribution Window</span>
                  <span>{product.attributionWindowDays} days</span>
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-500">
                  <span>Method</span>
                  <span>{product.attributionMethod.replace(/_/g, " ")}</span>
                </div>
                {product.recurringDurationMonths > 0 && (
                  <div className="flex justify-between items-center text-xs text-zinc-500">
                    <span>Recurring Term</span>
                    <span>{product.recurringDurationMonths} months</span>
                  </div>
                )}
              </div>

              {/* Purchase Client (Interactive simulation that writes verified orders & commissions) */}
              <ProductPurchaseClient
                productId={product.id}
                productName={product.name}
                priceCents={product.priceCents}
                currency={product.currency}
                referralCode={referralCode}
              />
            </CardContent>
          </Card>

          {/* Product Owner Card */}
          <Card className="p-5 space-y-3">
            <span className="text-xs text-zinc-400 font-medium block">Product Owner</span>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                {product.owner.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {product.owner.name}
                </p>
                <p className="text-xs text-zinc-500 truncate max-w-[200px]">
                  {product.owner.profile?.headline || "Product Founder"}
                </p>
              </div>
            </div>
            <Link href={`/professionals/${product.owner.id}`} className="block w-full">
              <Button variant="outline" size="sm" className="w-full text-xs">
                View Owner Profile
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
