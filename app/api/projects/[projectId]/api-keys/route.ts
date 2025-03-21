// app/api/projects/[projectId]/api-keys/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { APIKey, APIKeyCreate, Page } from "@/app/types/api";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
): Promise<NextResponse<Page<APIKey> | { error: string }>> {
  try {
    const { projectId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit") || "20";
    const order = searchParams.get("order") || "desc";
    const after = searchParams.get("after") || "";
    const before = searchParams.get("before") || "";

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
      `http://localhost:8000/projects/${projectId}/api-keys?limit=${limit}&order=${order}&after=${after}&before=${before}`,
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
        { error: `Failed to fetch API keys: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
): Promise<NextResponse<APIKey | { error: string }>> {
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
    const apiKeyData: APIKeyCreate = await request.json();

    console.log("Creating API key with data:", apiKeyData);

    // Make request to backend API with session token
    const response = await fetch(
      `http://localhost:8000/projects/${projectId}/api-keys`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiKeyData),
      }
    );

    if (!response.ok) {
      const responseText = await response.text();
      console.error(
        `API key creation failed with status ${response.status}:`,
        responseText
      );

      let errorDetail;
      try {
        const errorResponse = JSON.parse(responseText);
        errorDetail = errorResponse.detail || `Status: ${response.status}`;
      } catch {
        errorDetail = `Status: ${response.status} - ${responseText}`;
      }

      return NextResponse.json(
        { error: `Failed to create API key: ${errorDetail}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("API key created successfully:", {
      id: data.id,
      name: data.name,
      // Don't log the actual API key for security
      hasApiKey: !!data.api_key,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
