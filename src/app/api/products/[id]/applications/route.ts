import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ApplicationStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
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

    const isOwner = project.ownerId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Only project owners can review applications" }, { status: 403 });
    }

    const applications = await db.opportunityApplication.findMany({
      where: {
        opportunity: { productId: project.id },
      },
      include: {
        applicantUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            profile: true,
          },
        },
        opportunity: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
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

    const body = await req.json();
    const { applicationId, status, reviewNotes, department, role, action } = body;

    const application = await db.opportunityApplication.findUnique({
      where: { id: applicationId },
      include: {
        opportunity: true,
        applicantUser: true,
      },
    });

    if (!application || application.opportunity.productId !== project.id) {
      return NextResponse.json({ error: "Application not found for this project" }, { status: 404 });
    }

    // Check if applicant is withdrawing
    if (action === "withdraw" && application.applicantUserId === user.id) {
      await db.opportunityApplication.delete({
        where: { id: applicationId },
      });
      return NextResponse.json({ success: true, message: "Application withdrawn" });
    }

    // Review requires project owner or admin
    const isOwner = project.ownerId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Only project owners can review applications" }, { status: 403 });
    }

    const targetStatus = status as ApplicationStatus;

    const updated = await db.$transaction(async (tx) => {
      const app = await tx.opportunityApplication.update({
        where: { id: applicationId },
        data: {
          status: targetStatus,
          reviewNotes: reviewNotes !== undefined ? reviewNotes : undefined,
        },
      });

      // If accepted, add applicant to projectMembers
      if (targetStatus === "ACCEPTED") {
        const existingMember = await tx.projectMember.findUnique({
          where: {
            projectId_userId: {
              projectId: project.id,
              userId: application.applicantUserId,
            },
          },
        });

        if (!existingMember) {
          await tx.projectMember.create({
            data: {
              projectId: project.id,
              userId: application.applicantUserId,
              role: role || application.proposedRole || "Collaborator",
              department: department || "Operations",
              status: "ACTIVE",
            },
          });
        }

        // Notify applicant of acceptance
        await tx.notification.create({
          data: {
            userId: application.applicantUserId,
            title: "Application Accepted!",
            message: `Congratulations! Your application to join "${project.name}" as ${role || application.proposedRole || "Collaborator"} has been accepted.`,
            type: "APPLICATION",
            linkUrl: `/products/${project.slug}/workspace`,
          },
        });
      } else if (targetStatus === "REJECTED") {
        await tx.notification.create({
          data: {
            userId: application.applicantUserId,
            title: "Application Status Update",
            message: `Your application to join "${project.name}" was not selected at this time.`,
            type: "APPLICATION",
            linkUrl: `/products/${project.slug}`,
          },
        });
      } else if (targetStatus === "UNDER_REVIEW") {
        await tx.notification.create({
          data: {
            userId: application.applicantUserId,
            title: "Application Shortlisted",
            message: `Your application to join "${project.name}" has been shortlisted for further review.`,
            type: "APPLICATION",
            linkUrl: `/products/${project.slug}`,
          },
        });
      }

      return app;
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
