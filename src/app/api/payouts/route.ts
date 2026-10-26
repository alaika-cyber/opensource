import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserPayableBalance } from "@/lib/ledger";
import { db } from "@/lib/db";
import { PayoutStatus, LedgerEntryType } from "@prisma/client";

const MINIMUM_PAYOUT_CENTS = parseInt(process.env.MINIMUM_PAYOUT_CENTS || "5000", 10); // $50.00 default

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const balanceCents = await getUserPayableBalance(user.id);

    if (balanceCents < MINIMUM_PAYOUT_CENTS) {
      return NextResponse.json(
        {
          error: `Minimum payout threshold is $${(MINIMUM_PAYOUT_CENTS / 100).toFixed(
            2
          )}. Your current available balance is $${(balanceCents / 100).toFixed(2)}.`,
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const requestedAmountCents = body.amountCents || balanceCents;

    if (requestedAmountCents > balanceCents) {
      return NextResponse.json(
        { error: "Requested payout amount exceeds available balance." },
        { status: 400 }
      );
    }

    // Process payout inside transaction
    const payout = await db.$transaction(async (tx) => {
      const createdPayout = await tx.payout.create({
        data: {
          userId: user.id,
          amountCents: requestedAmountCents,
          currency: "USD",
          status: PayoutStatus.PROCESSING,
          providerRef: `payout_sim_${Math.random().toString(36).substring(2, 10)}`,
        },
      });

      const newBalance = balanceCents - requestedAmountCents;

      // Post debit to ledger
      await tx.financialLedger.create({
        data: {
          entryType: LedgerEntryType.PAYOUT_DISTRIBUTED,
          referenceId: createdPayout.id,
          userId: user.id,
          payoutId: createdPayout.id,
          amountCents: -requestedAmountCents, // debit
          currency: "USD",
          balanceAfterCents: newBalance,
          idempotencyKey: `payout_${createdPayout.id}`,
          description: `Payout processed to external account (${(requestedAmountCents / 100).toFixed(2)} USD)`,
        },
      });

      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Payout Initiated",
          message: `Your payout of $${(requestedAmountCents / 100).toFixed(2)} is being processed.`,
          type: "PAYOUT",
          linkUrl: "/dashboard/payouts",
        },
      });

      return createdPayout;
    });

    return NextResponse.json({ success: true, payout }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
