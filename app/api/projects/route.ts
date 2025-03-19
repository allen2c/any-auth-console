// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createJwtToken } from "@/app/utils/jwt";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const data = await request.json();

    // Validate project name format
    const { name, full_name } = data;

    if (!name || !/^[a-zA-Z0-9_-]{4,64}$/.test(name)) {
      return NextResponse.json(
        {
          detail:
            "Project name must be 4-64 characters and contain only letters, numbers, underscores, and hyphens",
        },
        { status: 400 }
      );
    }

    // Generate application JWT token
    const token = createJwtToken(process.env.APPLICATION_USER_ID || "");

    // Make sure we have a user ID for created_by field
    const session = await request.headers.get("x-user-id");
    const userId = session || "system";

    // Call the backend API
    const response = await fetch("http://localhost:8000/projects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        full_name: full_name || undefined,
        metadata: {},
        created_by: userId,
      }),
    });

    // Get response data
    const responseData = await response.json();

    // Handle errors
    if (!response.ok) {
      return NextResponse.json(
        { detail: responseData.detail || "Failed to create project" },
        { status: response.status }
      );
    }

    // Return success with project data
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
