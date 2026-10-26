"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  PlusCircle,
} from "lucide-react";

interface ProjectOption {
  id: string;
  name: string;
  slug: string;
}

interface InviteToProjectModalProps {
  professional: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  ownedProjects: ProjectOption[];
}

const DEPARTMENTS = [
  "Marketing",
  "Sales",
  "Engineering",
  "Design",
  "Operations",
  "Finance",
  "Research",
];

export function InviteToProjectModal({
  professional,
  ownedProjects,
}: InviteToProjectModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    ownedProjects[0]?.id || ""
  );
  const [department, setDepartment] = useState("Engineering");
  const [role, setRole] = useState("Growth Specialist");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProjectId) {
      setError("Please select a project.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${selectedProjectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: professional.id,
          role,
          department,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to invite professional");
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to invite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="default"
        size="sm"
        className="gap-1.5"
        onClick={() => setIsOpen(true)}
      >
        <Users className="h-4 w-4" />
        Invite to Project
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5">
              <Badge variant="secondary" className="mb-2">
                Project Recruitment
              </Badge>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Invite {professional.name} to Your Project
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Grant immediate access to your project workspace and assign a departmental role.
              </p>
            </div>

            {ownedProjects.length === 0 ? (
              <div className="text-center py-6 space-y-4">
                <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    No Owned Projects
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    You must first publish a business project or startup to invite team members.
                  </p>
                </div>
                <Link href="/dashboard/products/new">
                  <Button variant="default" size="sm" className="gap-1.5">
                    <PlusCircle className="h-4 w-4" />
                    Publish a Project
                  </Button>
                </Link>
              </div>
            ) : success ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Invitation Confirmed!
                </h4>
                <p className="text-xs text-zinc-500">
                  {professional.name} has been added to your project team as {role} ({department}).
                </p>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Target Project
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {ownedProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Lead Frontend Engineer, Sales Closer"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="default"
                    size="sm"
                    disabled={loading}
                    className="gap-1.5"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Inviting...
                      </>
                    ) : (
                      "Send Invitation"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
