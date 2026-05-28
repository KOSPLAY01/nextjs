import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/data";

const EXTERNAL_API = process.env.JSON_SERVER_URL || "";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (EXTERNAL_API) {
      const response = await fetch(
        `${EXTERNAL_API}/users?email=${email}&password=${password}`,
      );
      const users = await response.json();

      if (users.length === 0) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 },
        );
      }

      const user = users[0];
      return NextResponse.json(
        {
          message: "Login successful",
          user: { id: user.id, name: user.name, email: user.email },
        },
        { status: 200 },
      );
    }

    // Fallback to local DB file
    const users = await db.getCollection("users");
    const user = users.find(
      (u: any) => u.email === email && u.password === password,
    );
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        message: "Login successful",
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Login error:", error);
    const err: any = error;
    const isConnRefused =
      err?.cause?.code === "ECONNREFUSED" ||
      err?.code === "ECONNREFUSED" ||
      (err?.message && err.message.includes("connect ECONNREFUSED")) ||
      (err?.message && err.message.includes("fetch failed"));

    if (isConnRefused) {
      return NextResponse.json(
        {
          error:
            "Backend unavailable. Start the JSON server (npm run server) or run npm run dev.",
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
