// app/api/projects/[projectId]/members/[memberId]/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { User } from "@/app/types/api";

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

    const userResponse = await fetch(
      `http://localhost:8000/projects/${projectId}/members/${memberId}/user`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!userResponse.ok) {
      const status = userResponse.status;
      let errorMessage = `Failed to fetch user: ${status}`;

      try {
        const errorData = await userResponse.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        console.error("Error parsing error response:", e);
      }

      return NextResponse.json({ error: errorMessage }, { status });
    }

    // Return the user data
    const userData: User = await userResponse.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching project member user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user information" },
      { status: 500 }
    );
  }
}
