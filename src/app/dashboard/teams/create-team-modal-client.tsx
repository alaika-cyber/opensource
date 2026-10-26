"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { PlusCircle } from "lucide-react";

export function CreateTeamModalClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [industryFocus, setIndustryFocus] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;

    setIsLoading(true);

    try {
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          industryFocus: industryFocus || "General Growth",
          skills,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create team");
      }

      toast({
        title: "Team Created!",
        message: `${data.team.name} has been initialized. You are designated as Leader.`,
        type: "success",
      });

      setIsOpen(false);
      setName("");
      setDescription("");
      router.push(`/dashboard/teams/${data.team.id}`);
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error Creating Team", message: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="glow" size="sm" className="gap-1.5 text-xs">
        <PlusCircle className="h-4 w-4" />
        Create Growth Team
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create a Collaborative Growth Team"
        description="Assemble independent strategists, closers, and creators into a unified syndicate."
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Team / Syndicate Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Apex B2B Growth Partners"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Industry or Category Focus
            </label>
            <Input
              type="text"
              placeholder="e.g. Developer Tooling & Infrastructure SaaS"
              value={industryFocus}
              onChange={(e) => setIndustryFocus(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Team Mission & Capabilities
            </label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe your syndicate's unique execution advantages..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Core Skills (comma separated)
            </label>
            <Input
              type="text"
              placeholder="Outbound B2B, Technical SEO, Copywriting, Funnels"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" size="sm" isLoading={isLoading}>
              Create Team
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
