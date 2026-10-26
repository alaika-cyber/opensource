import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    // Find product/project by id or slug
    const project = await db.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            profile: true,
          },
        },
        projectMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                profile: true,
              },
            },
          },
        },
        milestones: {
          orderBy: { dueDate: "asc" },
        },
        goals: {
          orderBy: { createdAt: "desc" },
        },
        meetings: {
          orderBy: { scheduledAt: "asc" },
          include: {
            creator: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        documents: {
          orderBy: { createdAt: "desc" },
          include: {
            uploader: {
              select: { id: true, name: true },
            },
          },
        },
        businessPlans: {
          orderBy: { createdAt: "desc" },
        },
        leads: {
          orderBy: { createdAt: "desc" },
        },
        risks: {
          orderBy: { createdAt: "desc" },
        },
        decisions: {
          orderBy: { decidedAt: "desc" },
          include: {
            decidedBy: {
              select: { id: true, name: true },
            },
          },
        },
        updates: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
        tasks: {
          orderBy: { createdAt: "desc" },
          include: {
            assignee: {
              select: { id: true, name: true, avatarUrl: true },
            },
            creator: {
              select: { id: true, name: true },
            },
          },
        },
        opportunities: {
          where: { isOpen: true },
          include: {
            applications: {
              include: {
                applicantUser: {
                  select: { id: true, name: true, email: true, avatarUrl: true, profile: true },
                },
              },
            },
          },
        },
        agreements: {
          include: {
            team: true,
          },
        },
        bookmarks: user ? { where: { userId: user.id } } : false,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check authorization for confidential documents
    const isOwner = user?.id === project.ownerId;
    const isMember = project.projectMembers.some((m) => m.userId === user?.id);
    const isAdmin = user?.role === "ADMIN";
    const canAccessConfidential = isOwner || isMember || isAdmin;

    if (!canAccessConfidential) {
      project.documents = project.documents.filter((d) => !d.isConfidential);
    }

    const isBookmarked = user ? (project.bookmarks?.length ?? 0) > 0 : false;

    return NextResponse.json({
      project: {
        ...project,
        isBookmarked,
        canManage: isOwner || isAdmin,
        isMember: isOwner || isMember || isAdmin,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const project = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.ownerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Only project owners or administrators can edit project settings" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      shortDesc,
      description,
      category,
      tags,
      businessStage,
      businessGoals,
      requiredSkills,
      openPositions,
      compensationModels,
      budgetDescription,
      equityProposal,
      isConfidential,
      applicationDeadline,
      visibility,
      status,
      websiteUrl,
      targetAudience,
    } = body;

    const updated = await db.product.update({
      where: { id: project.id },
      data: {
        name: name !== undefined ? name : undefined,
        shortDesc: shortDesc !== undefined ? shortDesc : undefined,
        description: description !== undefined ? description : undefined,
        category: category !== undefined ? category : undefined,
        tags: tags !== undefined ? tags : undefined,
        businessStage: businessStage !== undefined ? businessStage : undefined,
        businessGoals: businessGoals !== undefined ? businessGoals : undefined,
        requiredSkills: requiredSkills !== undefined ? requiredSkills : undefined,
        openPositions: openPositions !== undefined ? openPositions : undefined,
        compensationModels: compensationModels !== undefined ? compensationModels : undefined,
        budgetDescription: budgetDescription !== undefined ? budgetDescription : undefined,
        equityProposal: equityProposal !== undefined ? equityProposal : undefined,
        isConfidential: isConfidential !== undefined ? isConfidential : undefined,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
        visibility: visibility !== undefined ? visibility : undefined,
        status: status !== undefined ? status : undefined,
        websiteUrl: websiteUrl !== undefined ? websiteUrl : undefined,
        targetAudience: targetAudience !== undefined ? targetAudience : undefined,
      },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
