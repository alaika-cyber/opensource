import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AgreementStatus } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id: agreementId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const agreement = await db.commercialAgreement.findUnique({
      where: { id: agreementId },
      include: {
        product: true,
        team: {
          include: {
            members: true,
          },
        },
        acceptances: true,
      },
    });

    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    // Check if user is already an accepted party
    const alreadyAccepted = agreement.acceptances.some((a) => a.userId === user.id);
    if (alreadyAccepted) {
      return NextResponse.json({ error: "You have already accepted this agreement" }, { status: 400 });
    }

    // Check user eligibility (must be product owner or a member of the participating team)
    const isOwner = agreement.product.ownerId === user.id;
    const isTeamMember = agreement.team?.members.some((m) => m.userId === user.id);

    if (!isOwner && !isTeamMember && user.role !== "ADMIN") {
      return NextResponse.json({ error: "You are not a party to this agreement" }, { status: 403 });
    }

    // Record acceptance with checksum verification
    await db.$transaction(async (tx) => {
      await tx.agreementAcceptance.create({
        data: {
          agreementId,
          userId: user.id,
          checksum: agreement.checksum,
          ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
          userAgent: req.headers.get("user-agent") || "Platform Web",
        },
      });

      // Check if all team members and owner have accepted
      const totalRequiredParties = 1 + (agreement.team?.members.length || 0);
      const currentAcceptances = agreement.acceptances.length + 1;

      if (currentAcceptances >= totalRequiredParties) {
        await tx.commercialAgreement.update({
          where: { id: agreementId },
          data: { status: AgreementStatus.ACTIVE },
        });
      }
    });

    return NextResponse.json({ success: true, message: "Agreement accepted successfully" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
