// app/hooks/useAuthApi.ts
"use client";

import { useSession } from "next-auth/react";
import { useState, useCallback } from "react";
import { refreshJwtToken } from "../services/auth";

interface UseAuthApiOptions {
  requireAuth?: boolean;
}

export function useAuthApi(options: UseAuthApiOptions = {}) {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Make an authenticated API request
   */
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (options.requireAuth !== false && !session?.accessToken) {
        throw new Error("Authentication required");
      }

      setIsLoading(true);
      setError(null);

      try {
        // Check if token is expired and needs refresh
        const now = Date.now();
        const isExpired = session?.accessTokenExpires
          ? now >= session.accessTokenExpires
          : false;

        // If token is expired, try to refresh it
        if (isExpired && session?.refreshToken) {
          try {
            const refreshedTokens = await refreshJwtToken(session.refreshToken);

            // Update the session with the new tokens
            await update({
              accessToken: refreshedTokens.access_token,
              refreshToken: refreshedTokens.refresh_token,
              accessTokenExpires:
                Date.now() + refreshedTokens.expires_in * 1000,
            });
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
            // Handle refresh failure (e.g., redirect to login)
            throw new Error("Session expired. Please log in again.");
          }
        }

        // Get the (potentially refreshed) token
        const headers = new Headers(options.headers || {});
        if (session?.accessToken) {
          headers.set("Authorization", `Bearer ${session.accessToken}`);
        }

        // Make the request
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }

        return await response.json();
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [session, update]
  );

  return {
    authFetch,
    isLoading,
    error,
    isAuthenticated: !!session?.accessToken,
  };
}
