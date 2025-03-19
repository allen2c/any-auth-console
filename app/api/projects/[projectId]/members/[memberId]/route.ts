// app/api/projects/[projectId]/members/[memberId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function DELETE(
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

    // First fetch the project member to verify it exists and belongs to the project
    const verifyResponse = await fetch(
      `http://localhost:8000/projects/${projectId}/members/${memberId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!verifyResponse.ok) {
      // Most likely a 404 Not Found if the member doesn't exist or doesn't belong to the project
      const status = verifyResponse.status;
      let errorMessage = `Failed to verify member: ${status}`;

      try {
        const errorData = await verifyResponse.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {
        console.error("Error parsing error response:", e);
      }

      return NextResponse.json({ error: errorMessage }, { status });
    }

    // Proceed with the delete operation
    const deleteResponse = await fetch(
      `http://localhost:8000/projects/${projectId}/members/${memberId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!deleteResponse.ok) {
      const status = deleteResponse.status;
      let errorMessage = `Failed to delete member: ${status}`;

      try {
        const errorData = await deleteResponse.text();
        errorMessage = errorData || errorMessage;
      } catch (e) {
        console.error("Error parsing error response:", e);
      }

      return NextResponse.json({ error: errorMessage }, { status });
    }

    // Return a successful response with 204 No Content
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting project member:", error);
    return NextResponse.json(
      { error: "Failed to delete project member" },
      { status: 500 }
    );
  }
}
