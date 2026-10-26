import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateAgreementChecksum, validateAllocationRules, MemberAllocationRule } from "@/lib/commission";
import { CommissionModel, AgreementStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const {
      productId,
      teamId,
      commissionPoolBps,
      commissionModel = CommissionModel.TEAM_POOL,
      allocationRules,
      termsText,
      attributionWindowDays = 60,
      recurringDurationMonths = 0,
      refundChargebackPolicy = "30-day proportional clawback on verified cancellations or disputes.",
    } = body;

    // Verify product ownership
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product || (product.ownerId !== user.id && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only the product owner can propose commercial agreements" }, { status: 403 });
    }

    // Validate allocation rules sum exactly to 10,000 bps
    const validation = validateAllocationRules(allocationRules as MemberAllocationRule[]);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const checksum = generateAgreementChecksum({
      productId,
      teamId,
      agreementVersion: 1,
      commissionModel,
      commissionPoolBps,
      allocationRulesJson: allocationRules,
      termsText: termsText.trim(),
    });

    // Create agreement and automatically record owner's acceptance
    const agreement = await db.$transaction(async (tx) => {
      const created = await tx.commercialAgreement.create({
        data: {
          productId,
          teamId: teamId || null,
          agreementVersion: 1,
          commissionModel,
          commissionPoolBps,
          allocationRulesJson: allocationRules,
          refundChargebackPolicy,
          recurringDurationMonths,
          attributionWindowDays,
          termsText: termsText.trim(),
          checksum,
          status: AgreementStatus.PENDING_ACCEPTANCES,
        },
      });

      // Product owner acceptance
      await tx.agreementAcceptance.create({
        data: {
          agreementId: created.id,
          userId: user.id,
          checksum,
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
          userAgent: req.headers.get("user-agent") || "Platform Web",
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, agreement }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
