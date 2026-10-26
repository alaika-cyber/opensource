import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";
import { TeamVisibility, TeamMemberRole } from "@prisma/client";

const teamSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(15),
  industryFocus: z.string().optional(),
  skills: z.array(z.string()).default([]),
  visibility: z.nativeEnum(TeamVisibility).default(TeamVisibility.PUBLIC),
  leaderAllocationBps: z.number().int().min(1000).max(10000).default(10000), // 100% initial if single member
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const industry = searchParams.get("industry");

    const where: Record<string, unknown> = {
      visibility: "PUBLIC",
      status: "ACTIVE",
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { industryFocus: { contains: search, mode: "insensitive" } },
      ];
    }

    if (industry && industry !== "All") {
      where.industryFocus = { contains: industry, mode: "insensitive" };
    }

    const teams = await db.team.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ teams });
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
    const parsed = teamSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let baseSlug = slugify(data.name);
    const existing = await db.team.findUnique({ where: { slug: baseSlug } });
    if (existing) {
      baseSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    // Create team and assign creator as LEADER with initial allocation in transaction
    const team = await db.$transaction(async (tx) => {
      const createdTeam = await tx.team.create({
        data: {
          name: data.name,
          slug: baseSlug,
          description: data.description,
          industryFocus: data.industryFocus || "Multi-Industry Growth",
          skills: data.skills,
          visibility: data.visibility,
          leaderId: user.id,
          status: "ACTIVE",
          logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
        },
      });

      await tx.teamMember.create({
        data: {
          teamId: createdTeam.id,
          userId: user.id,
          role: TeamMemberRole.LEADER,
          allocationBps: 10000, // 100% until other members join and agree to splits
          status: "ACTIVE",
        },
      });

      return createdTeam;
    });

    return NextResponse.json({ success: true, team }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
