// app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    // Get user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.accessToken) {
      console.log("No access token available");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      // Forward the request to the backend API with the user's token
      const response = await fetch("http://localhost:8000/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      // For debugging
      console.log("Backend API '/me' response status:", response.status);

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `Failed to fetch user profile: ${response.status}`,
          },
          { status: response.status }
        );
      }

      // Return the user profile data
      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error("Network error fetching user profile:", fetchError);
      return NextResponse.json(
        {
          error: "Failed to connect to backend service",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in user profile API route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
