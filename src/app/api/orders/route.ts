import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveAttribution } from "@/lib/attribution";
import { calculateCommissions, MemberAllocationRule } from "@/lib/commission";
import { recordLedgerEntry } from "@/lib/ledger";
import { OrderStatus, CommissionStatus, LedgerEntryType } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      customerEmail,
      customerName,
      grossAmountCents,
      referralCode,
      leadEmail,
      externalProviderRef,
      metadata,
    } = body;

    if (!productId || !customerEmail || !grossAmountCents || grossAmountCents <= 0) {
      return NextResponse.json({ error: "Missing required order parameters" }, { status: 400 });
    }

    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json({ error: "Product not available for transactions" }, { status: 400 });
    }

    // 1. Resolve attribution
    const attribution = await resolveAttribution({
      referralCode,
      leadEmail: leadEmail || customerEmail,
      productId,
    });

    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await db.$transaction(async (tx) => {
      // 2. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          productId,
          referralLinkId: attribution?.type === "REFERRAL_LINK" ? attribution.referralLink.id : null,
          dealRegistrationId: attribution?.type === "DEAL_REGISTRATION" ? attribution.dealRegistration.id : null,
          customerEmail: customerEmail.toLowerCase(),
          customerName: customerName || "Customer",
          grossAmountCents,
          currency: product.currency,
          status: OrderStatus.COMPLETED,
          externalProviderRef: externalProviderRef || `mock_pi_${orderNumber}`,
          metadata: metadata || null,
        },
      });

      // Increment click/order metric if referral link used
      if (attribution?.type === "REFERRAL_LINK") {
        await tx.referralLink.update({
          where: { id: attribution.referralLink.id },
          data: { clickCount: { increment: 1 } },
        });

        await tx.attributionRecord.create({
          data: {
            orderId: order.id,
            method: "LAST_TOUCH_LINK",
            referralCode,
            evidenceData: { ip: req.headers.get("x-forwarded-for") || "127.0.0.1" },
          },
        });
      }

      const commissionEntries = [];

      // 3. If attributable and active agreement exists, calculate and record commissions
      if (attribution?.teamId) {
        const agreement = await tx.commercialAgreement.findFirst({
          where: {
            productId,
            teamId: attribution.teamId,
            status: "ACTIVE",
          },
          include: {
            team: {
              include: {
                members: { where: { status: "ACTIVE" } },
              },
            },
          },
        });

        if (agreement) {
          const allocationRules = agreement.allocationRulesJson as unknown as MemberAllocationRule[];
          const calculation = calculateCommissions({
            grossSaleCents: grossAmountCents,
            commissionPoolBps: agreement.commissionPoolBps,
            memberAllocations: allocationRules,
            platformFeeBps: 500, // 5.00%
          });

          const payoutDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 day holding period

          for (const memberDist of calculation.memberDistributions) {
            const entry = await tx.commissionEntry.create({
              data: {
                orderId: order.id,
                agreementId: agreement.id,
                userId: memberDist.userId,
                teamId: attribution.teamId,
                calculationBasisCents: grossAmountCents,
                rateBps: agreement.commissionPoolBps,
                memberShareBps: memberDist.allocationBps,
                grossCommissionCents: memberDist.grossCommissionCents,
                platformFeeCents: memberDist.platformFeeCents,
                netCommissionCents: memberDist.netCommissionCents,
                currency: product.currency,
                status: CommissionStatus.CONFIRMED,
                eligiblePayoutDate: payoutDate,
              },
            });

            // Post financial ledger credit
            const lastLedger = await tx.financialLedger.findFirst({
              where: { userId: memberDist.userId },
              orderBy: { createdAt: "desc" },
            });
            const prevBalance = lastLedger ? lastLedger.balanceAfterCents : 0;
            const newBalance = prevBalance + memberDist.netCommissionCents;

            await tx.financialLedger.create({
              data: {
                entryType: LedgerEntryType.COMMISSION_EARNED,
                referenceId: entry.id,
                userId: memberDist.userId,
                commissionEntryId: entry.id,
                amountCents: memberDist.netCommissionCents,
                currency: product.currency,
                balanceAfterCents: newBalance,
                idempotencyKey: `comm_order_${order.id}_user_${memberDist.userId}`,
                description: `Commission earned for Order #${order.orderNumber}`,
              },
            });

            commissionEntries.push(entry);

            // Notify contributor
            await tx.notification.create({
              data: {
                userId: memberDist.userId,
                title: "New Commission Earned",
                message: `You earned ${(memberDist.netCommissionCents / 100).toFixed(2)} USD from Order #${order.orderNumber}.`,
                type: "COMMISSION",
                linkUrl: "/dashboard/payouts",
              },
            });
          }
        }
      }

      return { order, commissionEntries };
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
