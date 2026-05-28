import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/data";

const EXTERNAL_API = process.env.JSON_SERVER_URL || "";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// UPDATE a post
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 },
      );
    }

    if (EXTERNAL_API) {
      const response = await fetch(`${EXTERNAL_API}/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok)
        return NextResponse.json(
          { error: "Failed to update post" },
          { status: 500 },
        );
      const updatedPost = await response.json();
      return NextResponse.json(
        { message: "Post updated successfully", post: updatedPost },
        { status: 200 },
      );
    }

    const updated = await db.updateInCollection("posts", id, {
      title,
      content,
    });
    if (!updated)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(
      { message: "Post updated successfully", post: updated },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update post error:", error);
    const e: any = error;
    if (e?.readonly) {
      return NextResponse.json(
        {
          error:
            "Read-only deployment: cannot update post. Provide a writable backend via JSON_SERVER_URL.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE a post
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (EXTERNAL_API) {
      const response = await fetch(`${EXTERNAL_API}/posts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok)
        return NextResponse.json(
          { error: "Failed to delete post" },
          { status: 500 },
        );
      return NextResponse.json(
        { message: "Post deleted successfully" },
        { status: 200 },
      );
    }

    const deleted = await db.deleteFromCollection("posts", id);
    if (!deleted)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(
      { message: "Post deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete post error:", error);
    const e: any = error;
    if (e?.readonly) {
      return NextResponse.json(
        {
          error:
            "Read-only deployment: cannot delete post. Provide a writable backend via JSON_SERVER_URL.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
