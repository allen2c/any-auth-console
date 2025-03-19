// app/console/components/tabs/SettingsTab.tsx
import { Project } from "@/app/types/api";

interface SettingsTabProps {
  project: Project;
}

export default function SettingsTab({ project }: SettingsTabProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Project Settings
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Manage project details and configuration
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Project ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{project?.id}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Project Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{project?.name}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {project?.full_name || "—"}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Created By</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {project?.created_by}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Created At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {project?.created_at
                ? new Date(project.created_at * 1000).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Updated At</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {project?.updated_at
                ? new Date(project.updated_at * 1000).toLocaleString()
                : "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {project?.disabled ? (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  Disabled
                </span>
              ) : (
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
