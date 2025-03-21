// app/api/projects/[projectId]/invites/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

interface InviteCreate {
  email: string;
  role?: string;
}

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

    // Get the request body
    const inviteData: InviteCreate = await request.json();

    if (!inviteData.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Use query parameter to control SMTP usage (defaults to true)
    const url = new URL(request.url);
    const useSmtp = url.searchParams.get("use_smtp") !== "false";

    // Make request to backend API with session token
    const response = await fetch(
      `http://localhost:8000/projects/${projectId}/invites?use_smtp=${useSmtp}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inviteData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          error:
            errorData.detail || `Failed to create invite: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating project invite:", error);
    return NextResponse.json(
      { error: "Failed to create project invite" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;

    // Get user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "20";
    const order = searchParams.get("order") || "desc";
    const after = searchParams.get("after") || "";
    const before = searchParams.get("before") || "";

    // Make request to backend API with session token
    const response = await fetch(
      `http://localhost:8000/projects/${projectId}/invites?limit=${limit}&order=${order}&after=${after}&before=${before}`,
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
        { error: `Failed to fetch invites: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching project invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch project invites" },
      { status: 500 }
    );
  }
}
