import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Administrator access required" }, { status: 403 });
    }

    const body = await req.json();
    const { action, targetEntity, targetId, reason } = body;

    if (!action || !targetEntity || !targetId) {
      return NextResponse.json({ error: "Missing required moderation parameters" }, { status: 400 });
    }

    let result = null;

    if (targetEntity === "Product") {
      if (action === "VERIFY") {
        result = await db.product.update({
          where: { id: targetId },
          data: { isVerified: true, status: "ACTIVE" },
        });
      } else if (action === "SUSPEND") {
        result = await db.product.update({
          where: { id: targetId },
          data: { status: "ARCHIVED" },
        });
      }
    } else if (targetEntity === "User") {
      if (action === "SUSPEND") {
        result = await db.user.update({
          where: { id: targetId },
          data: { status: "SUSPENDED" },
        });
      } else if (action === "ACTIVATE") {
        result = await db.user.update({
          where: { id: targetId },
          data: { status: "ACTIVE" },
        });
      }
    }

    // Record tamper-evident admin audit log
    await db.adminAuditLog.create({
      data: {
        adminId: user.id,
        action: `MODERATION_${action}`,
        targetEntity,
        targetId,
        detailsJson: { reason, timestamp: new Date() },
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
