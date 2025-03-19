"use client";

interface IAMTabProps {
  projectId: string;
}

export default function IAMTab({ projectId }: IAMTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          IAM Management
        </h2>
        <p className="text-sm text-gray-500">
          Manage Identity and Access Management settings for your project.
        </p>
      </div>
    </div>
  );
}
