import { NextRequest, NextResponse } from "next/server";

const API_URL = "http://localhost:3001";

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

    const response = await fetch(`${API_URL}/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to update contact" },
        { status: 500 },
      );
    }

    const updatedContact = await response.json();

    return NextResponse.json(
      {
        message: "Contact updated successfully",
        contact: updatedContact,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update contact error:", error);
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

    const response = await fetch(`${API_URL}/contacts/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to delete contact" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Contact deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete contact error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
