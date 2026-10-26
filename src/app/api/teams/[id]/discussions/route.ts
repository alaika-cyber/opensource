import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

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

    const membership = await db.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: user.id,
        },
      },
    });

    if (!membership && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Not a member of this team" }, { status: 403 });
    }

    const body = await req.json();
    const { action, title, content, discussionId } = body;

    // 1. Comment on discussion
    if (action === "comment") {
      if (!content || !discussionId) {
        return NextResponse.json({ error: "Content and discussion ID required" }, { status: 400 });
      }

      const comment = await db.teamDiscussionComment.create({
        data: {
          discussionId,
          authorId: user.id,
          content: content.trim(),
        },
        include: {
          author: true,
        },
      });

      return NextResponse.json({ success: true, comment }, { status: 201 });
    }

    // 2. New topic
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const discussion = await db.teamDiscussion.create({
      data: {
        teamId,
        authorId: user.id,
        title: title.trim(),
        content: content.trim(),
      },
      include: {
        author: true,
        comments: true,
      },
    });

    return NextResponse.json({ success: true, discussion }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
