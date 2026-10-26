import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        teamsLed: true,
        teamMemberships: {
          include: {
            team: true,
          },
        },
        products: true,
      },
    });

    if (!fullUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, resetToken, resetTokenExpiry, emailVerifyToken, ...safeUser } = fullUser;

    return NextResponse.json({ user: safeUser });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
