import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DealRegistrationStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, teamId, leadName, leadCompany, leadEmail, dealEstimatedValueCents, notes } = body;

    if (!productId || !leadName || !leadEmail) {
      return NextResponse.json({ error: "Product, Lead Name, and Lead Email are required" }, { status: 400 });
    }

    // Check duplicate active lead for this product
    const existingLead = await db.dealRegistration.findFirst({
      where: {
        productId,
        leadEmail: leadEmail.toLowerCase(),
        status: { in: ["SUBMITTED", "APPROVED"] },
      },
    });

    if (existingLead) {
      return NextResponse.json(
        { error: "A deal registration for this customer email already exists for this product." },
        { status: 409 }
      );
    }

    const deal = await db.dealRegistration.create({
      data: {
        productId,
        teamId: teamId || null,
        userId: user.id,
        leadName: leadName.trim(),
        leadCompany: leadCompany?.trim() || "Independent Organization",
        leadEmail: leadEmail.toLowerCase().trim(),
        dealEstimatedValueCents: dealEstimatedValueCents || 0,
        notes: notes?.trim() || null,
        status: DealRegistrationStatus.SUBMITTED,
      },
    });

    return NextResponse.json({ success: true, deal }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { dealId, status } = body;

    const deal = await db.dealRegistration.findUnique({
      where: { id: dealId },
      include: { product: true },
    });

    if (!deal) {
      return NextResponse.json({ error: "Deal registration not found" }, { status: 404 });
    }

    // Only owner of the product or admin can approve/reject
    if (deal.product.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only product owner can review deal registrations" }, { status: 403 });
    }

    const updated = await db.dealRegistration.update({
      where: { id: dealId },
      data: { status: status as DealRegistrationStatus },
    });

    return NextResponse.json({ success: true, deal: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
