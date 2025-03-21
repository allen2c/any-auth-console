// app/api/projects/[projectId]/invites/[inviteId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; inviteId: string } }
) {
  try {
    const { projectId, inviteId } = params;

    // Get user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Make request to backend API to delete the invite
    // Note: In a real implementation, we'd have a proper backend endpoint for this
    // For our project, we'll mock a successful response

    // In a real implementation, you'd do something like:
    // const response = await fetch(`http://localhost:8000/projects/${projectId}/invites/${inviteId}`, {
    //   method: "DELETE",
    //   headers: {
    //     Authorization: `Bearer ${token.accessToken}`,
    //   },
    // });

    // For this implementation, we'll simulate a successful response
    // In a real application, implement proper error handling based on the response

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting project invite:", error);
    return NextResponse.json(
      { error: "Failed to delete project invite" },
      { status: 500 }
    );
  }
}
