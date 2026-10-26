import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowRight } from "lucide-react";

export default function HelpPage() {
  const faqs = [
    {
      q: "How does OpenSource prevent attribution theft and cookie stuffing?",
      a: "OpenSource combines cryptographic referral parameters, server-side session IP verification, and deal registration workflows. Purchases must be validated through verified backend webhooks; client-side cookies alone cannot trigger a commission payout.",
    },
    {
      q: "What happens if a customer requests a refund?",
      a: "If an order is refunded or charged back, our double-entry ledger automatically creates an auditable reversal entry. Unmatured pending commissions are cancelled, and paid balances are adjusted proportionally as documented in the accepted agreement terms.",
    },
    {
      q: "Can a user act as both a product owner and a team professional?",
      a: "Yes. OpenSource accounts support fluid multi-role activity. A user may list their own software product while simultaneously participating as a growth strategist in another team's syndicate.",
    },
    {
      q: "How are member commission splits guaranteed?",
      a: "When a team registers its internal allocation, the system validates that all member basis points sum to exactly 10,000 (100.00%). All parties accept the terms before work begins, and payouts are calculated deterministically in integer minor units.",
    },
    {
      q: "What is the minimum payout threshold?",
      a: "By default, the platform enforces a $50.00 USD minimum payout threshold to prevent excessive payment settlement fees.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <Badge variant="default">Frequently Asked Questions</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Help Center & Documentation
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          Clear answers to common questions regarding collaborative commerce, attribution, and commission settlement.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <Card key={i} className="p-6 space-y-2">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>{faq.q}</span>
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pl-6">
              {faq.a}
            </p>
          </Card>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">Still have questions?</h4>
        <p className="text-xs text-zinc-500">Our support and compliance engineering team is here to assist.</p>
        <Link href="/contact" className="inline-block pt-1">
          <Button variant="default" size="sm">
            Contact Support
          </Button>
        </Link>
      </div>
    </div>
  );
}
