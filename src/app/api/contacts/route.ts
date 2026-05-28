import { NextRequest, NextResponse } from "next/server";

const API_URL = "http://localhost:3001";

// GET all contacts (or filter by userId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const url = userId
      ? `${API_URL}/contacts?userId=${userId}`
      : `${API_URL}/contacts`;

    const response = await fetch(url);
    const contacts = await response.json();

    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.error("Get contacts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// CREATE a new contact
export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, userId } = await request.json();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 },
      );
    }

    const newContact = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      userId,
    };

    const response = await fetch(`${API_URL}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newContact),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create contact" },
        { status: 500 },
      );
    }

    const createdContact = await response.json();

    return NextResponse.json(
      {
        message: "Contact created successfully",
        contact: createdContact,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create contact error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
