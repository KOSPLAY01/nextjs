import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/data";

const EXTERNAL_API = process.env.JSON_SERVER_URL || "";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    if (EXTERNAL_API) {
      const usersResponse = await fetch(`${EXTERNAL_API}/users?email=${email}`);
      const existingUsers = await usersResponse.json();

      if (existingUsers.length > 0) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 },
        );
      }

      const newUser = { name, email, password, id: Date.now().toString() };
      const response = await fetch(`${EXTERNAL_API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 },
        );
      }

      const createdUser = await response.json();
      return NextResponse.json(
        {
          message: "User registered successfully",
          user: {
            id: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
          },
        },
        { status: 201 },
      );
    }

    // Fallback to local DB file
    const users = await db.getCollection("users");
    if (users.some((u: any) => u.email === email)) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 },
      );
    }

    const newUser = { name, email, password, id: Date.now().toString() };
    await db.addToCollection("users", newUser);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    const e: any = error;
    if (e?.readonly) {
      return NextResponse.json(
        {
          error:
            "Read-only deployment: cannot create user. Provide a writable backend via JSON_SERVER_URL.",
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
