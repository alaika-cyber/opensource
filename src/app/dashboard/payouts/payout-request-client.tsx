"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatCents } from "@/lib/utils";
import { DollarSign } from "lucide-react";

export function PayoutRequestClient({ balanceCents }: { balanceCents: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestPayout = async () => {
    if (balanceCents < 5000) {
      toast({
        title: "Minimum Payout Threshold",
        message: "You must have at least $50.00 in verified payable balance to request a payout.",
        type: "error",
      });
      return;
    }

    if (!confirm(`Request payout of ${formatCents(balanceCents)} to your connected external payout method?`)) {
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountCents: balanceCents }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process payout");
      }

      toast({
        title: "Payout Initiated!",
        message: `Payout of ${formatCents(balanceCents)} has been scheduled. Ledger debit recorded.`,
        type: "success",
      });

      router.refresh();
    } catch (err: any) {
      toast({ title: "Payout Request Error", message: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="glow"
      size="sm"
      className="gap-2 text-xs font-semibold"
      onClick={handleRequestPayout}
      disabled={balanceCents < 5000}
      isLoading={isLoading}
    >
      <DollarSign className="h-4 w-4" />
      Request Payout ({formatCents(balanceCents)})
    </Button>
  );
}
