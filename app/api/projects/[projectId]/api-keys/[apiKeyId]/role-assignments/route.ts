// app/api/projects/[projectId]/api-keys/[apiKeyId]/role-assignments/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Page, RoleAssignment } from "@/app/types/api";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; apiKeyId: string } }
): Promise<NextResponse<Page<RoleAssignment> | { error: string }>> {
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
      `http://localhost:8000/projects/${projectId}/api-keys/${apiKeyId}/role-assignments`,
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
        { error: `Failed to fetch role assignments: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching role assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch role assignments" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; apiKeyId: string } }
): Promise<NextResponse<RoleAssignment | { error: string }>> {
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

    // Get the request body - includes role property
    const roleAssignmentData = await request.json();
    console.log("API Key role assignment request body:", roleAssignmentData);

    // Make request to backend API with session token
    const response = await fetch(
      `http://localhost:8000/projects/${projectId}/api-keys/${apiKeyId}/role-assignments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleAssignmentData),
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
        { error: `Failed to create role assignment: ${errorDetail}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating role assignment:", error);
    return NextResponse.json(
      { error: "Failed to create role assignment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string; apiKeyId: string } }
): Promise<NextResponse<RoleAssignment[] | { error: string }>> {
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

    // Get the request body - array of objects with role property
    const roleAssignmentUpdates = await request.json();

    console.log(
      "API Key role assignments update body:",
      JSON.stringify(roleAssignmentUpdates)
    );

    // Make request to backend API with session token
    const response = await fetch(
      `http://localhost:8000/projects/${projectId}/api-keys/${apiKeyId}/role-assignments`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleAssignmentUpdates),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to update role assignments:", errorText);

      let errorDetail;
      try {
        const errorResponse = JSON.parse(errorText);
        errorDetail = errorResponse.detail || `Status: ${response.status}`;
      } catch {
        errorDetail = `Status: ${response.status}: ${errorText}`;
      }

      return NextResponse.json(
        { error: `Failed to update role assignments: ${errorDetail}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating role assignments:", error);
    return NextResponse.json(
      { error: "Failed to update role assignments" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: { projectId: string; apiKeyId: string; roleAssignmentId: string };
  }
): Promise<NextResponse<null | { error: string }>> {
  try {
    const { projectId, apiKeyId, roleAssignmentId } = await params;

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
      `http://localhost:8000/projects/${projectId}/api-keys/${apiKeyId}/role-assignments/${roleAssignmentId}`,
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
        { error: `Failed to delete role assignment: ${errorDetail}` },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting role assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete role assignment" },
      { status: 500 }
    );
  }
}
