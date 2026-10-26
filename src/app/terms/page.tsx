import React from "react";
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <Badge variant="secondary" className="mb-2">Draft for Jurisdiction-Specific Legal Review</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Terms of Service (Draft)
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Last Updated: October 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm text-zinc-600 dark:text-zinc-400 space-y-6 leading-relaxed">
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs">
          <strong>Notice:</strong> This document represents a structural operational draft of the OpenSource platform terms. It requires formal legal counsel review in your operating jurisdiction prior to commercial deployment.
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">1. Nature of the Platform</h2>
          <p>
            OpenSource operates as a collaborative commerce enablement venue and commission accounting registry. OpenSource is not an employer, partner, or joint venturer with any product owner or independent contributor. All contributors operate as independent sovereign contractors.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">2. Commercial Agreements & Tamper-Evident Checksums</h2>
          <p>
            Agreements between product owners and teams are registered electronically. Each agreement generates a cryptographic checksum (SHA-256) upon acceptance. No retrospective unilateral modifications may be made to existing versions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">3. Commission Accounting & Refunds</h2>
          <p>
            Commissions are earned strictly upon verified commercial transactions. If a transaction is subsequently refunded, reversed, or charged back, the associated commission entries are reversed proportionally as specified in the agreed terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">4. Platform Fee Disclosure</h2>
          <p>
            OpenSource charges a disclosed service fee (standard 5%) deducted from contributor commissions actually settled and paid out through the platform.
          </p>
        </section>
      </div>
    </div>
  );
}
