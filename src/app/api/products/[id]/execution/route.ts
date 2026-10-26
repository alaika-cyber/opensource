import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function verifyProjectAccess(projectIdOrSlug: string, userId: string, role: string) {
  const project = await db.product.findFirst({
    where: { OR: [{ id: projectIdOrSlug }, { slug: projectIdOrSlug }] },
    include: { projectMembers: true },
  });

  if (!project) return { error: "Project not found", status: 404 } as const;

  const isOwner = project.ownerId === userId;
  const isMember = project.projectMembers.some((m) => m.userId === userId);
  const isAdmin = role === "ADMIN";

  if (!isOwner && !isMember && !isAdmin) {
    return { error: "Forbidden: Not an authorized member of this workspace", status: 403 } as const;
  }

  return { project, isOwner, isMember, isAdmin };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const auth = await verifyProjectAccess(id, user.id, user.role);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { project } = auth;
    const body = await req.json();
    const { tool } = body;

    // 1. Milestones
    if (tool === "milestone") {
      const { title, description, dueDate, kpis } = body;
      if (!title) return NextResponse.json({ error: "Milestone title required" }, { status: 400 });

      const milestone = await db.projectMilestone.create({
        data: {
          projectId: project.id,
          title: title.trim(),
          description: description?.trim() || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          kpis: kpis || null,
          status: "PENDING",
        },
      });

      return NextResponse.json({ success: true, milestone }, { status: 201 });
    }

    // 2. Goals & KPIs
    if (tool === "goal") {
      const { title, targetValue, currentValue = "0", unit, deadline, status = "ON_TRACK" } = body;
      if (!title || !targetValue) {
        return NextResponse.json({ error: "Goal title and target value required" }, { status: 400 });
      }

      const goal = await db.projectGoal.create({
        data: {
          projectId: project.id,
          title: title.trim(),
          targetValue: String(targetValue).trim(),
          currentValue: String(currentValue).trim(),
          unit: unit || null,
          deadline: deadline ? new Date(deadline) : null,
          status,
        },
      });

      return NextResponse.json({ success: true, goal }, { status: 201 });
    }

    // 3. Business Plan
    if (tool === "business_plan") {
      const {
        title = "Strategic Execution Plan",
        executiveSummary,
        targetMarket,
        valueProposition,
        revenueStrategy,
        marketingChannels,
        operationsRoadmap,
        financialProjections,
        templateName,
      } = body;

      if (!executiveSummary || !targetMarket || !valueProposition) {
        return NextResponse.json({ error: "Executive summary, target market, and value proposition required" }, { status: 400 });
      }

      const plan = await db.projectBusinessPlan.create({
        data: {
          projectId: project.id,
          title: title.trim(),
          executiveSummary: executiveSummary.trim(),
          targetMarket: targetMarket.trim(),
          valueProposition: valueProposition.trim(),
          revenueStrategy: revenueStrategy?.trim() || "Multi-tiered revenue sharing and direct sales",
          marketingChannels: marketingChannels?.trim() || "Inbound content, developer relations, B2B outbound",
          operationsRoadmap: operationsRoadmap?.trim() || "Sprint execution, weekly KPI retrospectives",
          financialProjections: financialProjections || null,
          templateName: templateName || "Custom",
        },
      });

      return NextResponse.json({ success: true, plan }, { status: 201 });
    }

    // 4. Sales Leads / Pipeline
    if (tool === "lead") {
      const { leadName, company, email, estimatedValueCents = 0, stage = "PROSPECT", notes } = body;
      if (!leadName || !company || !email) {
        return NextResponse.json({ error: "Lead name, company, and email required" }, { status: 400 });
      }

      const lead = await db.projectLead.create({
        data: {
          projectId: project.id,
          leadName: leadName.trim(),
          company: company.trim(),
          email: email.trim(),
          estimatedValueCents: Number(estimatedValueCents),
          stage,
          notes: notes?.trim() || null,
          assigneeId: user.id,
        },
      });

      return NextResponse.json({ success: true, lead }, { status: 201 });
    }

    // 5. Risks & Blockers
    if (tool === "risk") {
      const { description, impact = "MEDIUM", probability = "MEDIUM", mitigationPlan } = body;
      if (!description || !mitigationPlan) {
        return NextResponse.json({ error: "Risk description and mitigation plan required" }, { status: 400 });
      }

      const risk = await db.projectRisk.create({
        data: {
          projectId: project.id,
          description: description.trim(),
          impact,
          probability,
          mitigationPlan: mitigationPlan.trim(),
          status: "IDENTIFIED",
        },
      });

      return NextResponse.json({ success: true, risk }, { status: 201 });
    }

    // 6. Decision Log
    if (tool === "decision") {
      const { title, decision, rationale } = body;
      if (!title || !decision) {
        return NextResponse.json({ error: "Decision title and summary required" }, { status: 400 });
      }

      const recorded = await db.projectDecision.create({
        data: {
          projectId: project.id,
          title: title.trim(),
          decision: decision.trim(),
          rationale: rationale?.trim() || null,
          decidedById: user.id,
        },
        include: {
          decidedBy: {
            select: { id: true, name: true },
          },
        },
      });

      return NextResponse.json({ success: true, decision: recorded }, { status: 201 });
    }

    // 7. Progress Updates / Announcements
    if (tool === "update") {
      const { title, content } = body;
      if (!title || !content) {
        return NextResponse.json({ error: "Update title and content required" }, { status: 400 });
      }

      const update = await db.projectUpdate.create({
        data: {
          projectId: project.id,
          authorId: user.id,
          title: title.trim(),
          content: content.trim(),
        },
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      });

      return NextResponse.json({ success: true, update }, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown execution tool specified" }, { status: 400 });
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

    const auth = await verifyProjectAccess(id, user.id, user.role);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { project } = auth;
    const body = await req.json();
    const { tool, itemId } = body;

    if (!tool || !itemId) {
      return NextResponse.json({ error: "Tool and item ID required" }, { status: 400 });
    }

    if (tool === "milestone") {
      const { status, progressPercent } = body;
      const updated = await db.projectMilestone.update({
        where: { id: itemId },
        data: {
          status: status !== undefined ? status : undefined,
          progressPercent: progressPercent !== undefined ? Number(progressPercent) : undefined,
        },
      });
      return NextResponse.json({ success: true, milestone: updated });
    }

    if (tool === "goal") {
      const { currentValue, status } = body;
      const updated = await db.projectGoal.update({
        where: { id: itemId },
        data: {
          currentValue: currentValue !== undefined ? String(currentValue) : undefined,
          status: status !== undefined ? status : undefined,
        },
      });
      return NextResponse.json({ success: true, goal: updated });
    }

    if (tool === "lead") {
      const { stage, notes } = body;
      const updated = await db.projectLead.update({
        where: { id: itemId },
        data: {
          stage: stage !== undefined ? stage : undefined,
          notes: notes !== undefined ? notes : undefined,
        },
      });
      return NextResponse.json({ success: true, lead: updated });
    }

    if (tool === "risk") {
      const { status, mitigationPlan } = body;
      const updated = await db.projectRisk.update({
        where: { id: itemId },
        data: {
          status: status !== undefined ? status : undefined,
          mitigationPlan: mitigationPlan !== undefined ? mitigationPlan : undefined,
        },
      });
      return NextResponse.json({ success: true, risk: updated });
    }

    return NextResponse.json({ error: "Unsupported update action" }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
