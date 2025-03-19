// app/api/projects/[projectId]/members/[memberId]/roles/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Page, Role } from "@/app/types/api";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; memberId: string } }
) {
  try {
    const { projectId, memberId } = await params;

    // Get user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Make request to backend API with session token
    const response = await fetch(
      `http://localhost:8000/projects/${projectId}/members/${memberId}/roles`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `Failed to fetch roles: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        console.error("Error parsing error response:", e);
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Return the roles data
    const data: Page<Role> = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching member roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch member roles" },
      { status: 500 }
    );
  }
}
