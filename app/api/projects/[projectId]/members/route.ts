// app/api/projects/[projectId]/members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Page, ProjectMember } from "@/app/types/api";
import { z } from "zod";

// Define Zod schema for runtime validation
const projectMemberSchema = z.object({
  id: z.string(),
  project_id: z.string(),
  user_id: z.string(),
  joined_at: z.number(),
  metadata: z.record(z.unknown()).default({}),
});

const pageProjectMembersSchema = z.object({
  object: z.literal("list"),
  data: z.array(projectMemberSchema),
  first_id: z.string().nullable(),
  last_id: z.string().nullable(),
  has_more: z.boolean(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
): Promise<NextResponse<Page<ProjectMember> | { error: string }>> {
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

    // Make request to backend API with session token
    const response = await fetch(
      `http://localhost:8000/projects/${projectId}/members`,
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
        { error: `Failed to fetch project members: ${response.status}` },
        { status: response.status }
      );
    }

    // Parse and validate the response
    const rawData = await response.json();

    try {
      // Validate the response against our schema
      const validatedData = pageProjectMembersSchema.parse(rawData);

      // Return the validated data with appropriate typing
      return NextResponse.json(validatedData as Page<ProjectMember>);
    } catch (validationError) {
      console.error("Response validation error:", validationError);
      return NextResponse.json(
        { error: "Invalid response data from backend" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Error fetching project members:", error);
    return NextResponse.json(
      { error: "Failed to fetch project members" },
      { status: 500 }
    );
  }
}
