"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  UserPlus,
  Send,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  FolderKanban,
  DollarSign,
  Briefcase,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

interface Props {
  projectId: string;
  projectSlug: string;
  projectName: string;
  openPositions: string[];
  requiredSkills: string[];
  compensationModels: string[];
  isOwner: boolean;
  isMember: boolean;
  isLoggedIn: boolean;
  initialBookmarked: boolean;
  ownerId: string;
}

export function ProjectOpportunityClient({
  projectId,
  projectSlug,
  projectName,
  openPositions,
  requiredSkills,
  compensationModels,
  isOwner,
  isMember,
  isLoggedIn,
  initialBookmarked,
  ownerId,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();

  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [proposedRole, setProposedRole] = useState(openPositions[0] || "Growth Specialist");
  const [coverLetter, setCoverLetter] = useState("");
  const [strategy, setStrategy] = useState("");
  const [skillsText, setSkillsText] = useState(requiredSkills.join(", "));
  const [compensationPref, setCompensationPref] = useState(
    compensationModels[0] || "REVENUE_SHARE"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const handleToggleBookmark = async () => {
    if (!isLoggedIn) {
      router.push("/sign-in");
      return;
    }

    try {
      const method = isBookmarked ? "DELETE" : "POST";
      const res = await fetch(`/api/products/${projectId}/bookmarks`, { method });
      if (!res.ok) throw new Error("Bookmark action failed");

      setIsBookmarked(!isBookmarked);
      toast({
        title: isBookmarked ? "Bookmark Removed" : "Project Saved",
        message: isBookmarked
          ? "Removed from your saved projects."
          : `"${projectName}" saved to your bookmarks.`,
        type: "success",
      });
    } catch (err: any) {
      toast({ title: "Error", message: err.message, type: "error" });
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      router.push("/sign-in");
      return;
    }

    if (!coverLetter.trim()) {
      toast({ title: "Cover letter required", message: "Please explain your interest and qualifications.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedSkills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/products/${projectId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedRole,
          coverLetter: coverLetter.trim(),
          proposedStrategy: strategy.trim() || undefined,
          skills: parsedSkills,
          requestedCompensation: compensationPref,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setHasApplied(true);
      setShowApplyModal(false);
      toast({
        title: "Application Submitted!",
        message: "The project founder will review your application.",
        type: "success",
      });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Application Error", message: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Workspace Banner for Authorized Members */}
      {(isOwner || isMember) && (
        <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 to-violet-50/80 dark:from-indigo-950/40 dark:to-violet-950/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <FolderKanban className="h-4 w-4" />
              {isOwner ? "Project Founder Access" : "Authorized Team Member"}
            </span>
            <Badge variant="success">Workspace Active</Badge>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Access tasks, meetings, business plans, documents, and team coordination tools.
          </p>
          <Link href={`/products/${projectSlug}/workspace`} className="block pt-1">
            <Button size="sm" variant="glow" className="w-full text-xs gap-1.5 font-semibold">
              Open Project Workspace
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Main Actions Card */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-semibold text-zinc-400 block mb-1">
            Collaboration Status
          </span>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Recruiting Team Members
            </h3>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            The founder is assembling collaborators to build, market, and execute this venture.
          </p>
        </div>

        {/* Primary Action Buttons */}
        {!isOwner && !isMember && (
          <div className="space-y-2">
            {hasApplied ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Application Submitted! Awaiting founder review.</span>
              </div>
            ) : (
              <Button
                variant="glow"
                className="w-full text-sm font-semibold gap-2"
                onClick={() => {
                  if (!isLoggedIn) {
                    router.push("/sign-in");
                  } else {
                    setShowApplyModal(true);
                  }
                }}
              >
                <UserPlus className="h-4 w-4" />
                Apply to Join Project
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full text-xs gap-2"
              onClick={handleToggleBookmark}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="h-4 w-4 text-indigo-600 fill-indigo-600" />
                  Saved to Bookmarks
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 text-zinc-400" />
                  Bookmark Opportunity
                </>
              )}
            </Button>
          </div>
        )}

        {isOwner && (
          <div className="space-y-2">
            <Link href={`/products/${projectSlug}/workspace?tab=team`} className="block">
              <Button variant="default" className="w-full text-xs gap-1.5">
                <UserPlus className="h-3.5 w-3.5" />
                Invite Professionals to Team
              </Button>
            </Link>
            <Link href={`/products/${projectSlug}/workspace?tab=settings`} className="block">
              <Button variant="outline" className="w-full text-xs">
                Edit Project Settings
              </Button>
            </Link>
          </div>
        )}

        {/* Disclosed Compensation Terms */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 space-y-2 text-xs">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">
            Supported Compensation
          </span>
          <div className="flex flex-wrap gap-1">
            {compensationModels.map((cm) => (
              <span
                key={cm}
                className="px-2 py-0.5 rounded-md bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[11px] font-medium"
              >
                {cm.replace(/_/g, " ")}
              </span>
            ))}
          </div>
          <span className="text-[10px] text-zinc-400 block pt-1 leading-relaxed">
            *All compensations are formalized through mutually agreed and accepted commercial agreements before work begins.
          </span>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-indigo-500" />
                Apply to Join &quot;{projectName}&quot;
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Submit your role pitch and execution strategy to the founder.
              </p>
            </div>

            <form onSubmit={handleApply} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Proposed Role / Contribution
                </label>
                {openPositions.length > 0 ? (
                  <select
                    value={proposedRole}
                    onChange={(e) => setProposedRole(e.target.value)}
                    className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 text-xs"
                    required
                  >
                    {openPositions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                    <option value="Other Specialist">Other / Custom Role</option>
                  </select>
                ) : (
                  <Input
                    type="text"
                    placeholder="e.g. Lead Growth Strategist, Senior Frontend Engineer"
                    value={proposedRole}
                    onChange={(e) => setProposedRole(e.target.value)}
                    required
                  />
                )}
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Relevant Skills & Expertise (comma separated)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. B2B Outbound, SEO, React, TypeScript, Product Marketing"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Preferred Compensation Arrangement
                </label>
                <select
                  value={compensationPref}
                  onChange={(e) => setCompensationPref(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-3 text-xs"
                >
                  <option value="REVENUE_SHARE">Revenue Sharing</option>
                  <option value="COMMISSION">Sales Commission</option>
                  <option value="MILESTONE_BASED">Milestone-based Payments</option>
                  <option value="FIXED_FEE">Fixed Project Fee</option>
                  <option value="EQUITY_PROPOSAL">Proposed Equity Participation</option>
                  <option value="HYBRID">Hybrid Arrangement</option>
                  <option value="VOLUNTARY">Voluntary / Sweat Equity</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Why are you the right fit? (Cover Statement)
                </label>
                <textarea
                  rows={3}
                  placeholder="Highlight your relevant experience, past track record, and how you will help grow this venture..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Proposed Execution Strategy (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Outline your 30-day initial plan or specific tactics you propose..."
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApplyModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="glow"
                  isLoading={isSubmitting}
                  className="gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit Application
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
