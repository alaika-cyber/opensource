import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required to apply" }, { status: 401 });
    }

    const project = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        owner: true,
        projectMembers: true,
        opportunities: {
          where: { isOpen: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.ownerId === user.id) {
      return NextResponse.json({ error: "You cannot apply to your own project" }, { status: 400 });
    }

    // Check if already a member
    const alreadyMember = project.projectMembers.some((m) => m.userId === user.id);
    if (alreadyMember) {
      return NextResponse.json({ error: "You are already a member of this project" }, { status: 400 });
    }

    const body = await req.json();
    const {
      proposedRole,
      coverLetter,
      proposedStrategy,
      skills = [],
      requestedCompensation,
      opportunityId: directOppId,
    } = body;

    if (!coverLetter || coverLetter.trim().length < 10) {
      return NextResponse.json({ error: "Please provide a detailed application statement (minimum 10 characters)" }, { status: 400 });
    }

    // Determine target opportunity: use directOppId, or existing open one, or create default
    let targetOpportunityId = directOppId;

    if (!targetOpportunityId) {
      if (project.opportunities.length > 0) {
        targetOpportunityId = project.opportunities[0].id;
      } else {
        const createdOpp = await db.opportunity.create({
          data: {
            productId: project.id,
            title: "General Business Collaboration & Growth",
            description: `Collaboration opportunity for ${project.name}`,
            rolesNeeded: project.openPositions.length > 0 ? project.openPositions : ["Growth Specialist", "Contributor"],
            isOpen: true,
          },
        });
        targetOpportunityId = createdOpp.id;
      }
    }

    // Check duplicate pending application
    const existingApplication = await db.opportunityApplication.findFirst({
      where: {
        opportunity: { productId: project.id },
        applicantUserId: user.id,
        status: { in: ["PENDING", "UNDER_REVIEW"] },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You already have an active application under review for this project" },
        { status: 400 }
      );
    }

    const application = await db.opportunityApplication.create({
      data: {
        opportunityId: targetOpportunityId,
        applicantUserId: user.id,
        coverLetter: coverLetter.trim(),
        proposedStrategy: proposedStrategy?.trim() || null,
        proposedRole: proposedRole?.trim() || "Collaborator",
        skills: Array.isArray(skills) ? skills : [],
        requestedCompensation: requestedCompensation || null,
        status: "PENDING",
      },
      include: {
        applicantUser: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    // Notify project founder
    await db.notification.create({
      data: {
        userId: project.ownerId,
        title: "New Project Application",
        message: `${user.name} applied to join "${project.name}" as ${application.proposedRole}.`,
        type: "APPLICATION",
        linkUrl: `/products/${project.slug}/workspace?tab=team`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
