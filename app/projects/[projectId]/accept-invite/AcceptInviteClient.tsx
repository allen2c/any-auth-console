"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AcceptInviteClient({
  projectId,
}: {
  projectId: string;
}) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { data: session, status } = useSession();

  // Add a ref to track if we've already attempted to accept the invite
  const acceptAttemptedRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If no token, redirect to the project page
    if (!token) {
      router.push(`/console?project_id=${projectId}`);
      return;
    }

    // If not logged in, redirect to login with redirect back to this page
    if (status === "unauthenticated") {
      const returnUrl = encodeURIComponent(
        `/projects/${projectId}/accept-invite?token=${token}`
      );
      router.push(`/login?callbackUrl=${returnUrl}`);
      return;
    }

    // If still loading session, wait
    if (status === "loading") {
      return;
    }

    // Now we're authenticated and have a token, accept the invite
    const acceptInvite = async () => {
      // Only proceed if we haven't already attempted to accept the invite
      if (acceptAttemptedRef.current) {
        return;
      }

      // Mark that we've attempted to accept the invite
      acceptAttemptedRef.current = true;

      setIsLoading(true);
      setError(null);
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

        setSuccess(true);
        // Redirect to project home after a short delay
        setTimeout(() => {
          router.push(`/console?project_id=${projectId}`);
        }, 2000);
      } catch (err) {
        console.error("Error accepting invite:", err);
        setError(
          err instanceof Error ? err.message : "Failed to accept invite"
        );
      } finally {
        setIsLoading(false);
      }
    };

    acceptInvite();
  }, [token, projectId, router, status, session]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Project Invitation
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          You&apos;ve been invited to join a project
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isLoading ? (
            <div className="text-center">
              <svg
                className="animate-spin mx-auto h-12 w-12 text-blue-500"
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
              <p className="mt-4 text-sm text-gray-600">
                Processing your invitation...
              </p>
            </div>
          ) : error ? (
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-red-800">Error</h3>
              <p className="mt-2 text-sm text-gray-600">{error}</p>
              <div className="mt-6">
                <Link
                  href="/console"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Console
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-green-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-green-800">
                Success!
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                You&apos;ve successfully joined the project. Redirecting to
                project console...
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
