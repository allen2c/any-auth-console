// app/api/me/projects/route.ts
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
      return NextResponse.json(
        { error: "Unauthorized", items: [] },
        { status: 401 }
      );
    }

    // For debugging - log the token structure (remove in production)
    console.log("Token available:", !!token.accessToken);

    try {
      // Forward the request to the backend API with the user's token
      const response = await fetch("http://localhost:8000/me/projects", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      // For debugging
      console.log("Backend response status:", response.status);

      if (!response.ok) {
        // Return a more graceful error with empty items array
        return NextResponse.json(
          {
            error: `Failed to fetch projects: ${response.status}`,
            items: [],
          },
          { status: response.status }
        );
      }

      // Return the projects data
      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error("Network error fetching projects:", fetchError);
      // Return empty items array with the error
      return NextResponse.json(
        {
          error: "Failed to connect to backend service",
          items: [],
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in projects API route:", error);
    // Return empty items array with the error
    return NextResponse.json(
      {
        error: "Internal server error",
        items: [],
      },
      { status: 500 }
    );
  }
}
