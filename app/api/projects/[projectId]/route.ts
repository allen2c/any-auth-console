// app/api/projects/[projectId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    // Extract projectId from the URL directly
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const projectId = pathParts[pathParts.length - 1]; // Get the last segment of the path

    // Get user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Forward the request to the backend API with the user's token
    const response = await fetch(
      `http://localhost:8000/projects/${projectId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch project: ${response.status}` },
        { status: response.status }
      );
    }

    // Return the project data
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}
