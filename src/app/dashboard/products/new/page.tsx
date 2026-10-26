"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  FolderKanban,
  Target,
  Users,
  Briefcase,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Lock,
} from "lucide-react";

export default function CreateProjectOpportunityPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Basic info
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("SaaS & Software");
  const [businessStage, setBusinessStage] = useState("MVP");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  // Business Collaboration & Recruitment
  const [businessGoalsText, setBusinessGoalsText] = useState("");
  const [openPositionsText, setOpenPositionsText] = useState("Growth Marketer, B2B Closer, Frontend Developer");
  const [requiredSkillsText, setRequiredSkillsText] = useState("B2B Outbound, React, TypeScript, Product Marketing");
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [isConfidential, setIsConfidential] = useState(false);
  const [visibility, setVisibility] = useState("PUBLIC");

  // Compensation
  const [selectedCompensation, setSelectedCompensation] = useState<string[]>([
    "REVENUE_SHARE",
    "COMMISSION",
  ]);
  const [commissionRatePercent, setCommissionRatePercent] = useState(20);
  const [budgetDescription, setBudgetDescription] = useState("$2,000 monthly tooling & execution budget");
  const [equityProposal, setEquityProposal] = useState("Proposed 2-5% milestone-vested advisory pool");

  const [isLoading, setIsLoading] = useState(false);

  const toggleCompensation = (model: string) => {
    setSelectedCompensation((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !shortDesc || !description) {
      toast({ title: "Required fields missing", message: "Please fill in project name and descriptions.", type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      const parsedTags = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const parsedGoals = businessGoalsText
        .split("\n")
        .map((g) => g.trim())
        .filter(Boolean);

      const parsedPositions = openPositionsText
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const parsedSkills = requiredSkillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          shortDesc: shortDesc.trim(),
          description: description.trim(),
          category,
          businessStage,
          tags: parsedTags,
          priceCents: 19900,
          currency: "USD",
          pricingModel: "SUBSCRIPTION_MONTHLY",
          commissionModel: "TEAM_POOL",
          commissionRateBps: Math.round(commissionRatePercent * 100),
          attributionMethod: "LAST_TOUCH_LINK",
          attributionWindowDays: 60,
          recurringDurationMonths: 12,
          websiteUrl: websiteUrl.trim() || undefined,
          targetAudience: targetAudience.trim() || undefined,
          images: imageUrl.trim() ? [imageUrl.trim()] : [],
          businessGoals: parsedGoals,
          openPositions: parsedPositions,
          requiredSkills: parsedSkills,
          compensationModels: selectedCompensation.length > 0 ? selectedCompensation : ["REVENUE_SHARE"],
          budgetDescription: budgetDescription.trim() || undefined,
          equityProposal: equityProposal.trim() || undefined,
          isConfidential,
          applicationDeadline: applicationDeadline ? applicationDeadline : null,
          visibility,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to publish project");
      }

      toast({
        title: "Project Published!",
        message: `${data.product.name} is now open for collaboration.`,
        type: "success",
      });

      router.push(`/products/${data.product.slug}/workspace`);
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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          Business Collaboration & Execution Platform
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Create & Publish a Business Venture
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Publish your physical product, SaaS platform, AI technology, or startup. Recruit skilled marketing, sales, and engineering specialists, define transparent compensation, and coordinate execution.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Project Details */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-indigo-500" />
            1. Project & Venture Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Project / Product Name *
              </label>
              <Input
                type="text"
                placeholder="e.g. Distributed Telemetry APM or EcoGrip Hardware"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Industry & Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs"
              >
                <option value="SaaS & Software">SaaS & Software</option>
                <option value="Developer Tools">Developer Tools</option>
                <option value="AI Tools">AI Tools</option>
                <option value="Consumer Goods & Hardware">Consumer Goods & Hardware</option>
                <option value="Mobile Applications">Mobile Applications</option>
                <option value="B2B Services">B2B Services & Agency</option>
                <option value="Research & Innovation">Research & Innovation</option>
                <option value="Digital Products">Digital Products</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Business Stage *
              </label>
              <select
                value={businessStage}
                onChange={(e) => setBusinessStage(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs"
              >
                <option value="Idea">Idea / Validation</option>
                <option value="Prototype">Prototype</option>
                <option value="MVP">Minimum Viable Product (MVP)</option>
                <option value="Early Traction">Early Traction (Initial Users/Sales)</option>
                <option value="Scaling">Scaling Growth</option>
                <option value="Established">Established Business</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-xs"
              >
                <option value="PUBLIC">Public (Listed in marketplace)</option>
                <option value="UNLISTED">Unlisted (Accessible by link)</option>
                <option value="PRIVATE">Private (Invite only)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Short Summary (One-line Hook) *
            </label>
            <Input
              type="text"
              placeholder="e.g. Real-time high-throughput telemetry engine cutting observability costs by 80%."
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Value Proposition & Comprehensive Project Details *
            </label>
            <textarea
              rows={4}
              placeholder="Describe your product architecture, customer pain points, current traction, and what you aim to achieve with collaborators..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Target Customers & Market
              </label>
              <Input
                type="text"
                placeholder="e.g. Mid-market SaaS engineering leads, DevOps teams"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Official Website or Demo Link (Optional)
              </label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Tags (Comma separated)
              </label>
              <Input
                type="text"
                placeholder="DevOps, Observability, B2B, Cloud"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Hero Image / Diagram URL (Optional)
              </label>
              <Input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Team Roles & Recruitment Objectives */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="h-4 w-4 text-violet-500" />
            2. Team Recruitment & Required Skills
          </h3>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Open Positions Needed (Comma separated)
            </label>
            <Input
              type="text"
              placeholder="e.g. Growth Marketer, B2B Sales Closer, Full-Stack Developer, UI/UX Designer"
              value={openPositionsText}
              onChange={(e) => setOpenPositionsText(e.target.value)}
            />
            <span className="text-[11px] text-zinc-400 block mt-1">
              These will automatically create recruitment roles for specialists to apply to.
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Required Skills & Technologies (Comma separated)
            </label>
            <Input
              type="text"
              placeholder="e.g. Outbound B2B, Next.js, SEO, Deal Negotiation, Graphic Design"
              value={requiredSkillsText}
              onChange={(e) => setRequiredSkillsText(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Key Strategic Goals (One goal per line)
            </label>
            <textarea
              rows={3}
              placeholder="e.g.&#10;Acquire 50 pilot customers in Q1&#10;Launch self-serve onboarding portal&#10;Establish distributor partnership network"
              value={businessGoalsText}
              onChange={(e) => setBusinessGoalsText(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Application Deadline (Optional)
              </label>
              <Input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="confidential-project"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                className="h-4 w-4 rounded"
              />
              <label htmlFor="confidential-project" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Confidential Project (Documents protected by NDA/members-only gates)
              </label>
            </div>
          </div>
        </Card>

        {/* Compensation & Commercial Structure */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            3. Compensation & Commercial Alignment
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
              Supported Compensation Arrangements (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {[
                { id: "REVENUE_SHARE", label: "Revenue Sharing" },
                { id: "COMMISSION", label: "Sales Commission" },
                { id: "MILESTONE_BASED", label: "Milestone Payments" },
                { id: "FIXED_FEE", label: "Fixed Project Fees" },
                { id: "EQUITY_PROPOSAL", label: "Proposed Equity" },
                { id: "VOLUNTARY", label: "Voluntary Contribution" },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedCompensation.includes(item.id)
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200"
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCompensation.includes(item.id)}
                    onChange={() => toggleCompensation(item.id)}
                    className="rounded"
                  />
                  <span className="font-medium text-xs">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Commercial Commission Pool (% of Sales)
              </label>
              <Input
                type="number"
                min="0"
                max="80"
                value={commissionRatePercent}
                onChange={(e) => setCommissionRatePercent(Number(e.target.value))}
              />
              <span className="text-[11px] text-zinc-400 mt-0.5 block">
                Distributed among active growth syndicates and closers.
              </span>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
                Disclosed Budget / Resource Pool
              </label>
              <Input
                type="text"
                value={budgetDescription}
                onChange={(e) => setBudgetDescription(e.target.value)}
                placeholder="e.g. $2,000 monthly tooling & execution budget"
              />
            </div>
          </div>

          {selectedCompensation.includes("EQUITY_PROPOSAL") && (
            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs space-y-2">
              <label className="font-semibold text-amber-900 dark:text-amber-200 block">
                Proposed Equity Participation Terms
              </label>
              <Input
                type="text"
                value={equityProposal}
                onChange={(e) => setEquityProposal(e.target.value)}
                placeholder="e.g. Proposed 2-5% milestone-vested advisory pool"
              />
              <span className="text-[10px] text-amber-700 dark:text-amber-300 block leading-relaxed">
                *Notice: Proposed equity participation represents an informal commercial intent and does not constitute legally issued securities or corporate ownership without independent legal counsel.
              </span>
            </div>
          )}
        </Card>

        {/* Submission */}
        <div className="flex justify-end gap-3 pt-4">
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
            className="gap-2 font-semibold"
          >
            Publish Project Opportunity
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
