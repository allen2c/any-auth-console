// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createJwtToken } from "@/app/utils/jwt";
import { getToken } from "next-auth/jwt";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const data = await request.json();

    // Validate project name format
    const { name, full_name } = data;

    if (!name || !/^[a-zA-Z0-9_-]{4,64}$/.test(name)) {
      return NextResponse.json(
        {
          detail:
            "Project name must be 4-64 characters and contain only letters, numbers, underscores, and hyphens",
        },
        { status: 400 }
      );
    }

    // Get user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user information from /api/me to get the correct user ID
    let userId = null;
    try {
      const userResponse = await fetch("http://localhost:8000/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        userId = userData.id;
        console.log(`Retrieved user ID from session: ${userId}`);
      } else {
        console.error("Failed to get user information from /api/me");
        return NextResponse.json(
          { detail: "Failed to retrieve user information" },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error getting user information:", error);
      return NextResponse.json(
        { detail: "Failed to retrieve user information" },
        { status: 500 }
      );
    }

    // Generate application JWT token for backend operations
    const appToken = createJwtToken(process.env.APPLICATION_USER_ID || "");

    // 1. Create project
    let project;
    try {
      const projectResponse = await fetch("http://localhost:8000/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${appToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          full_name: full_name || undefined,
          metadata: {},
          created_by: userId,
        }),
      });

      // Handle project creation errors
      if (!projectResponse.ok) {
        const projectError = await projectResponse.json();
        return NextResponse.json(
          { detail: projectError.detail || "Failed to create project" },
          { status: projectResponse.status }
        );
      }

      // Get created project data
      project = await projectResponse.json();
    } catch (error) {
      console.error("Error creating project:", error);
      return NextResponse.json(
        { detail: "Failed to create project" },
        { status: 500 }
      );
    }

    const projectId = project.id;
    console.log(`Project created successfully: ${projectId}`);

    // 2. Add user as project member
    try {
      const memberResponse = await fetch(
        `http://localhost:8000/projects/${projectId}/members`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${appToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            metadata: {},
          }),
        }
      );

      if (!memberResponse.ok) {
        console.error(
          "Failed to add user as project member:",
          await memberResponse.text()
        );
      } else {
        console.log(
          `Successfully added user ${userId} as member of project ${projectId}`
        );
      }
    } catch (error) {
      console.error("Error adding user as project member:", error);
    }

    // 3. Get the ProjectOwner role ID
    let roleId = null;
    try {
      const roleResponse = await fetch(
        `http://localhost:8000/roles/ProjectOwner`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${appToken}`,
          },
        }
      );

      if (roleResponse.ok) {
        const role = await roleResponse.json();
        roleId = role.id;
        console.log(`Found ProjectOwner role with ID: ${roleId}`);
      } else {
        console.error(
          "ProjectOwner role not found:",
          await roleResponse.text()
        );
      }
    } catch (error) {
      console.error("Error getting ProjectOwner role:", error);
    }

    // 4. If we found a role ID, assign user as project owner
    if (roleId) {
      try {
        const roleAssignmentResponse = await fetch(
          `http://localhost:8000/role-assignments`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${appToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userId,
              role_id: roleId,
              resource_id: projectId,
            }),
          }
        );

        if (!roleAssignmentResponse.ok) {
          console.error(
            "Failed to assign project owner role:",
            await roleAssignmentResponse.text()
          );
        } else {
          console.log(
            `Successfully assigned ProjectOwner role to user ${userId} for project ${projectId}`
          );
        }
      } catch (error) {
        console.error("Error assigning project owner role:", error);
      }
    }

    // Return success with project data
    return NextResponse.json(project);
  } catch (error) {
    console.error("Error in project creation process:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
