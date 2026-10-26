import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import { ProductType, PricingModel, CommissionModel, AttributionMethod } from "@prisma/client";

const productSchema = z.object({
  name: z.string().min(2),
  shortDesc: z.string().min(10),
  description: z.string().min(20),
  category: z.string().min(2),
  tags: z.array(z.string()).default([]),
  productType: z.nativeEnum(ProductType).default(ProductType.SAAS),
  priceCents: z.number().int().positive(),
  currency: z.string().default("USD"),
  pricingModel: z.nativeEnum(PricingModel).default(PricingModel.ONE_TIME),
  commissionModel: z.nativeEnum(CommissionModel).default(CommissionModel.TEAM_POOL),
  commissionRateBps: z.number().int().min(100).max(8000), // 1% to 80%
  attributionMethod: z.nativeEnum(AttributionMethod).default(AttributionMethod.LAST_TOUCH_LINK),
  attributionWindowDays: z.number().int().min(7).max(365).default(60),
  recurringDurationMonths: z.number().int().min(0).max(36).default(0),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  targetAudience: z.string().optional(),
  images: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const minCommissionBps = searchParams.get("minCommissionBps");

    const where: Record<string, unknown> = {
      status: "ACTIVE",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortDesc: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "All") {
      where.category = category;
    }

    if (minCommissionBps) {
      where.commissionRateBps = { gte: parseInt(minCommissionBps, 10) };
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        opportunities: {
          where: { isOpen: true },
        },
      },
    });

    return NextResponse.json({ products });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let baseSlug = slugify(data.name);
    // Ensure slug uniqueness
    const existing = await db.product.findUnique({ where: { slug: baseSlug } });
    if (existing) {
      baseSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const product = await db.product.create({
      data: {
        ownerId: user.id,
        name: data.name,
        slug: baseSlug,
        shortDesc: data.shortDesc,
        description: data.description,
        category: data.category,
        tags: data.tags,
        productType: data.productType,
        priceCents: data.priceCents,
        currency: data.currency,
        pricingModel: data.pricingModel,
        commissionModel: data.commissionModel,
        commissionRateBps: data.commissionRateBps,
        attributionMethod: data.attributionMethod,
        attributionWindowDays: data.attributionWindowDays,
        recurringDurationMonths: data.recurringDurationMonths,
        websiteUrl: data.websiteUrl || null,
        targetAudience: data.targetAudience,
        images: data.images.length > 0 ? data.images : [
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"
        ],
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
