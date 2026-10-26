import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCents, formatDate } from "@/lib/utils";
import { getUserPayableBalance } from "@/lib/ledger";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, ShieldCheck, ArrowDownRight, ArrowUpRight, History } from "lucide-react";
import { PayoutRequestClient } from "./payout-request-client";

export default async function PayoutsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const balanceCents = await getUserPayableBalance(user.id);

  // Fetch financial ledger history
  const ledgerEntries = await db.financialLedger.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Fetch past payouts
  const payouts = await db.payout.findMany({
    where: { userId: user.id },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Payouts & Financial Ledger
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Reconciled double-entry ledger with transparent platform fee disclosures and auditable transaction IDs.
          </p>
        </div>

        <PayoutRequestClient balanceCents={balanceCents} />
      </div>

      {/* Balance Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-tr from-indigo-900/20 via-zinc-900/60 to-zinc-900/30 border-indigo-500/30">
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider block">
            Payable Ledger Balance
          </span>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
            {formatCents(balanceCents)}
          </p>
          <span className="text-xs text-zinc-400 mt-1 block">
            Minimum threshold: $50.00 USD
          </span>
        </Card>

        <Card className="p-6">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
            Total Ledger Entries
          </span>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
            {ledgerEntries.length}
          </p>
          <span className="text-xs text-zinc-500 mt-1 block">
            Auditable double-entry records
          </span>
        </Card>

        <Card className="p-6">
          <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block">
            Completed Payouts
          </span>
          <p className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
            {payouts.length}
          </p>
          <span className="text-xs text-zinc-500 mt-1 block">
            Settled to external provider
          </span>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-indigo-500" />
            Financial Ledger Entries
          </CardTitle>
          <CardDescription>
            Immutable chronological record of credits, fee withholdings, and debit reversals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ledgerEntries.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500">
              No financial ledger entries recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {ledgerEntries.map((entry) => {
                const isCredit = entry.amountCents >= 0;
                return (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isCredit
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {entry.description}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Type: <strong className="text-zinc-700 dark:text-zinc-300">{entry.entryType}</strong> • {formatDate(entry.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-bold text-sm ${
                          isCredit ? "text-emerald-500" : "text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        {isCredit ? "+" : ""}
                        {formatCents(entry.amountCents, entry.currency)}
                      </span>
                      <span className="text-[11px] text-zinc-500 block">
                        Balance after: {formatCents(entry.balanceAfterCents, entry.currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
