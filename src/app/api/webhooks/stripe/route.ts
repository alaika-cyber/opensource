import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processOrderRefund } from "@/lib/ledger";
import { WebhookStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    let event;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid payload JSON" }, { status: 400 });
    }

    const eventId = event.id || `evt_${Math.random().toString(36).substring(2, 10)}`;
    const eventType = event.type || "unknown";

    // 1. Idempotency Check: verify if event was already recorded
    const existingWebhook = await db.webhookEvent.findUnique({
      where: { eventId },
    });

    if (existingWebhook) {
      return NextResponse.json(
        { received: true, message: "Duplicate webhook event already processed" },
        { status: 200 }
      );
    }

    // 2. Record incoming webhook in database
    await db.webhookEvent.create({
      data: {
        provider: "stripe",
        eventId,
        eventType,
        payload: event,
        status: WebhookStatus.PROCESSED,
      },
    });

    // 3. Process event types
    if (eventType === "charge.refunded" || eventType === "payment_intent.canceled") {
      const externalRef = event.data?.object?.id;
      if (externalRef) {
        const order = await db.order.findFirst({
          where: { externalProviderRef: externalRef },
        });

        if (order && order.status !== "REFUNDED") {
          await processOrderRefund(order.id, `External refund event received: ${eventType}`);
        }
      }
    }

    return NextResponse.json({ received: true, processed: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Webhook handler error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
