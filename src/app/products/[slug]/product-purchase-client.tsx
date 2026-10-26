"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCents } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { CheckCircle2, ShoppingCart, Tag, ArrowRight } from "lucide-react";

interface Props {
  productId: string;
  productName: string;
  priceCents: number;
  currency: string;
  referralCode?: string;
}

export function ProductPurchaseClient({
  productId,
  productName,
  priceCents,
  currency,
  referralCode: initialRef,
}: Props) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState(initialRef || "");
  const [isLoading, setIsLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any>(null);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Email required", message: "Please provide a customer email address.", type: "error" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          customerEmail: email,
          customerName: name || "Customer",
          grossAmountCents: priceCents,
          referralCode: code || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process order");
      }

      setOrderCompleted(data);
      toast({
        title: "Order Verified & Recorded!",
        message: `Order #${data.order.orderNumber} recorded. ${
          data.commissionEntries?.length > 0
            ? `${data.commissionEntries.length} commission entries credited to the team.`
            : "Direct sale recorded."
        }`,
        type: "success",
      });
    } catch (err: any) {
      toast({ title: "Purchase Simulation Error", message: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (orderCompleted) {
    return (
      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <h4 className="font-semibold text-sm">Order Verified</h4>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-300">
          Order <strong>#{orderCompleted.order.orderNumber}</strong> has been logged to the database and reconciled.
        </p>
        {orderCompleted.commissionEntries?.length > 0 && (
          <div className="text-xs space-y-1 pt-2 border-t border-emerald-500/20">
            <span className="font-semibold block">Attributed Commissions Generated:</span>
            {orderCompleted.commissionEntries.map((c: any, i: number) => (
              <div key={i} className="flex justify-between text-zinc-600 dark:text-zinc-300">
                <span>Member Allocation ({c.memberShareBps / 100}%):</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {formatCents(c.netCommissionCents)}
                </span>
              </div>
            ))}
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs mt-2"
          onClick={() => {
            setOrderCompleted(null);
            setEmail("");
          }}
        >
          Test Another Purchase
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handlePurchase} className="space-y-3 pt-2">
      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
          Customer Email
        </label>
        <Input
          type="email"
          placeholder="buyer@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 block mb-1">
          Referral / Tracking Code
        </label>
        <div className="relative">
          <Tag className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Optional referral code (e.g. SCALE-XXXX)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="glow"
        className="w-full gap-2 text-sm font-semibold"
        isLoading={isLoading}
      >
        <ShoppingCart className="h-4 w-4" />
        Simulate Purchase ({formatCents(priceCents, currency)})
      </Button>
      <span className="text-[11px] text-zinc-400 block text-center">
        *Tests order attribution, integer commission splits, and ledger entries live in PostgreSQL.
      </span>
    </form>
  );
}
