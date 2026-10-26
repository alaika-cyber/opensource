import React from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProjectWorkspaceClient } from "./workspace-client";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ProjectWorkspacePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { tab } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/sign-in?redirect=/products/${slug}/workspace`);
  }

  const project = await db.product.findUnique({
    where: { slug },
    include: {
      owner: {
        select: { id: true, name: true, email: true, avatarUrl: true, profile: true },
      },
      projectMembers: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true, profile: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      milestones: {
        orderBy: { dueDate: "asc" },
      },
      goals: {
        orderBy: { createdAt: "desc" },
      },
      meetings: {
        include: {
          creator: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { scheduledAt: "asc" },
      },
      documents: {
        include: {
          uploader: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
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
        include: {
          decidedBy: { select: { id: true, name: true } },
        },
        orderBy: { decidedAt: "desc" },
      },
      updates: {
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, avatarUrl: true } },
          creator: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      opportunities: {
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
          team: {
            include: {
              members: { include: { user: true } },
            },
          },
        },
      },
    },
  });

  if (!project) notFound();

  // Server-Side Authorization Check
  const isOwner = project.ownerId === user.id;
  const isMember = project.projectMembers.some((m) => m.userId === user.id);
  const isAdmin = user.role === "ADMIN";

  if (!isOwner && !isMember && !isAdmin) {
    // Non-member trying to access private workspace: redirect to public opportunity view
    redirect(`/products/${project.slug}`);
  }

  // Filter confidential documents if unauthorized (already guaranteed member/owner/admin here)

  const serializableProject = {
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    applicationDeadline: project.applicationDeadline ? project.applicationDeadline.toISOString() : null,
    milestones: project.milestones.map((m) => ({
      ...m,
      dueDate: m.dueDate ? m.dueDate.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    })),
    goals: project.goals.map((g) => ({
      ...g,
      deadline: g.deadline ? g.deadline.toISOString() : null,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    })),
    meetings: project.meetings.map((m) => ({
      ...m,
      scheduledAt: m.scheduledAt.toISOString(),
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    })),
    documents: project.documents.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    })),
    businessPlans: project.businessPlans.map((b) => ({
      ...b,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })),
    leads: project.leads.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })),
    risks: project.risks.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    decisions: project.decisions.map((d) => ({
      ...d,
      decidedAt: d.decidedAt.toISOString(),
    })),
    updates: project.updates.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
    tasks: project.tasks.map((t) => ({
      ...t,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    projectMembers: project.projectMembers.map((m) => ({
      ...m,
      joinedAt: m.joinedAt.toISOString(),
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProjectWorkspaceClient
        project={serializableProject}
        currentUserId={user.id}
        isOwner={isOwner}
        isAdmin={isAdmin}
        initialTab={tab || "overview"}
      />
    </div>
  );
}
