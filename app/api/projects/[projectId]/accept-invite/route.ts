// app/api/projects/[projectId]/accept-invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = await params;

    // Get user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the invite token from the request
    const searchParams = request.nextUrl.searchParams;
    const inviteToken = searchParams.get("token");

    if (!inviteToken) {
      return NextResponse.json(
        { error: "Invite token is required" },
        { status: 400 }
      );
    }

    // Make request to backend API with session token to accept the invite
    const response = await fetch(
      `http://localhost:8000/projects/${projectId}/accept-invite?token=${inviteToken}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData.detail || `Failed to accept invite: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error accepting project invite:", error);
    return NextResponse.json(
      { error: "Failed to accept project invite" },
      { status: 500 }
    );
  }
}
