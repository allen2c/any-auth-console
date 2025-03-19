// app/console/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useProjects } from "../hooks/useProject";
import ConsoleNavigation from "./components/ConsoleNavigation";
import ProjectsList from "./components/ProjectsList";
import ProjectDetail from "./components/ProjectDetail";
import LoadingState from "./components/ui/LoadingState";
import ErrorState from "./components/ui/ErrorState";

export default function Console() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");

  // Get all projects data, used in both views
  const {
    projects,
    isLoading: areProjectsLoading,
    error: projectsError,
  } = useProjects();

  // Show loading state while data is being fetched
  if (areProjectsLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <ConsoleNavigation projectId={projectId} />
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LoadingState />
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (projectsError) {
    return (
      <div className="min-h-screen bg-gray-100">
        <ConsoleNavigation projectId={projectId} />
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ErrorState error={projectsError} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ConsoleNavigation projectId={projectId} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {projectId ? (
            // Show project detail view when a project is selected
            <ProjectDetail projectId={projectId} />
          ) : (
            // Show projects list when no project is selected
            <ProjectsList projects={projects} />
          )}
        </div>
      </div>
    </div>
  );
}
