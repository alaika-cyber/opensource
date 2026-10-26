import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { processOrderRefund } from "@/lib/ledger";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: orderId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only product owner or admin can authorize a refund
    if (order.product.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only product owners or administrators can refund orders" }, { status: 403 });
    }

    if (order.status === "REFUNDED") {
      return NextResponse.json({ error: "Order has already been refunded" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = body.reason || "Customer refund requested";

    const result = await processOrderRefund(orderId, reason);

    return NextResponse.json({ success: true, ...result });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
