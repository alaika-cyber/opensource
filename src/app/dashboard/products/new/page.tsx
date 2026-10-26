"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Layers, DollarSign, Percent, ArrowRight } from "lucide-react";

export default function PublishProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Developer Tools");
  const [tags, setTags] = useState("");
  const [priceDollars, setPriceDollars] = useState(199);
  const [pricingModel, setPricingModel] = useState("SUBSCRIPTION_MONTHLY");
  const [commissionRatePercent, setCommissionRatePercent] = useState(25);
  const [attributionMethod, setAttributionMethod] = useState("LAST_TOUCH_LINK");
  const [attributionWindowDays, setAttributionWindowDays] = useState(60);
  const [recurringDurationMonths, setRecurringDurationMonths] = useState(12);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !shortDesc || !description) return;

    setIsLoading(true);

    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          shortDesc,
          description,
          category,
          tags: parsedTags,
          priceCents: Math.round(priceDollars * 100),
          pricingModel,
          commissionModel: "TEAM_POOL",
          commissionRateBps: Math.round(commissionRatePercent * 100),
          attributionMethod,
          attributionWindowDays: Number(attributionWindowDays),
          recurringDurationMonths: Number(recurringDurationMonths),
          websiteUrl: websiteUrl || undefined,
          targetAudience,
          images: imageUrl ? [imageUrl] : [],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish product");
      }

      toast({
        title: "Product Published!",
        message: `${data.product.name} is now live in the marketplace.`,
        type: "success",
      });

      router.push(`/products/${data.product.slug}`);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Publishing Error", message: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Publish a Product Opportunity
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Define commercial terms, commission pools, and recruit growth syndicates to scale your revenue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Product Information */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-500" />
            Product Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Product Name
              </label>
              <Input
                type="text"
                placeholder="e.g. Distributed Telemetry APM"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs"
              >
                <option value="Developer Tools">Developer Tools</option>
                <option value="AI Tools">AI Tools</option>
                <option value="SaaS & Software">SaaS & Software</option>
                <option value="Mobile Applications">Mobile Applications</option>
                <option value="Courses & Education">Courses & Education</option>
                <option value="Digital Downloads">Digital Downloads</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Short Description (one-line summary)
            </label>
            <Input
              type="text"
              placeholder="e.g. Real-time high-throughput metrics engine for Kubernetes microservices."
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Full Description & Technical Value Proposition
            </label>
            <textarea
              rows={4}
              placeholder="Explain product functionality, customer pain points, architecture, and competitive advantages..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Tags (comma separated)
              </label>
              <Input
                type="text"
                placeholder="DevOps, Kubernetes, Observability, Cloud"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Product Image URL
              </label>
              <Input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Commercial Terms & Commission Pool */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            Commercial Terms & Commission Pool
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Price (USD)
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                value={priceDollars}
                onChange={(e) => setPriceDollars(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Pricing Model
              </label>
              <select
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs"
              >
                <option value="SUBSCRIPTION_MONTHLY">Monthly Subscription</option>
                <option value="SUBSCRIPTION_ANNUAL">Annual Subscription</option>
                <option value="ONE_TIME">One-Time Purchase</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Team Commission Pool (%)
              </label>
              <Input
                type="number"
                min="5"
                max="80"
                step="1"
                value={commissionRatePercent}
                onChange={(e) => setCommissionRatePercent(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Attribution Method
              </label>
              <select
                value={attributionMethod}
                onChange={(e) => setAttributionMethod(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs"
              >
                <option value="LAST_TOUCH_LINK">Last-Touch Tracked Link</option>
                <option value="DISCOUNT_CODE">Attributed Discount Code</option>
                <option value="DEAL_REGISTRATION">B2B Deal Registration</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Attribution Window (Days)
              </label>
              <Input
                type="number"
                min="7"
                max="365"
                value={attributionWindowDays}
                onChange={(e) => setAttributionWindowDays(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Recurring Duration (Months)
              </label>
              <Input
                type="number"
                min="0"
                max="36"
                value={recurringDurationMonths}
                onChange={(e) => setRecurringDurationMonths(Number(e.target.value))}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            size="lg"
            isLoading={isLoading}
            className="gap-2"
          >
            Publish Product & Open Opportunity
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
