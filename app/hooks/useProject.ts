// app/hooks/useProject.ts
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Project, ProjectsResponse } from "../types/api";

export function useProject(projectId: string | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status } = useSession();

  useEffect(() => {
    async function fetchProject() {
      if (!projectId || status !== "authenticated") {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/projects/${projectId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch project: ${response.status}`);
        }

        const projectData = (await response.json()) as Project;
        setProject(projectData);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err instanceof Error ? err.message : "Failed to load project");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProject();
  }, [projectId, status]);

  return { project, isLoading, error };
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status } = useSession();

  useEffect(() => {
    async function fetchProjects() {
      if (status !== "authenticated") {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/me/projects");

        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`);
        }

        const data = (await response.json()) as ProjectsResponse;
        setProjects(data.data || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load projects"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, [status]);

  return { projects, isLoading, error };
}
