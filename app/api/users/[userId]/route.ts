// app/api/users/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/app/types/api";
import { createJwtToken } from "@/app/utils/jwt";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await params;

    // Create application JWT token for backend operations
    const appToken = createJwtToken(process.env.APPLICATION_USER_ID || "");

    // Forward the request to the backend API with the user's token
    const response = await fetch(`http://localhost:8000/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${appToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorStatus = response.status;
      let errorMessage = `Failed to fetch user: ${errorStatus}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        console.error("Error parsing error response:", e);
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: errorStatus }
      );
    }

    // Return the user data
    const userData: User = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
