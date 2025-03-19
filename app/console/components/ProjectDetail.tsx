// app/console/components/ProjectDetail.tsx
"use client";

import { useState } from "react";
import { useProject } from "@/app/hooks/useProject";
import TabNavigation from "./TabNavigation";
import ServicesTab from "./tabs/ServicesTab";
import MembersTab from "./tabs/MembersTab"; // Import the new MembersTab
import SettingsTab from "./tabs/SettingsTab";
import LoadingState from "./ui/LoadingState";
import ErrorState from "./ui/ErrorState";

interface ProjectDetailProps {
  projectId: string;
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState("services");

  // Get the selected project details
  const { project, isLoading, error } = useProject(projectId);

  // Define available tabs
  const tabs = [
    { id: "services", label: "Services" },
    { id: "members", label: "Members" }, // Add the new Members tab
    { id: "settings", label: "Settings" },
    // You can easily add more tabs here in the future
  ];

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (!project) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Project not found. It may have been deleted or you don&apos;t have
              access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {project.full_name || project.name || "Project Overview"}
        </h1>
        <p className="text-sm text-gray-500">Project ID: {project.id}</p>
      </div>

      {/* Tabs */}
      <TabNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
      />

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === "services" && <ServicesTab />}
        {activeTab === "members" && <MembersTab projectId={project.id} />}{" "}
        {/* Add the MembersTab component */}
        {activeTab === "settings" && <SettingsTab project={project} />}
        {/* You can add more tab conditions here in the future */}
      </div>
    </>
  );
}
