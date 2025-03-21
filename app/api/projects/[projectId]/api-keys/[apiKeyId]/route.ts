import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { APIKey, APIKeyUpdate } from "@/app/types/api";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; apiKeyId: string } }
): Promise<NextResponse<APIKey | { error: string }>> {
  try {
    const { projectId, apiKeyId } = await params;

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
      `http://localhost:8000/projects/${projectId}/api-keys/${apiKeyId}`,
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
        { error: `Failed to fetch API key: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching API key:", error);
    return NextResponse.json(
      { error: "Failed to fetch API key" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; apiKeyId: string } }
): Promise<NextResponse<APIKey | { error: string }>> {
  try {
    const { projectId, apiKeyId } = await params;

    // Get user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request body
    const apiKeyData: APIKeyUpdate = await request.json();

    // Make request to backend API with session token
    const response = await fetch(
      `http://localhost:8000/projects/${projectId}/api-keys/${apiKeyId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiKeyData),
      }
    );

    if (!response.ok) {
      let errorDetail;
      try {
        const errorResponse = await response.json();
        errorDetail = errorResponse.detail || `Status: ${response.status}`;
      } catch {
        errorDetail = `Status: ${response.status}`;
      }

      return NextResponse.json(
        { error: `Failed to update API key: ${errorDetail}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating API key:", error);
    return NextResponse.json(
      { error: "Failed to update API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; apiKeyId: string } }
): Promise<NextResponse<null | { error: string }>> {
  try {
    const { projectId, apiKeyId } = await params;

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
      `http://localhost:8000/projects/${projectId}/api-keys/${apiKeyId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      let errorDetail;
      try {
        const errorResponse = await response.json();
        errorDetail = errorResponse.detail || `Status: ${response.status}`;
      } catch {
        errorDetail = `Status: ${response.status}`;
      }

      return NextResponse.json(
        { error: `Failed to delete API key: ${errorDetail}` },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
