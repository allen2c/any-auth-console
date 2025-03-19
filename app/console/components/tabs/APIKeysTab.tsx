"use client";

interface APIKeysTabProps {
  projectId: string;
}

export default function APIKeysTab({ projectId }: APIKeysTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">API Keys</h2>
        <p className="text-sm text-gray-500">
          Manage API keys for your project&apos;s services and integrations.
        </p>
      </div>
    </div>
  );
}
