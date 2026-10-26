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

    const project = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { projectMembers: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isOwner = user?.id === project.ownerId;
    const isMember = project.projectMembers.some((m) => m.userId === user?.id);
    const isAdmin = user?.role === "ADMIN";
    const canSeeConfidential = isOwner || isMember || isAdmin;

    const documents = await db.projectDocument.findMany({
      where: {
        projectId: project.id,
        isConfidential: canSeeConfidential ? undefined : false,
      },
      include: {
        uploader: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const project = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { projectMembers: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const isOwner = project.ownerId === user.id;
    const isMember = project.projectMembers.some((m) => m.userId === user.id);
    const isAdmin = user.role === "ADMIN";

    if (!isOwner && !isMember && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Not an authorized member of this workspace" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      fileUrl,
      fileSize = 0,
      fileType = "document",
      category = "General",
      isConfidential = false,
    } = body;

    if (!name || !fileUrl) {
      return NextResponse.json({ error: "Document name and file URL are required" }, { status: 400 });
    }

    const document = await db.projectDocument.create({
      data: {
        projectId: project.id,
        uploaderId: user.id,
        name: name.trim(),
        fileUrl: fileUrl.trim(),
        fileSize: Number(fileSize),
        fileType,
        category,
        isConfidential: Boolean(isConfidential),
      },
      include: {
        uploader: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    const { searchParams } = new URL(req.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    const doc = await db.projectDocument.findUnique({
      where: { id: documentId },
    });

    if (!doc || doc.projectId !== project.id) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const isOwner = project.ownerId === user.id;
    const isAdmin = user.role === "ADMIN";
    const isUploader = doc.uploaderId === user.id;

    if (!isOwner && !isAdmin && !isUploader) {
      return NextResponse.json({ error: "Unauthorized to delete this document" }, { status: 403 });
    }

    await db.projectDocument.delete({ where: { id: documentId } });

    return NextResponse.json({ success: true, message: "Document deleted" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
