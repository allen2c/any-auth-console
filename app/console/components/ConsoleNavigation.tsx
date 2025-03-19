// app/console/components/ConsoleNavigation.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/app/components/LogoutButton";
import ProjectSwitcher from "@/app/components/ProjectSwitcher";

interface ConsoleNavigationProps {
  projectId: string | null;
}

export default function ConsoleNavigation({
  projectId,
}: ConsoleNavigationProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 mr-6">
                AnyAuth Console
              </Link>
              <ProjectSwitcher currentProjectId={projectId || undefined} />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {session?.user?.name && (
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {session.user.name}
              </span>
            )}
            <div className="relative">
              <button
                className="flex items-center focus:outline-none"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="relative inline-block">
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
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-2 ring-white"></span>
                </span>
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1">
                    {session?.user?.email && (
                      <div className="block px-4 py-2 text-sm text-gray-500 border-b">
                        {session.user.email}
                      </div>
                    )}
                    <Link
                      href="/console/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Account settings
                    </Link>
                    <LogoutButton className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
