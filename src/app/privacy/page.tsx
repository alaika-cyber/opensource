import React from "react";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div>
        <Badge variant="secondary" className="mb-2">Draft for Jurisdiction-Specific Legal Review</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Privacy Policy (Draft)
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Last Updated: October 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm text-zinc-600 dark:text-zinc-400 space-y-6 leading-relaxed">
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs">
          <strong>Notice:</strong> This privacy draft outlines data collection practices and rights under GDPR/CCPA baselines. Professional legal verification is required prior to public production launch.
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">1. Data Minimization</h2>
          <p>
            OpenSource collects only necessary information required for authentication, sales attribution, and commission accounting. We never sell user personal data or license it to third-party advertising networks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">2. Public vs. Private Information</h2>
          <p>
            Public profiles display only voluntarily provided details such as headlines, skills, and attributable sales volumes. Private email addresses, internal financial accounts, identity documents, and payment details are never exposed publicly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">3. Rights to Deletion & Export</h2>
          <p>
            Users may request full account deletion or a machine-readable data export in accordance with applicable data privacy laws, subject to statutory financial audit record retention obligations.
          </p>
        </section>
      </div>
    </div>
  );
}
