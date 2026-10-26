import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { DisputeStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, agreementId, respondentId, reason, description, evidence } = body;

    if (!reason || !description) {
      return NextResponse.json({ error: "Reason and description are required" }, { status: 400 });
    }

    const dispute = await db.dispute.create({
      data: {
        orderId: orderId || null,
        agreementId: agreementId || null,
        reporterId: user.id,
        respondentId: respondentId || null,
        reason: reason.trim(),
        description: description.trim(),
        evidence: evidence || null,
        status: DisputeStatus.OPEN,
      },
    });

    return NextResponse.json({ success: true, dispute }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await req.json();
    const { disputeId, status, resolution } = body;

    const dispute = await db.dispute.update({
      where: { id: disputeId },
      data: {
        status: status as DisputeStatus,
        resolution: resolution?.trim() || null,
        resolvedAt: status === "RESOLVED" || status === "DISMISSED" ? new Date() : undefined,
      },
    });

    // Record admin audit log
    await db.adminAuditLog.create({
      data: {
        adminId: user.id,
        action: `DISPUTE_${status}`,
        targetEntity: "Dispute",
        targetId: disputeId,
        detailsJson: { resolution, status },
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, dispute });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
