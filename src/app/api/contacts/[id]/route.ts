import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/data";

const EXTERNAL_API = process.env.JSON_SERVER_URL || "";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// UPDATE a contact
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { name, email, phone } = await request.json();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 },
      );
    }

    if (EXTERNAL_API) {
      const response = await fetch(`${EXTERNAL_API}/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });

      if (!response.ok)
        return NextResponse.json(
          { error: "Failed to update contact" },
          { status: 500 },
        );
      const updatedContact = await response.json();
      return NextResponse.json(
        { message: "Contact updated successfully", contact: updatedContact },
        { status: 200 },
      );
    }

    const updated = await db.updateInCollection("contacts", id, {
      name,
      email,
      phone,
    });
    if (!updated)
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    return NextResponse.json(
      { message: "Contact updated successfully", contact: updated },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update contact error:", error);
    const e: any = error;
    if (e?.readonly) {
      return NextResponse.json(
        {
          error:
            "Read-only deployment: cannot update contact. Provide a writable backend via JSON_SERVER_URL.",
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

// DELETE a contact
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (EXTERNAL_API) {
      const response = await fetch(`${EXTERNAL_API}/contacts/${id}`, {
        method: "DELETE",
      });
      if (!response.ok)
        return NextResponse.json(
          { error: "Failed to delete contact" },
          { status: 500 },
        );
      return NextResponse.json(
        { message: "Contact deleted successfully" },
        { status: 200 },
      );
    }

    const deleted = await db.deleteFromCollection("contacts", id);
    if (!deleted)
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    return NextResponse.json(
      { message: "Contact deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete contact error:", error);
    const e: any = error;
    if (e?.readonly) {
      return NextResponse.json(
        {
          error:
            "Read-only deployment: cannot delete contact. Provide a writable backend via JSON_SERVER_URL.",
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
