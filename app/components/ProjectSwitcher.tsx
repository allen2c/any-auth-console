"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Project } from "@/app/types/api";
import { useProjects } from "@/app/hooks/useProject";

interface ProjectSwitcherProps {
  currentProjectId?: string;
}

export default function ProjectSwitcher({
  currentProjectId,
}: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Use the hook to get projects from the API
  const { projects, isLoading, error } = useProjects();

  useEffect(() => {
    // Click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Set current project when projects load
    if (!isLoading && projects.length > 0) {
      // Set current project if ID is provided
      if (currentProjectId) {
        const current = projects.find((p) => p.id === currentProjectId);
        if (current) {
          setCurrentProject(current);
        } else if (projects.length > 0) {
          // If current project not found but we have projects, use the first one
          setCurrentProject(projects[0]);
        }
      } else if (projects.length > 0) {
        // If no current project ID, use the first one
        setCurrentProject(projects[0]);
        // Navigate to the first project
        router.push(`/console?project_id=${projects[0].id}`);
      }
    }
  }, [projects, isLoading, currentProjectId, router]);

  function handleSwitchProject(project: Project) {
    router.push(`/console?project_id=${project.id}`);
    setCurrentProject(project);
    setIsOpen(false);
  }

  if (isLoading) {
    return (
      <div className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white">
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Loading projects...
      </div>
    );
  }

  if (error) {
    return (
      <div className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50">
        <svg
          className="h-5 w-5 mr-2 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {error}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Link
        href="/console/new-project"
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        Create Project
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <span className="truncate max-w-xs">
          {currentProject?.name || "Select a project"}
        </span>
        <svg
          className={`ml-2 h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="p-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-1">
              Projects
            </p>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSwitchProject(project)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                  project.id === currentProject?.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-md mr-3">
                  {project.name?.charAt(0)?.toUpperCase() || "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{project.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    ID: {project.id}
                  </p>
                </div>
                {project.id === currentProject?.id && (
                  <svg
                    className="h-5 w-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-gray-100 p-2">
            <Link
              href="/console/new-project"
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg
                className="h-4 w-4 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Project
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
