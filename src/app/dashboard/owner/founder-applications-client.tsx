"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FolderKanban,
  ExternalLink,
} from "lucide-react";

interface ApplicationItem {
  id: string;
  proposedRole: string | null;
  skills: string[];
  coverLetter: string;
  proposedStrategy: string | null;
  requestedCompensation: string | null;
  status: string;
  createdAt: string;
  applicantUser: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    profile?: { headline: string | null; skills: string[] } | null;
  };
  opportunity: {
    id: string;
    productId: string;
    product: { id: string; name: string; slug: string };
  };
}

interface Props {
  initialApplications: ApplicationItem[];
}

export function FounderApplicationsClient({ initialApplications }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [applications, setApplications] = useState<ApplicationItem[]>(initialApplications);
  const [selectedDept, setSelectedDept] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleReview = async (app: ApplicationItem, status: "ACCEPTED" | "REJECTED" | "UNDER_REVIEW") => {
    setIsProcessing(app.id);
    try {
      const res = await fetch(`/api/products/${app.opportunity.productId}/applications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: app.id,
          status,
          department: selectedDept[app.id] || "Operations",
          role: app.proposedRole || "Collaborator",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setApplications((prev) =>
        prev.map((item) => (item.id === app.id ? { ...item, status } : item))
      );

      toast({
        title: status === "ACCEPTED" ? "Application Accepted!" : `Status updated to ${status}`,
        message:
          status === "ACCEPTED"
            ? `${app.applicantUser.name} added to ${app.opportunity.product.name} workspace.`
            : `Application marked as ${status}.`,
        type: "success",
      });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Review Error", message: err.message, type: "error" });
    } finally {
      setIsProcessing(null);
    }
  };

  const pendingApps = applications.filter((a) => a.status === "PENDING" || a.status === "UNDER_REVIEW");

  if (pendingApps.length === 0) {
    return (
      <Card className="p-8 text-center text-xs text-zinc-500 border-dashed">
        <UserCheck className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
        <p className="font-semibold text-zinc-700 dark:text-zinc-300">No pending contributor applications</p>
        <p className="text-zinc-400 mt-0.5">When specialists apply to join your projects, review them here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pendingApps.map((app) => (
        <Card key={app.id} className="p-5 space-y-3 border-indigo-100 dark:border-indigo-950/60 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {app.applicantUser.avatarUrl ? (
                <img
                  src={app.applicantUser.avatarUrl}
                  alt={app.applicantUser.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  {app.applicantUser.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {app.applicantUser.name}
                  </h4>
                  <Badge variant={app.status === "UNDER_REVIEW" ? "default" : "secondary"} className="text-[10px]">
                    {app.status}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500">
                  {app.applicantUser.profile?.headline || app.applicantUser.email}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                  <FolderKanban className="h-3 w-3" />
                  <span>Applied to: {app.opportunity.product.name}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] text-zinc-400 block">
                {new Date(app.createdAt).toLocaleDateString()}
              </span>
              {app.requestedCompensation && (
                <span className="text-[10px] font-semibold text-zinc-500 mt-1 block">
                  Prefers: {app.requestedCompensation.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                Proposed Role: {app.proposedRole || "Collaborator"}
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-300 whitespace-pre-line leading-relaxed">
              {app.coverLetter}
            </p>
            {app.proposedStrategy && (
              <div className="pt-1.5 border-t border-zinc-200 dark:border-zinc-700/60">
                <strong className="text-[11px] text-zinc-500 block mb-0.5">Proposed Strategy:</strong>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">{app.proposedStrategy}</p>
              </div>
            )}
          </div>

          {/* Department Assign & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-zinc-500">Assign Department:</label>
              <select
                value={selectedDept[app.id] || "Operations"}
                onChange={(e) => setSelectedDept({ ...selectedDept, [app.id]: e.target.value })}
                className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 px-2 text-xs"
              >
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Research">Research</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {app.status !== "UNDER_REVIEW" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReview(app, "UNDER_REVIEW")}
                  disabled={isProcessing === app.id}
                  className="text-xs h-8"
                >
                  Shortlist
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReview(app, "REJECTED")}
                disabled={isProcessing === app.id}
                className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                Decline
              </Button>

              <Button
                size="sm"
                variant="glow"
                onClick={() => handleReview(app, "ACCEPTED")}
                disabled={isProcessing === app.id}
                isLoading={isProcessing === app.id}
                className="text-xs h-8 gap-1 font-semibold"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Accept & Add to Team
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
