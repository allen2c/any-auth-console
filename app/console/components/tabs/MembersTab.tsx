// app/console/components/tabs/MembersTab.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { ProjectMember, User, Role } from "@/app/types/api";
import InviteMemberModal from "./modals/InviteMemberModal";
import ActiveInvitesPanel from "./panels/ActiveInvitesPanel";

interface MembersTabProps {
  projectId: string;
}

interface MemberWithUserInfo extends ProjectMember {
  userDetails?: User;
  roles?: Role[]; // Add roles to track member roles
}

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

export default function MembersTab({ projectId }: MembersTabProps) {
  const [members, setMembers] = useState<MemberWithUserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  // Add states for invite modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [projectDetails, setProjectDetails] = useState<{
    name: string;
    full_name?: string;
  } | null>(null);

  // Add states for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] =
    useState<MemberWithUserInfo | null>(null);

  // Fetch all members data
  const fetchMembers = useCallback(async () => {
    if (!projectId || !session?.accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch project members
      const response = await fetch(`/api/projects/${projectId}/members`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project members: ${response.status}`);
      }

      const data = await response.json();
      const membersList: ProjectMember[] = data.data || [];

      // For each member, fetch user details and roles
      const membersWithDetails = await Promise.all(
        membersList.map(async (member) => {
          let userDetails;
          let roles = [];

          // Fetch user details
          try {
            const userResponse = await fetch(
              `/api/projects/${projectId}/members/${member.id}/user`,
              {
                headers: {
                  Authorization: `Bearer ${session.accessToken}`,
                },
              }
            );

            if (userResponse.ok) {
              userDetails = await userResponse.json();
            }
          } catch (error) {
            console.error(
              `Error fetching user details for ${member.user_id}:`,
              error
            );
          }

          // Fetch member roles
          try {
            const rolesResponse = await fetch(
              `/api/projects/${projectId}/members/${member.id}/roles`,
              {
                headers: {
                  Authorization: `Bearer ${session.accessToken}`,
                },
              }
            );

            if (rolesResponse.ok) {
              const rolesData = await rolesResponse.json();
              roles = rolesData.data || [];
            }
          } catch (error) {
            console.error(
              `Error fetching roles for member ${member.id}:`,
              error
            );
          }

          return {
            ...member,
            userDetails,
            roles,
          };
        })
      );

      setMembers(membersWithDetails);
    } catch (err) {
      console.error("Error fetching project members:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load project members"
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId, session]);

  // Fetch available roles for the project
  const fetchProjectRoles = useCallback(async () => {
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

      const data = await response.json();
      setAvailableRoles(data.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  }, [projectId, session]);

  // Fetch project details
  const fetchProjectDetails = useCallback(async () => {
    if (!projectId || !session?.accessToken) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch project details: ${response.status}`);
      }

      const data = await response.json();
      setProjectDetails({
        name: data.name,
        full_name: data.full_name,
      });
    } catch (err) {
      console.error("Error fetching project details:", err);
    }
  }, [projectId, session]);

  useEffect(() => {
    fetchMembers();
    fetchProjectRoles();
    fetchProjectDetails();
  }, [
    projectId,
    session,
    fetchMembers,
    fetchProjectRoles,
    fetchProjectDetails,
  ]);

  // Handle opening delete confirmation modal
  const handleDeleteClick = (member: MemberWithUserInfo) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  // Handle confirming deletion
  const confirmDelete = async () => {
    if (!memberToDelete || !session?.accessToken) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/members/${memberToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete member: ${response.status}`);
      }

      // Remove the deleted member from the state
      setMembers(members.filter((member) => member.id !== memberToDelete.id));

      // Close the modal
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    } catch (err) {
      console.error("Error deleting member:", err);
      setError(err instanceof Error ? err.message : "Failed to delete member");
    }
  };

  // Handle inviting a new member
  const handleInviteMember = async (email: string, roleId?: string) => {
    if (!projectId || !session?.accessToken) {
      throw new Error("You must be logged in to invite members");
    }

    try {
      const payload: { email: string; role?: string } = { email };
      if (roleId) {
        payload.role = roleId;
      }

      const response = await fetch(`/api/projects/${projectId}/invites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to send invite: ${response.status}`
        );
      }

      // Invitation was successful, we don't need to close the modal
      // as the component will show a success message
    } catch (error) {
      console.error("Error inviting member:", error);
      throw error;
    }
  };

  // Handle resending an invitation
  const handleResendInvite = async (invite: Invite) => {
    // Just recreate the invite with the same email
    await handleInviteMember(invite.email);
  };

  // Handle removing an invitation
  const handleRemoveInvite = async (inviteId: string) => {
    if (!projectId || !session?.accessToken) {
      throw new Error("You must be logged in to manage invites");
    }

    // In a real application, we would implement an API endpoint to delete the invite
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
    } catch (error) {
      console.error(`Error deleting invite ${inviteId}:`, error);
      throw error;
    }
  };

  // Delete confirmation modal component
  const DeleteConfirmationModal = () => {
    if (!isDeleteModalOpen || !memberToDelete) return null;

    const userName =
      memberToDelete.userDetails?.full_name ||
      memberToDelete.userDetails?.username ||
      "this user";

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-medium text-gray-900">
            Confirm Deletion
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to remove {userName} from this project? This
            action cannot be undone.
          </p>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setMemberToDelete(null);
              }}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

  return (
    <div className="space-y-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Project Members
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Users with access to this project
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Invite Member
          </button>
        </div>

        {/* Members list */}
        {members.length === 0 ? (
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No members found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This project doesn&apos;t have any members yet.
            </p>
          </div>
        ) : (
          <div className="border-t border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
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
                    Joined
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
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    {/* User column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {member.userDetails?.picture ? (
                            <Image
                              className="h-10 w-10 rounded-full"
                              src={member.userDetails.picture}
                              alt={
                                member.userDetails.full_name ||
                                member.userDetails.username ||
                                "User"
                              }
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                              {member.userDetails?.full_name
                                ? member.userDetails.full_name
                                    .charAt(0)
                                    .toUpperCase()
                                : member.userDetails?.username
                                ? member.userDetails.username
                                    .charAt(0)
                                    .toUpperCase()
                                : "U"}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.userDetails?.full_name ||
                              member.userDetails?.username ||
                              "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.userDetails?.email || "No email available"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.userDetails?.disabled ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Disabled
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Joined date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(member.joined_at * 1000).toLocaleDateString()}
                    </td>

                    {/* Role column with priority display */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.roles && member.roles.length > 0 ? (
                        (() => {
                          // Define role constants
                          const PROJECT_OWNER_ROLE_NAME = "ProjectOwner";
                          const PROJECT_EDITOR_ROLE_NAME = "ProjectEditor";
                          const PROJECT_VIEWER_ROLE_NAME = "ProjectViewer";

                          // Check for roles by priority
                          const isOwner = member.roles.some(
                            (role) => role.name === PROJECT_OWNER_ROLE_NAME
                          );
                          const isEditor = member.roles.some(
                            (role) => role.name === PROJECT_EDITOR_ROLE_NAME
                          );
                          const isViewer = member.roles.some(
                            (role) => role.name === PROJECT_VIEWER_ROLE_NAME
                          );

                          // Determine role and style
                          let roleName = "No role";
                          let bgColor = "bg-gray-100";
                          let textColor = "text-gray-800";

                          if (isOwner) {
                            roleName = "Owner";
                            bgColor = "bg-purple-100";
                            textColor = "text-purple-800";
                          } else if (isEditor) {
                            roleName = "Editor";
                            bgColor = "bg-blue-100";
                            textColor = "text-blue-800";
                          } else if (isViewer) {
                            roleName = "Viewer";
                            bgColor = "bg-green-100";
                            textColor = "text-green-800";
                          }

                          return (
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}
                            >
                              {roleName}
                            </span>
                          );
                        })()
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          No role
                        </span>
                      )}
                    </td>

                    {/* Delete button */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {(() => {
                        // Check if this member is the current logged-in user
                        const isCurrentUser =
                          session?.user &&
                          (session.user.id === member.user_id ||
                            session.user.email === member.userDetails?.email);

                        return (
                          !isCurrentUser && (
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(member)}
                              className="p-1.5 rounded-full text-red-600 hover:text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                              title="Delete member"
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
                          )
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active Invites Panel */}
      <ActiveInvitesPanel
        projectId={projectId}
        onResendInvite={handleResendInvite}
        onRemoveInvite={handleRemoveInvite}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteMember}
        availableRoles={availableRoles}
        projectId={projectId}
        projectName={
          projectDetails?.full_name || projectDetails?.name || "Project"
        }
      />

      {/* Render the delete confirmation modal */}
      <DeleteConfirmationModal />
    </div>
  );
}
