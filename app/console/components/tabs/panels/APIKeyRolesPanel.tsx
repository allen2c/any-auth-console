"use client";

import { useState, useEffect } from "react";
import { APIKey, Role, RoleAssignment } from "@/app/types/api";
import { useSession } from "next-auth/react";

interface APIKeyRolesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: APIKey;
  projectId: string;
  availableRoles: Role[];
  currentRoles: Role[];
  onRolesUpdated: () => void;
}

export default function APIKeyRolesPanel({
  isOpen,
  onClose,
  apiKey,
  projectId,
  availableRoles,
  currentRoles,
  onRolesUpdated,
}: APIKeyRolesPanelProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const { data: session } = useSession();

  // Initialize selected roles when currentRoles changes
  useEffect(() => {
    if (currentRoles) {
      setSelectedRoleIds(currentRoles.map((role) => role.id));
    }
  }, [currentRoles]);

  // Fetch existing role assignments
  useEffect(() => {
    if (!isOpen || !apiKey || !session?.accessToken) return;

    const fetchRoleAssignments = async () => {
      try {
        const response = await fetch(
          `/api/projects/${projectId}/api-keys/${apiKey.id}/role-assignments`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch role assignments: ${response.status}`
          );
        }

        const data = await response.json();
        setRoleAssignments(data.data || []);
      } catch (error) {
        console.error("Error fetching role assignments:", error);
      }
    };

    fetchRoleAssignments();
  }, [isOpen, apiKey, projectId, session]);

  if (!isOpen) return null;

  const filteredRoles = availableRoles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (role.description &&
        role.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleRemoveRole = (roleId: string) => {
    setSelectedRoleIds((prev) => prev.filter((id) => id !== roleId));
  };

  const handleUpdateRoles = async () => {
    if (!apiKey || !session?.accessToken) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      // Find role objects for the selected IDs
      const selectedRoles = availableRoles.filter((roleObj) =>
        selectedRoleIds.includes(roleObj.id)
      );

      // Prepare the correct payload format - array of objects with 'role' property
      const roleAssignmentUpdates = selectedRoles.map((role) => ({
        role: role.id, // This should be the role ID, not the full role object
      }));

      console.log(
        "Sending role assignments with payload:",
        JSON.stringify(roleAssignmentUpdates)
      );

      // Call the PUT endpoint to update roles
      const response = await fetch(
        `/api/projects/${projectId}/api-keys/${apiKey.id}/role-assignments`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(roleAssignmentUpdates),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", errorText);
        throw new Error(
          `Failed to update roles: ${response.status} - ${errorText}`
        );
      }

      // Notify parent component to refresh roles
      onRolesUpdated();
    } catch (error) {
      console.error("Error updating roles:", error);
      setUpdateError(
        error instanceof Error ? error.message : "Failed to update roles"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50">
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Manage API Key Roles
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-500">API Key</p>
            <p className="text-sm font-medium text-gray-900">{apiKey.name}</p>
            <p className="text-sm text-gray-500 mt-1">
              {apiKey.description || "No description"}
            </p>
          </div>

          {updateError && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{updateError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                Assigned Roles
              </p>
              <span className="text-sm text-gray-500">
                {selectedRoleIds.length} of {availableRoles.length}
              </span>
            </div>

            {/* Selected roles display */}
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedRoleIds.length > 0 ? (
                selectedRoleIds.map((roleId) => {
                  const role = availableRoles.find((r) => r.id === roleId);
                  if (!role) return null;
                  return (
                    <div
                      key={roleId}
                      className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
                    >
                      {role.name}
                      <button
                        onClick={() => handleRemoveRole(roleId)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500">No roles assigned</div>
              )}
            </div>

            {/* Search box */}
            <div className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    onClick={() => setSearchQuery("")}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* All roles selection list */}
            <div className="mt-2 border border-gray-200 rounded-md max-h-96 overflow-y-auto">
              {filteredRoles.length === 0 ? (
                <div className="p-3 text-center text-sm text-gray-500">
                  No roles match your search
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {filteredRoles.map((role) => (
                    <li
                      key={role.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRoleToggle(role.id)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedRoleIds.includes(role.id)}
                          onChange={() => {}} // Handled by parent click
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="ml-3 flex-1">
                          <span className="text-sm font-medium text-gray-700">
                            {role.name}
                          </span>
                          {role.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {role.description}
                            </p>
                          )}
                        </div>
                        {role.permissions && role.permissions.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {role.permissions.length} permissions
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateRoles}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Roles"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
