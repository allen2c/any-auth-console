"use client";

import { useEffect, useState } from "react";
import { Page, ProjectMember, Role, User } from "@/app/types/api";

interface IAMTabProps {
  projectId: string;
}

interface MemberWithUserInfo extends ProjectMember {
  userDetails?: User;
  roles?: Role[];
}

interface EditRolesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberWithUserInfo | null;
  availableRoles: Role[];
  onUpdate: (memberId: string, roleIds: string[]) => void;
}

function EditRolesPanel({
  isOpen,
  onClose,
  member,
  availableRoles,
  onUpdate,
}: EditRolesPanelProps) {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Edit Roles</h3>
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
            <p className="text-sm text-gray-500">User</p>
            <p className="text-sm font-medium text-gray-900">
              {member.userDetails?.full_name ||
                member.userDetails?.username ||
                "Unknown User"}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-900">Roles</p>
            <div className="space-y-2">
              {availableRoles.map((role) => (
                <label key={role.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={member.roles?.some((r) => r.id === role.id)}
                  />
                  <span className="text-sm text-gray-700">{role.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onUpdate(member.id, [])}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IAMTab({ projectId }: IAMTabProps) {
  const [members, setMembers] = useState<MemberWithUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [editingMember, setEditingMember] = useState<MemberWithUserInfo | null>(
    null
  );
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/roles`);
        if (!response.ok) {
          throw new Error(`Failed to fetch roles: ${response.status}`);
        }
        const data: Page<Role> = await response.json();
        setAvailableRoles(data.data);
      } catch (err) {
        console.error("Error fetching roles:", err);
      }
    };

    if (projectId) {
      fetchRoles();
    }
  }, [projectId]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        // Fetch all members of the project
        const membersResponse = await fetch(
          `/api/projects/${projectId}/members`
        );
        if (!membersResponse.ok) {
          throw new Error(`Failed to fetch members: ${membersResponse.status}`);
        }
        const membersData: Page<ProjectMember> = await membersResponse.json();

        // Get user details and roles for each member
        const membersWithDetails: MemberWithUserInfo[] = await Promise.all(
          membersData.data.map(async (member) => {
            // Get user details
            const userResponse = await fetch(
              `/api/projects/${projectId}/members/${member.id}/user`
            );
            let userDetails: User | undefined;
            if (userResponse.ok) {
              userDetails = await userResponse.json();
            }

            // Get roles
            const rolesResponse = await fetch(
              `/api/projects/${projectId}/members/${member.id}/roles`
            );
            let roles: Role[] | undefined;
            if (rolesResponse.ok) {
              const rolesData: Page<Role> = await rolesResponse.json();
              roles = rolesData.data;
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
        console.error("Error fetching members:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchMembers();
    }
  }, [projectId]);

  const handleEditClick = (member: MemberWithUserInfo) => {
    setEditingMember(member);
    setIsEditPanelOpen(true);
  };

  const handleCloseEditPanel = () => {
    setIsEditPanelOpen(false);
    setEditingMember(null);
  };

  const handleUpdateRoles = (memberId: string, roleIds: string[]) => {
    // TODO: Implement role update logic
    console.log("Updating roles for member:", memberId, "with roles:", roleIds);
    handleCloseEditPanel();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          IAM Management
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Manage Identity and Access Management settings for your project.
        </p>

        {loading ? (
          <div className="text-center py-4">
            <p>Loading members...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">
            <p>Error: {error}</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-4">
            <p>No members found for this project.</p>
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
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Full Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Roles
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    {/* Email column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.userDetails?.email || "No email available"}
                    </td>

                    {/* Full Name column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.userDetails?.full_name ||
                        member.userDetails?.username ||
                        "Unknown User"}
                    </td>

                    {/* Roles column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {member.roles && member.roles.length > 0 ? (
                          member.roles.map((role) => (
                            <span
                              key={role.id}
                              className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                            >
                              {role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">
                            No roles assigned
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Edit column */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit roles"
                        onClick={() => handleEditClick(member)}
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditRolesPanel
        isOpen={isEditPanelOpen}
        onClose={handleCloseEditPanel}
        member={editingMember}
        availableRoles={availableRoles}
        onUpdate={handleUpdateRoles}
      />
    </div>
  );
}
