import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import { ProductType, PricingModel, CommissionModel, AttributionMethod } from "@prisma/client";

const projectSchema = z.object({
  name: z.string().min(2),
  shortDesc: z.string().min(10),
  description: z.string().min(20),
  category: z.string().min(2),
  tags: z.array(z.string()).default([]),
  productType: z.nativeEnum(ProductType).default(ProductType.SAAS),
  priceCents: z.number().int().nonnegative().default(19900),
  currency: z.string().default("USD"),
  pricingModel: z.nativeEnum(PricingModel).default(PricingModel.ONE_TIME),
  commissionModel: z.nativeEnum(CommissionModel).default(CommissionModel.TEAM_POOL),
  commissionRateBps: z.number().int().min(0).max(8000).default(2000), // 0% to 80%
  attributionMethod: z.nativeEnum(AttributionMethod).default(AttributionMethod.LAST_TOUCH_LINK),
  attributionWindowDays: z.number().int().min(7).max(365).default(60),
  recurringDurationMonths: z.number().int().min(0).max(36).default(0),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  targetAudience: z.string().optional(),
  images: z.array(z.string()).default([]),

  // Business Collaboration Fields
  businessStage: z.string().default("MVP"),
  businessGoals: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  openPositions: z.array(z.string()).default([]),
  compensationModels: z.array(z.string()).default(["COMMISSION", "REVENUE_SHARE"]),
  budgetDescription: z.string().optional(),
  equityProposal: z.string().optional(),
  isConfidential: z.boolean().default(false),
  applicationDeadline: z.string().optional().nullable(),
  visibility: z.string().default("PUBLIC"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const stage = searchParams.get("stage");
    const compensation = searchParams.get("compensation");
    const skill = searchParams.get("skill");
    const sort = searchParams.get("sort") || "newest";

    const where: Record<string, unknown> = {
      status: "ACTIVE",
      visibility: "PUBLIC",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortDesc: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
        { requiredSkills: { hasSome: [search] } },
      ];
    }

    if (category && category !== "All") {
      where.category = category;
    }

    if (stage && stage !== "All") {
      where.businessStage = stage;
    }

    if (compensation && compensation !== "All") {
      where.compensationModels = { has: compensation };
    }

    if (skill && skill !== "All") {
      where.requiredSkills = { has: skill };
    }

    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sort === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sort === "name") {
      orderBy = { name: "asc" };
    }

    const products = await db.product.findMany({
      where,
      orderBy,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            profile: true,
          },
        },
        opportunities: {
          where: { isOpen: true },
        },
        projectMembers: {
          select: { id: true, userId: true, role: true, department: true },
        },
        _count: {
          select: {
            projectMembers: true,
            opportunities: true,
            tasks: true,
            milestones: true,
          },
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
    const parsed = projectSchema.safeParse(body);

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

    // Default image if none provided
    const defaultImages = [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    ];

    const product = await db.$transaction(async (tx) => {
      const created = await tx.product.create({
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
          targetAudience: data.targetAudience || null,
          images: data.images.length > 0 ? data.images : defaultImages,
          businessStage: data.businessStage,
          businessGoals: data.businessGoals,
          requiredSkills: data.requiredSkills,
          openPositions: data.openPositions,
          compensationModels: data.compensationModels,
          budgetDescription: data.budgetDescription || null,
          equityProposal: data.equityProposal || null,
          isConfidential: data.isConfidential,
          applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
          visibility: data.visibility,
          status: "ACTIVE",
        },
      });

      // Automatically add project founder as first ProjectMember
      await tx.projectMember.create({
        data: {
          projectId: created.id,
          userId: user.id,
          role: "Founder / Executive Lead",
          department: "Operations",
          status: "ACTIVE",
        },
      });

      // If open positions or required skills specified, open an Opportunity for recruitment
      const rolesNeeded = data.openPositions.length > 0 ? data.openPositions : ["Growth Specialist", "Collaborator"];
      await tx.opportunity.create({
        data: {
          productId: created.id,
          title: `Growth & Collaboration Syndicate for ${created.name}`,
          description: `We are actively recruiting ambitious professionals across ${rolesNeeded.join(", ")} to scale ${created.name}.`,
          rolesNeeded,
          isOpen: true,
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
