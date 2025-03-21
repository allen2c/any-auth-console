"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const projectId = searchParams.get("project_id");
  const router = useRouter();
  const { status } = useSession();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This page is a universal entry point for email verification
    // It handles email verification links including project invites
    // We need to check if the user is logged in

    // If no token, redirect to home
    if (!token) {
      router.push("/");
      return;
    }

    // If not logged in, redirect to login with redirect back to appropriate page
    if (status === "unauthenticated") {
      let returnUrl = "/";

      // If this is a project invite, set the correct return URL
      if (projectId) {
        returnUrl = `/projects/${projectId}/accept-invite?token=${token}`;
      }

      const callbackUrl = encodeURIComponent(returnUrl);
      signIn(undefined, { callbackUrl });
      return;
    }

    // If logged in, redirect to the appropriate page
    if (status === "authenticated") {
      if (projectId) {
        // This is a project invite, redirect to the accept-invite page
        router.push(`/projects/${projectId}/accept-invite?token=${token}`);
      } else {
        // This is some other type of verification - could extend this for other verification flows
        router.push("/console");
      }
    }
  }, [token, projectId, router, status]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Verifying your email...
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
              Please wait while we verify your email...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
