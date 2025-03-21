// app/console/components/tabs/APIKeysTab.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { APIKey, Role, Page } from "@/app/types/api";
import { useSession } from "next-auth/react";
import CreateAPIKeyModal from "./modals/CreateAPIKeyModal";
import EditAPIKeyModal from "./modals/EditAPIKeyModal";
import APIKeyRolesPanel from "./panels/APIKeyRolesPanel";
import { formatDistanceToNow } from "date-fns";

interface APIKeysTabProps {
  projectId: string;
}

// Interface to track API key roles
interface APIKeyWithRoles extends APIKey {
  roles?: Role[];
  rolesLoading?: boolean;
  rolesError?: string;
}

export default function APIKeysTab({ projectId }: APIKeysTabProps) {
  const [apiKeys, setApiKeys] = useState<APIKeyWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  // States for modals and panels
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRolesPanelOpen, setIsRolesPanelOpen] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<APIKey | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [apiKeyRoles, setApiKeyRoles] = useState<Role[]>([]);

  // Fetch roles for a specific API key and update state
  const fetchRolesForApiKey = useCallback(
    async (apiKeyId: string) => {
      if (!projectId || !session?.accessToken || !apiKeyId) return;

      try {
        const response = await fetch(
          `/api/projects/${projectId}/api-keys/${apiKeyId}/roles`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch API key roles: ${response.status}`);
        }

        const data: Page<Role> = await response.json();

        // Update the state with the roles for this API key
        setApiKeys((prevKeys) =>
          prevKeys.map((key) =>
            key.id === apiKeyId
              ? { ...key, roles: data.data || [], rolesLoading: false }
              : key
          )
        );

        // If this is the current API key being edited, also update apiKeyRoles
        if (currentApiKey && currentApiKey.id === apiKeyId) {
          setApiKeyRoles(data.data || []);
        }
      } catch (err) {
        console.error(`Error fetching roles for API key ${apiKeyId}:`, err);
        // Update state to indicate error
        setApiKeys((prevKeys) =>
          prevKeys.map((key) =>
            key.id === apiKeyId
              ? {
                  ...key,
                  rolesLoading: false,
                  rolesError:
                    err instanceof Error ? err.message : "Failed to load roles",
                }
              : key
          )
        );
      }
    },
    [projectId, session?.accessToken, currentApiKey]
  );

  // Fetch API keys
  const fetchApiKeys = useCallback(async () => {
    if (!projectId || !session?.accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/api-keys`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch API keys: ${response.status}`);
      }

      const data: Page<APIKey> = await response.json();
      // Initialize with roles array
      const keysWithRoles = data.data.map((key) => ({
        ...key,
        roles: [],
        rolesLoading: true,
      }));

      setApiKeys(keysWithRoles);

      // After setting initial state, fetch roles for each API key
      keysWithRoles.forEach((key) => {
        fetchRolesForApiKey(key.id);
      });
    } catch (err) {
      console.error("Error fetching API keys:", err);
      setError(err instanceof Error ? err.message : "Failed to load API keys");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, session?.accessToken, fetchRolesForApiKey]);

  // Fetch available roles
  const fetchAvailableRoles = useCallback(async () => {
    if (!projectId || !session?.accessToken) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/roles`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.status}`);
      }

      const data: Page<Role> = await response.json();
      setAvailableRoles(data.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  }, [projectId, session?.accessToken]);

  // Delete API key
  const deleteApiKey = async (apiKeyId: string) => {
    if (!projectId || !session?.accessToken) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/api-keys/${apiKeyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete API key: ${response.status}`);
      }

      // Refresh API keys list
      fetchApiKeys();
      setIsDeleteModalOpen(false);
      setCurrentApiKey(null);
    } catch (err) {
      console.error("Error deleting API key:", err);
      setError(err instanceof Error ? err.message : "Failed to delete API key");
    }
  };

  // Load API keys on component mount
  useEffect(() => {
    fetchApiKeys();
    fetchAvailableRoles();
  }, [fetchApiKeys, fetchAvailableRoles]);

  // Handle create API key
  const handleCreateKey = async (formData: {
    name: string;
    description: string;
    expiresAt: Date | null;
  }) => {
    if (!projectId || !session?.accessToken) return;

    try {
      setError(null);

      const payload = {
        name: formData.name,
        description: formData.description,
        expires_at: formData.expiresAt
          ? Math.floor(formData.expiresAt.getTime() / 1000)
          : null,
      };

      console.log("Creating API key with payload:", payload);

      const response = await fetch(`/api/projects/${projectId}/api-keys`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API response error:", errorText);
        throw new Error(
          `Failed to create API key: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("API key created successfully:", data);

      setNewApiKey(data.api_key); // Store the plain API key to show to the user
      fetchApiKeys(); // Refresh the list
    } catch (err) {
      console.error("Error creating API key:", err);
      setError(err instanceof Error ? err.message : "Failed to create API key");
    }
  };

  // Handle update API key
  const handleUpdateKey = async (
    apiKeyId: string,
    formData: {
      name: string;
      description: string;
      expiresAt: Date | null;
    }
  ) => {
    if (!projectId || !session?.accessToken) return;

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        expires_at: formData.expiresAt
          ? Math.floor(formData.expiresAt.getTime() / 1000)
          : null,
      };

      const response = await fetch(
        `/api/projects/${projectId}/api-keys/${apiKeyId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        let errorDetail;
        try {
          const errorResponse = await response.json();
          errorDetail = errorResponse.detail || `Status: ${response.status}`;
        } catch {
          errorDetail = `Status: ${response.status}`;
        }

        throw new Error(`Failed to update API key: ${errorDetail}`);
      }

      fetchApiKeys(); // Refresh the list
      setIsEditModalOpen(false);
      setCurrentApiKey(null);
    } catch (err) {
      console.error("Error updating API key:", err);
      setError(err instanceof Error ? err.message : "Failed to update API key");
    }
  };

  // Handle manage roles click
  const handleManageRoles = (apiKey: APIKey) => {
    setCurrentApiKey(apiKey);

    // Find the roles for this API key in our state
    const keyWithRoles = apiKeys.find((k) => k.id === apiKey.id);
    if (keyWithRoles && keyWithRoles.roles) {
      setApiKeyRoles(keyWithRoles.roles);
    } else {
      setApiKeyRoles([]);
      // Fetch roles if not already loaded
      fetchRolesForApiKey(apiKey.id);
    }

    setIsRolesPanelOpen(true);
  };

  // Handle edit click
  const handleEditClick = (apiKey: APIKey) => {
    setCurrentApiKey(apiKey);
    setIsEditModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (apiKey: APIKey) => {
    setCurrentApiKey(apiKey);
    setIsDeleteModalOpen(true);
  };

  // Format date for display
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Check if API key is expired
  const isExpired = (timestamp: number | null) => {
    if (!timestamp) return false;
    return timestamp * 1000 < Date.now();
  };

  // Format expiry for display
  const formatExpiry = (timestamp: number | null) => {
    if (!timestamp) return "Never expires";
    const date = new Date(timestamp * 1000);

    if (isExpired(timestamp)) {
      return `Expired ${formatDistanceToNow(date, { addSuffix: true })}`;
    }

    return `Expires ${formatDistanceToNow(date, { addSuffix: true })}`;
  };

  // Handler for role updates
  const handleRolesUpdated = (apiKeyId: string) => {
    fetchRolesForApiKey(apiKeyId);
  };

  // Delete confirmation modal
  const DeleteConfirmationModal = () => {
    if (!isDeleteModalOpen || !currentApiKey) return null;

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-medium text-gray-900">Delete API Key</h3>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to delete the API key &quot;
            {currentApiKey.name}&quot;? This action cannot be undone and any
            applications using this key will no longer be able to authenticate.
          </p>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setCurrentApiKey(null);
              }}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => deleteApiKey(currentApiKey.id)}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (apiKeys.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            API Keys
          </h3>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create API Key
          </button>
        </div>
        <div className="border-t border-gray-200">
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No API keys
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new API key.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create API Key
              </button>
            </div>
          </div>
        </div>

        {/* Create API Key Modal */}
        <CreateAPIKeyModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setNewApiKey(null);
          }}
          onCreate={handleCreateKey}
          newApiKey={newApiKey}
        />
      </div>
    );
  }

  // Main content with API keys list
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              API Keys
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Manage API keys for your project&apos;s services and integrations.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Create API Key
          </button>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Expires
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Roles
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((apiKey) => (
                <tr key={apiKey.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-md">
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
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {apiKey.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {apiKey.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {apiKey.description || "No description"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(apiKey.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatExpiry(apiKey.expires_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isExpired(apiKey.expires_at) ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Expired
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {apiKey.rolesLoading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin h-4 w-4 text-blue-500 mr-2"
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
                        <span className="text-xs text-gray-500">
                          Loading...
                        </span>
                      </div>
                    ) : apiKey.rolesError ? (
                      <span className="text-xs text-red-500">
                        Error loading roles
                      </span>
                    ) : apiKey.roles && apiKey.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {apiKey.roles.map((role) => (
                          <span
                            key={role.id}
                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">
                        No roles assigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => handleManageRoles(apiKey)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Manage Roles"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditClick(apiKey)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit API Key"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(apiKey)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete API Key"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create API Key Modal */}
      <CreateAPIKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewApiKey(null);
        }}
        onCreate={handleCreateKey}
        newApiKey={newApiKey}
      />

      {/* Edit API Key Modal */}
      {currentApiKey && (
        <EditAPIKeyModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setCurrentApiKey(null);
          }}
          onUpdate={(formData) => handleUpdateKey(currentApiKey.id, formData)}
          apiKey={currentApiKey}
        />
      )}

      {/* API Key Roles Panel */}
      {currentApiKey && (
        <APIKeyRolesPanel
          isOpen={isRolesPanelOpen}
          onClose={() => {
            setIsRolesPanelOpen(false);
            setCurrentApiKey(null);
            setApiKeyRoles([]);
          }}
          apiKey={currentApiKey}
          projectId={projectId}
          availableRoles={availableRoles}
          currentRoles={apiKeyRoles}
          onRolesUpdated={() => {
            handleRolesUpdated(currentApiKey.id);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </div>
  );
}
