import { NextRequest, NextResponse } from "next/server";

const API_URL = "http://localhost:3001";

// GET all posts
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${API_URL}/posts`);
    const posts = await response.json();

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

    const response = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create post" },
        { status: 500 },
      );
    }

    const createdPost = await response.json();

    return NextResponse.json(
      {
        message: "Post created successfully",
        post: createdPost,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
