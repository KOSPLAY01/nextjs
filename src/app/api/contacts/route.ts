import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/data";

const EXTERNAL_API = process.env.JSON_SERVER_URL || "";

// GET all contacts (or filter by userId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (EXTERNAL_API) {
      const url = userId
        ? `${EXTERNAL_API}/contacts?userId=${userId}`
        : `${EXTERNAL_API}/contacts`;
      const response = await fetch(url);
      const contacts = await response.json();
      return NextResponse.json(contacts, { status: 200 });
    }

    const contacts = await db.getCollection("contacts");
    const result = userId
      ? contacts.filter((c: any) => String(c.userId) === String(userId))
      : contacts;
    return NextResponse.json(result, { status: 200 });
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

    if (EXTERNAL_API) {
      const response = await fetch(`${EXTERNAL_API}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newContact),
      });

      if (!response.ok)
        return NextResponse.json(
          { error: "Failed to create contact" },
          { status: 500 },
        );
      const createdContact = await response.json();
      return NextResponse.json(
        { message: "Contact created successfully", contact: createdContact },
        { status: 201 },
      );
    }

    const created = await db.addToCollection("contacts", newContact);
    return NextResponse.json(
      { message: "Contact created successfully", contact: created },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create contact error:", error);
    const e: any = error;
    if (e?.readonly) {
      return NextResponse.json(
        {
          error:
            "Read-only deployment: cannot persist contact. Deploy a writable backend or set JSON_SERVER_URL.",
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
