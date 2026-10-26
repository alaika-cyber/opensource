import { db } from "./db";
import { LedgerEntryType } from "@prisma/client";

/**
 * Record a financial ledger entry safely with strict idempotency verification.
 * Guarantees that duplicate requests/webhooks cannot duplicate financial entries.
 */
export async function recordLedgerEntry(params: {
  entryType: LedgerEntryType;
  referenceId: string;
  userId?: string;
  commissionEntryId?: string;
  payoutId?: string;
  amountCents: number;
  currency?: string;
  idempotencyKey: string;
  description: string;
}) {
  const {
    entryType,
    referenceId,
    userId,
    commissionEntryId,
    payoutId,
    amountCents,
    currency = "USD",
    idempotencyKey,
    description,
  } = params;

  // Check if idempotency key was already processed
  const existing = await db.financialLedger.findUnique({
    where: { idempotencyKey },
  });

  if (existing) {
    return { entry: existing, alreadyProcessed: true };
  }

  // Calculate current balance for user
  let currentBalance = 0;
  if (userId) {
    const lastEntry = await db.financialLedger.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (lastEntry) {
      currentBalance = lastEntry.balanceAfterCents;
    }
  }

  const newBalance = currentBalance + amountCents;

  const entry = await db.financialLedger.create({
    data: {
      entryType,
      referenceId,
      userId,
      commissionEntryId,
      payoutId,
      amountCents,
      currency,
      balanceAfterCents: newBalance,
      idempotencyKey,
      description,
    },
  });

  return { entry, alreadyProcessed: false };
}

/**
 * Get current payable balance for a user in cents
 */
export async function getUserPayableBalance(userId: string): Promise<number> {
  const lastEntry = await db.financialLedger.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return lastEntry ? lastEntry.balanceAfterCents : 0;
}

/**
 * Process a refund or chargeback reversal for an order
 */
export async function processOrderRefund(orderId: string, reason = "Customer refund requested") {
  return await db.$transaction(async (tx) => {
    // 1. Mark order as REFUNDED
    const order = await tx.order.update({
      where: { id: orderId },
      data: { status: "REFUNDED" },
      include: {
        commissions: true,
      },
    });

    const reversalResults = [];

    // 2. Reverse each commission entry and create an auditable debit ledger record
    for (const commission of order.commissions) {
      if (commission.status === "REVERSED") continue;

      await tx.commissionEntry.update({
        where: { id: commission.id },
        data: {
          status: "REVERSED",
          reversalReason: reason,
        },
      });

      // Fetch user's latest balance
      const lastEntry = await tx.financialLedger.findFirst({
        where: { userId: commission.userId },
        orderBy: { createdAt: "desc" },
      });

      const currentBalance = lastEntry ? lastEntry.balanceAfterCents : 0;
      const debitAmount = -commission.netCommissionCents;
      const newBalance = currentBalance + debitAmount;

      const reversalLedger = await tx.financialLedger.create({
        data: {
          entryType: "REFUND_REVERSAL",
          referenceId: commission.id,
          userId: commission.userId,
          commissionEntryId: commission.id,
          amountCents: debitAmount,
          currency: commission.currency,
          balanceAfterCents: newBalance,
          idempotencyKey: `refund_order_${orderId}_comm_${commission.id}`,
          description: `Reversal of commission for refunded order #${order.orderNumber}: ${reason}`,
        },
      });

      reversalResults.push(reversalLedger);
    }

    return { order, reversalResults };
  });
}
