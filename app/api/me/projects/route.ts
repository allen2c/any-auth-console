// app/api/me/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ProjectsResponse } from "@/app/types/api";

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
        {
          object: "list",
          data: [],
          first_id: null,
          last_id: null,
          has_more: false,
          error: "Unauthorized",
        } as ProjectsResponse,
        { status: 401 }
      );
    }

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
      console.log(
        "Backend API '/me/projects' response status:",
        response.status
      );

      if (!response.ok) {
        // Return a more graceful error with empty items array
        return NextResponse.json(
          {
            object: "list",
            data: [],
            first_id: null,
            last_id: null,
            has_more: false,
            error: `Failed to fetch projects: ${response.status}`,
          } as ProjectsResponse,
          { status: response.status }
        );
      }

      // Return the projects data
      const data = (await response.json()) as ProjectsResponse;
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error("Network error fetching projects:", fetchError);
      // Return empty page with the error
      return NextResponse.json(
        {
          object: "list",
          data: [],
          first_id: null,
          last_id: null,
          has_more: false,
          error: "Failed to connect to backend service",
        } as ProjectsResponse,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in projects API route:", error);
    // Return empty page with the error
    return NextResponse.json(
      {
        object: "list",
        data: [],
        first_id: null,
        last_id: null,
        has_more: false,
        error: "Internal server error",
      } as ProjectsResponse,
      { status: 500 }
    );
  }
}
