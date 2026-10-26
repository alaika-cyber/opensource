import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { validateAllocationRules, MemberAllocationRule } from "@/lib/commission";
import { TeamMemberRole } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: teamId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify user is leader or active member
    const membership = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: user.id,
        },
      },
    });

    if (!membership || (membership.role !== "LEADER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Only team leaders can modify team members" }, { status: 403 });
    }

    const body = await req.json();
    const { action, memberId, email, role, allocations } = body;

    // 1. Update revenue allocation rules
    if (action === "update_allocations") {
      const validation = validateAllocationRules(allocations as MemberAllocationRule[]);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      await db.$transaction(
        (allocations as MemberAllocationRule[]).map((alloc) =>
          db.teamMember.update({
            where: {
              teamId_userId: {
                teamId,
                userId: alloc.userId,
              },
            },
            data: {
              allocationBps: alloc.allocationBps,
            },
          })
        )
      );

      return NextResponse.json({ success: true, message: "Member allocations updated successfully" });
    }

    // 2. Add or invite member
    if (action === "invite") {
      const invitedUser = await db.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!invitedUser) {
        return NextResponse.json({ error: "User with this email not found" }, { status: 404 });
      }

      const existingMember = await db.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: invitedUser.id,
          },
        },
      });

      if (existingMember) {
        return NextResponse.json({ error: "User is already a member of this team" }, { status: 400 });
      }

      const newMember = await db.teamMember.create({
        data: {
          teamId,
          userId: invitedUser.id,
          role: (role as TeamMemberRole) || TeamMemberRole.SALES_REP,
          allocationBps: 0, // initially 0 until redistributed
          status: "ACTIVE",
        },
        include: {
          user: true,
        },
      });

      // Send notification
      await db.notification.create({
        data: {
          userId: invitedUser.id,
          title: "Team Invitation Accepted",
          message: `You were added to the team workspace by ${user.name}.`,
          type: "INVITATION",
          linkUrl: `/dashboard/teams/${teamId}`,
        },
      });

      return NextResponse.json({ success: true, member: newMember });
    }

    // 3. Remove member
    if (action === "remove") {
      if (memberId === user.id) {
        return NextResponse.json({ error: "Team leader cannot remove themselves" }, { status: 400 });
      }

      await db.teamMember.delete({
        where: {
          teamId_userId: {
            teamId,
            userId: memberId,
          },
        },
      });

      return NextResponse.json({ success: true, message: "Member removed" });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
