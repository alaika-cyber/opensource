"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export function OwnerRefundClient({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [isRefunding, setIsRefunding] = useState(false);

  const handleRefund = async () => {
    if (!confirm(`Are you sure you want to refund Order #${orderNumber}? This will reverse attributed commissions in the ledger.`)) {
      return;
    }

    setIsRefunding(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Product owner authorized refund" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to refund order");
      }

      toast({
        title: "Order Refunded",
        message: `Order #${orderNumber} marked as REFUNDED. Contributor commissions reversed in ledger.`,
        type: "success",
      });

      router.refresh();
    } catch (err: any) {
      toast({ title: "Refund Error", message: err.message, type: "error" });
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="destructive"
      className="text-xs gap-1.5 h-8"
      onClick={handleRefund}
      isLoading={isRefunding}
    >
      <RotateCcw className="h-3.5 w-3.5" />
      Issue Refund & Clawback
    </Button>
  );
}
