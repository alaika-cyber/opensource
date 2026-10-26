import React from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCents, formatBps } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  DollarSign,
  TrendingUp,
  RotateCcw,
  PlusCircle,
  Users,
  CheckCircle2,
} from "lucide-react";
import { OwnerRefundClient } from "./owner-refund-client";

export default async function ProductOwnerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Products owned by user
  const products = await db.product.findMany({
    where: { ownerId: user.id },
    include: {
      orders: {
        include: {
          commissions: true,
          referralLink: true,
        },
      },
      agreements: {
        include: {
          team: {
            include: { members: true },
          },
        },
      },
    },
  });

  // Calculate gross sales and commission liability
  let grossSalesCents = 0;
  let commissionPoolCommittedCents = 0;
  let totalOrdersCount = 0;
  let allOrders: any[] = [];

  for (const product of products) {
    for (const order of product.orders) {
      if (order.status === "COMPLETED") {
        grossSalesCents += order.grossAmountCents;
        totalOrdersCount += 1;
        const orderComm = order.commissions.reduce((s: number, c: any) => s + c.grossCommissionCents, 0);
        commissionPoolCommittedCents += orderComm;
      }
      allOrders.push({ ...order, productName: product.name });
    }
  }

  const netOwnerRevenueCents = grossSalesCents - commissionPoolCommittedCents;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Product Owner Command Center
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Monitor product campaigns, verified customer transactions, and commission liability.
          </p>
        </div>

        <Link href="/dashboard/products/new">
          <Button size="sm" variant="default" className="gap-1.5 text-xs">
            <PlusCircle className="h-4 w-4" />
            Publish Product
          </Button>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Gross Customer Sales</span>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {formatCents(grossSalesCents)}
          </p>
          <span className="text-[11px] text-zinc-500 block">From verified purchases</span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Net Owner Revenue</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatCents(netOwnerRevenueCents)}
          </p>
          <span className="text-[11px] text-zinc-500 block">After team commissions</span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Commission Pool Paid</span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatCents(commissionPoolCommittedCents)}
          </p>
          <span className="text-[11px] text-zinc-500 block">Distributed to syndicates</span>
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Active Products</span>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {products.length}
          </p>
          <span className="text-[11px] text-zinc-500 block">Catalog listings</span>
        </Card>
      </div>

      {/* Product Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Listed Products</CardTitle>
          <CardDescription>
            Commercial terms, commission pools, and active collaborating teams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-500 space-y-3">
              <p>You have not published any products yet.</p>
              <Link href="/dashboard/products/new">
                <Button size="sm" variant="default">
                  Publish Your First Product
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      <Link href={`/products/${p.slug}`} className="hover:text-indigo-600 transition-colors">
                        {p.name}
                      </Link>
                    </h3>
                    <p className="text-zinc-500 mt-0.5">
                      Price: {formatCents(p.priceCents, p.currency)} • Pool: {formatBps(p.commissionRateBps)} • Window: {p.attributionWindowDays} days
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500">
                      Active Teams: <strong className="text-zinc-800 dark:text-zinc-200">{p.agreements.length}</strong>
                    </span>
                    <Badge variant={p.status === "ACTIVE" ? "success" : "secondary"}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders & Refund Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Orders & Ledger Reconciliation</CardTitle>
          <CardDescription>
            Verified transactions and auditable refund reversals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allOrders.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500">
              No orders recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {allOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        Order #{order.orderNumber}
                      </span>
                      <span className="text-zinc-500 font-medium">({order.productName})</span>
                      <Badge
                        variant={order.status === "COMPLETED" ? "success" : "destructive"}
                        className="text-[10px]"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-zinc-500 mt-0.5">
                      Customer: {order.customerEmail} • Amount: {formatCents(order.grossAmountCents, order.currency)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {order.status === "COMPLETED" && (
                      <OwnerRefundClient orderId={order.id} orderNumber={order.orderNumber} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
