"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";

interface Invite {
  id: string;
  email: string;
  created_at: number;
  expires_at: number;
  invited_by: string;
  temporary_token: string;
  resource_id: string;
  metadata?: Record<string, unknown>;
}

interface ActiveInvitesPanelProps {
  projectId: string;
  onResendInvite?: (invite: Invite) => Promise<void>;
  onRemoveInvite?: (inviteId: string) => Promise<void>;
}

export default function ActiveInvitesPanel({
  projectId,
  onResendInvite,
  onRemoveInvite,
}: ActiveInvitesPanelProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!projectId || !session?.accessToken) return;

    const fetchInvites = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/projects/${projectId}/invites`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch invites: ${response.status}`);
        }

        const data = await response.json();
        setInvites(data.data || []);
      } catch (err) {
        console.error("Error fetching invites:", err);
        setError(err instanceof Error ? err.message : "Failed to load invites");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvites();
  }, [projectId, session]);

  const handleResendInvite = async (invite: Invite) => {
    if (!onResendInvite) return;

    setActionInProgress(invite.id);
    try {
      await onResendInvite(invite);
    } catch (err) {
      console.error("Error resending invite:", err);
      setError(err instanceof Error ? err.message : "Failed to resend invite");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRemoveInvite = async (inviteId: string) => {
    if (!onRemoveInvite) return;

    setActionInProgress(inviteId);
    try {
      await onRemoveInvite(inviteId);
      // Remove the invite from the local state
      setInvites(invites.filter((invite) => invite.id !== inviteId));
    } catch (err) {
      console.error("Error removing invite:", err);
      setError(err instanceof Error ? err.message : "Failed to remove invite");
    } finally {
      setActionInProgress(null);
    }
  };

  // Direct deletion without going through the parent component
  const handleDeleteInvite = async (inviteId: string) => {
    if (!projectId || !session?.accessToken) return;

    setActionInProgress(inviteId);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/invites/${inviteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete invite: ${response.status}`);
      }

      // Remove the invite from the local state
      setInvites(invites.filter((invite) => invite.id !== inviteId));
    } catch (err) {
      console.error("Error deleting invite:", err);
      setError(err instanceof Error ? err.message : "Failed to delete invite");
    } finally {
      setActionInProgress(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-4 text-center text-gray-500">
        <svg
          className="animate-spin mx-auto h-8 w-8 text-blue-500"
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
        <p className="mt-2">Loading invites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
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

  if (invites.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No pending invites
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          All sent invitations have been accepted or expired.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium text-gray-900 mb-3">
        Pending Invites
      </h3>
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Sent
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Expires
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {invites.map((invite) => {
              const now = Date.now() / 1000;
              const isExpired = invite.expires_at < now;

              return (
                <tr key={invite.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {invite.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDistanceToNow(new Date(invite.created_at * 1000), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {isExpired ? (
                      <span className="text-red-600">Expired</span>
                    ) : (
                      formatDistanceToNow(new Date(invite.expires_at * 1000), {
                        addSuffix: true,
                      })
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex justify-end space-x-2">
                      {onResendInvite && (
                        <button
                          onClick={() => handleResendInvite(invite)}
                          disabled={actionInProgress === invite.id}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        >
                          {actionInProgress === invite.id
                            ? "Working..."
                            : "Resend"}
                        </button>
                      )}
                      {onRemoveInvite ? (
                        <button
                          onClick={() => handleRemoveInvite(invite.id)}
                          disabled={actionInProgress === invite.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {actionInProgress === invite.id
                            ? "Working..."
                            : "Remove"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteInvite(invite.id)}
                          disabled={actionInProgress === invite.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {actionInProgress === invite.id
                            ? "Working..."
                            : "Remove"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
