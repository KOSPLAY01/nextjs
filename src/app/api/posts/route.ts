import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/data";

const EXTERNAL_API = process.env.JSON_SERVER_URL || "";

// GET all posts
export async function GET(request: NextRequest) {
  try {
    if (EXTERNAL_API) {
      const response = await fetch(`${EXTERNAL_API}/posts`);
      const posts = await response.json();
      return NextResponse.json(posts, { status: 200 });
    }

    const posts = await db.getCollection("posts");
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// CREATE a new post
export async function POST(request: NextRequest) {
  try {
    const { title, content, createdAt } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 },
      );
    }

    const newPost = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: createdAt || new Date().toISOString(),
    };

    if (EXTERNAL_API) {
      const response = await fetch(`${EXTERNAL_API}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      });

      if (!response.ok)
        return NextResponse.json(
          { error: "Failed to create post" },
          { status: 500 },
        );
      const createdPost = await response.json();
      return NextResponse.json(
        { message: "Post created successfully", post: createdPost },
        { status: 201 },
      );
    }

    const created = await db.addToCollection("posts", newPost);
    return NextResponse.json(
      { message: "Post created successfully", post: created },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create post error:", error);
    const e: any = error;
    if (e?.readonly) {
      return NextResponse.json(
        {
          error:
            "Read-only deployment: cannot create post. Provide a writable backend via JSON_SERVER_URL.",
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
