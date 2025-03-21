import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Page, Role } from "@/app/types/api";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; apiKeyId: string } }
): Promise<NextResponse<Page<Role> | { error: string }>> {
  try {
    const { projectId, apiKeyId } = params;

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
      `http://localhost:8000/projects/${projectId}/api-keys/${apiKeyId}/roles`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "API key not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch API key roles: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching API key roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch API key roles" },
      { status: 500 }
    );
  }
}
