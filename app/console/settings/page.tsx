"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  email: string;
  email_verified: boolean;
  phone: string | null;
  phone_verified: boolean;
  disabled: boolean;
  profile: string;
  picture: string | null;
  website: string;
  gender: string;
  birthdate: string;
  zoneinfo: string;
  locale: string;
  address: string;
  metadata: Record<string, unknown>;
  created_at: number;
  updated_at: number;
}

export default function AccountSettings() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchUserProfile() {
      if (!session?.accessToken) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.status}`);
        }

        const userData = await response.json();
        setUserProfile(userData);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load user profile"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link
                  href="/console"
                  className="text-xl font-bold text-blue-600"
                >
                  AnyAuth Console
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {session?.user?.name && (
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {session.user.name}
                </span>
              )}
              <div className="relative">
                {session?.user?.image ? (
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={session.user.image}
                    alt={session.user.name || "User profile"}
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                    {session?.user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Account Settings
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-500"
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
                  <span>Loading user information...</span>
                </div>
              ) : error ? (
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
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </div>
              ) : userProfile ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  {/* Profile header with picture */}
                  <div className="px-4 py-5 sm:px-6 flex items-center">
                    {userProfile.picture ? (
                      <Image
                        className="h-16 w-16 rounded-full mr-4"
                        src={userProfile.picture}
                        alt={userProfile.full_name || userProfile.username}
                        width={64}
                        height={64}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-medium mr-4">
                        {(userProfile.full_name || userProfile.username)
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {userProfile.full_name || userProfile.username}
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        User account details and information
                      </p>
                    </div>
                  </div>

                  {/* Basic Information */}
                  <div className="border-t border-gray-200">
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Username
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {userProfile.username}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Full name
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {userProfile.full_name || "—"}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Email address
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                          {userProfile.email}
                          {userProfile.email_verified ? (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Verified
                            </span>
                          ) : (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Not verified
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Phone number
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                          {userProfile.phone || "—"}
                          {userProfile.phone &&
                            (userProfile.phone_verified ? (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Verified
                              </span>
                            ) : (
                              <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Not verified
                              </span>
                            ))}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Profile Information */}
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Profile Information
                      </h3>
                    </div>
                    <dl>
                      {userProfile.profile && (
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Bio
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {userProfile.profile}
                          </dd>
                        </div>
                      )}
                      {userProfile.website && (
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Website
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <a
                              href={userProfile.website}
                              className="text-blue-600 hover:text-blue-500"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {userProfile.website}
                            </a>
                          </dd>
                        </div>
                      )}
                      {userProfile.gender && (
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Gender
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {userProfile.gender}
                          </dd>
                        </div>
                      )}
                      {userProfile.birthdate && (
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Birthdate
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {userProfile.birthdate}
                          </dd>
                        </div>
                      )}
                      {userProfile.address && (
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">
                            Address
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {userProfile.address}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Regional Settings */}
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Regional Settings
                      </h3>
                    </div>
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Timezone
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {userProfile.zoneinfo || "—"}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Locale
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {userProfile.locale || "—"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Account Status */}
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Account Status
                      </h3>
                    </div>
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Account status
                        </dt>
                        <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                          {userProfile.disabled ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Disabled
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Account created
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {new Date(
                            userProfile.created_at * 1000
                          ).toLocaleString()}
                        </dd>
                      </div>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Last updated
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {new Date(
                            userProfile.updated_at * 1000
                          ).toLocaleString()}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Technical Details (Collapsible) */}
                  <details className="border-t border-gray-200">
                    <summary className="px-4 py-5 sm:px-6 cursor-pointer text-sm font-medium text-gray-900 hover:text-gray-700">
                      Technical Details
                    </summary>
                    <dl>
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          User ID
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
                          {userProfile.id}
                        </dd>
                      </div>
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">
                          Metadata
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <pre className="bg-gray-50 p-3 rounded-md overflow-auto font-mono text-xs">
                            {JSON.stringify(userProfile.metadata, null, 2) ||
                              "{}"}
                          </pre>
                        </dd>
                      </div>
                    </dl>
                  </details>
                </div>
              ) : (
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
                    No user profile found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    We couldn&apos;t retrieve your user profile information.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
