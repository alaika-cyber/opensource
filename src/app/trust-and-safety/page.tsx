import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock, AlertTriangle, Scale, CheckCircle2 } from "lucide-react";

export default function TrustAndSafetyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <Badge variant="default">Integrity Architecture</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Trust & Safety
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto">
          How OpenSource protects product owners, independent contributors, and customer transactions against manipulation and fraud.
        </p>
      </div>

      <div className="space-y-8">
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Verified Sales Attribution
            </h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            We never accept client-side cookies or unverified client assertions as proof that a commercial purchase happened. Every qualifying commission requires server-side payment confirmation or cryptographically signed webhooks from approved payment providers.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-indigo-500" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Tamper-Evident Commercial Agreements
            </h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Commercial agreements and internal member commission allocations generate a unique SHA-256 cryptographic checksum upon mutual acceptance. Existing commercial agreements cannot be altered retroactively without creating a distinct, newly accepted version.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-violet-500" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Fair Dispute Mediation
            </h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            In the event of attribution collisions, customer chargebacks, or non-fulfillment claims, our formal dispute procedure places disputed commission balances into hold status while platform administrators examine server evidence and logs.
          </p>
        </Card>
      </div>
    </div>
  );
}
