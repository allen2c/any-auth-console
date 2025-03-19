// app/services/projects.ts

export interface Project {
  id: string;
  organization_id: string | null;
  name: string;
  full_name: string | null;
  disabled: boolean;
  metadata: Record<string, unknown>;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface ProjectsResponse {
  items: Project[];
  total: number;
  page: number;
  size: number;
}

/**
 * Fetch all projects for the current user
 */
export async function fetchUserProjects(
  accessToken: string
): Promise<Project[]> {
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch("http://localhost:8000/me/projects", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = (await response.json()) as ProjectsResponse;
    return data.items;
  } catch (error) {
    console.error("Error fetching user projects:", error);
    throw error;
  }
}

/**
 * Fetch a specific project by ID
 */
export async function fetchProjectById(
  projectId: string,
  accessToken: string
): Promise<Project> {
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  try {
    const response = await fetch(
      `http://localhost:8000/projects/${projectId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    return (await response.json()) as Project;
  } catch (error) {
    console.error(`Error fetching project ${projectId}:`, error);
    throw error;
  }
}
