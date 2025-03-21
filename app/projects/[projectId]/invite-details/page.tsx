"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface ProjectDetails {
  id: string;
  name: string;
  full_name?: string;
  description?: string;
}

export default function InviteDetailsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const { projectId } = params;
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    // If no token, redirect to the project home
    if (!token) {
      router.push(`/console?project_id=${projectId}`);
      return;
    }

    // If not logged in, redirect to login with redirect back to this page
    if (status === "unauthenticated") {
      const returnUrl = encodeURIComponent(
        `/projects/${projectId}/invite-details?token=${token}`
      );
      router.push(`/login?callbackUrl=${returnUrl}`);
      return;
    }

    // If still loading session, wait
    if (status === "loading") {
      return;
    }

    // Fetch project details
    const fetchProjectDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, you would fetch project details and inviter information
        // from the API using the token. Here we'll simulate that with dummy data.

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulated project data
        setProject({
          id: projectId,
          name: "Project " + projectId.substring(0, 6),
          full_name: "Sample Project Name",
          description: "This is a sample project description.",
        });

        // Simulated inviter data
        setInviterName("John Doe");
      } catch (err) {
        console.error("Error fetching invite details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch invite details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetails();
  }, [token, projectId, router, status, session]);

  const handleAcceptInvite = async () => {
    setIsAccepting(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/accept-invite?token=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to accept invite: ${response.status}`
        );
      }

      // Redirect to project console
      router.push(`/console?project_id=${projectId}`);
    } catch (err) {
      console.error("Error accepting invite:", err);
      setError(err instanceof Error ? err.message : "Failed to accept invite");
      setIsAccepting(false);
    }
  };

  const handleDeclineInvite = () => {
    // In a real app, you would call an API to decline the invite
    // Here we'll just redirect to the console
    router.push("/console");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Loading Project Invitation
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Invitation Error
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
            <div className="mt-6 flex justify-center">
              <Link
                href="/console"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Console
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Project Invitation
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You&apos;ve been invited to join a project
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Project Details
            </h3>
            <div className="mt-2 border rounded-md p-4 bg-gray-50">
              <dl className="divide-y divide-gray-200">
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="text-sm text-gray-900">
                    {project?.full_name || project?.name}
                  </dd>
                </div>
                {project?.description && (
                  <div className="py-3">
                    <dt className="text-sm font-medium text-gray-500">
                      Description
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.description}
                    </dd>
                  </div>
                )}
                {inviterName && (
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Invited by
                    </dt>
                    <dd className="text-sm text-gray-900">{inviterName}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={handleAcceptInvite}
              disabled={isAccepting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isAccepting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </button>
            <button
              onClick={handleDeclineInvite}
              disabled={isAccepting}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
