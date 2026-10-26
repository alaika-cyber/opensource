"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Check, X, ShieldCheck } from "lucide-react";

interface Props {
  type: "product" | "user" | "dispute";
  id: string;
  isVerified?: boolean;
  accountStatus?: string;
  status?: string;
}

export function AdminActionsClient({ type, id, isVerified, accountStatus, status }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      if (type === "dispute") {
        const res = await fetch("/api/disputes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            disputeId: id,
            status: action === "RESOLVE" ? "RESOLVED" : "DISMISSED",
            resolution: `Mediation completed by platform administrator. Status: ${action}`,
          }),
        });

        if (!res.ok) throw new Error("Failed to update dispute");
        toast({ title: "Dispute Updated", message: `Dispute marked as ${action}D`, type: "success" });
      } else {
        const res = await fetch("/api/admin/moderation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            targetEntity: type === "product" ? "Product" : "User",
            targetId: id,
            reason: "Admin console action",
          }),
        });

        if (!res.ok) throw new Error("Failed to moderate entity");
        toast({ title: "Moderation Completed", message: `Action ${action} executed.`, type: "success" });
      }

      router.refresh();
    } catch (err: any) {
      toast({ title: "Admin Action Error", message: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (type === "dispute") {
    if (status === "RESOLVED" || status === "DISMISSED") {
      return <span className="text-[11px] text-zinc-400">Closed</span>;
    }
    return (
      <div className="flex gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="text-[11px] h-7 px-2 text-emerald-600"
          onClick={() => handleAction("RESOLVE")}
          isLoading={loading}
        >
          Resolve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-[11px] h-7 px-2 text-zinc-400"
          onClick={() => handleAction("DISMISS")}
          isLoading={loading}
        >
          Dismiss
        </Button>
      </div>
    );
  }

  if (type === "product") {
    return (
      <Button
        size="sm"
        variant={isVerified ? "outline" : "default"}
        className="text-[11px] h-7 px-2"
        onClick={() => handleAction(isVerified ? "SUSPEND" : "VERIFY")}
        isLoading={loading}
      >
        {isVerified ? "Archive" : "Verify Product"}
      </Button>
    );
  }

  if (type === "user") {
    const isActive = accountStatus === "ACTIVE";
    return (
      <Button
        size="sm"
        variant={isActive ? "outline" : "default"}
        className={`text-[11px] h-7 px-2 ${isActive ? "text-red-500" : "text-emerald-500"}`}
        onClick={() => handleAction(isActive ? "SUSPEND" : "ACTIVATE")}
        isLoading={loading}
      >
        {isActive ? "Suspend" : "Activate"}
      </Button>
    );
  }

  return null;
}
