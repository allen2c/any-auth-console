import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

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
