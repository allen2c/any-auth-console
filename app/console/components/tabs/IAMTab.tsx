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

export default function IAMTab({ projectId }: IAMTabProps) {
  const [members, setMembers] = useState<MemberWithUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    </div>
  );
}
