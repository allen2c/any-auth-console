// app/hooks/useAuthApi.ts
"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useCallback, useRef } from "react";
import { refreshJwtToken } from "../services/auth";

interface UseAuthApiOptions {
  requireAuth?: boolean;
  redirectToLogin?: boolean;
}

export function useAuthApi(options: UseAuthApiOptions = {}) {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isRefreshing = useRef(false);
  const refreshPromise = useRef<Promise<void> | null>(null);

  /**
   * Refreshes the token
   */
  const refreshToken = useCallback(async () => {
    if (!session?.refreshToken) {
      throw new Error("No refresh token available");
    }

    // If already refreshing, return the existing promise
    if (isRefreshing.current && refreshPromise.current) {
      return refreshPromise.current;
    }

    // Start the refresh process
    isRefreshing.current = true;

    const refreshProcess = async () => {
      try {
        console.log("Starting token refresh...");
        const refreshedTokens = await refreshJwtToken(
          session.refreshToken as string
        );

        console.log("Token refresh successful, updating session...");
        // Update the session with the new tokens
        await update({
          accessToken: refreshedTokens.access_token,
          refreshToken: refreshedTokens.refresh_token,
          accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
        });

        console.log("Session updated with new tokens");
      } catch (error) {
        console.error("Token refresh failed:", error);

        // Check for specific token expiration error
        if (
          error instanceof Error &&
          (error.message === "TOKEN_EXPIRED" ||
            error.message.includes("expired") ||
            error.message.includes("401"))
        ) {
          console.log("Refresh token has expired, redirecting to login...");

          // Redirect to OAuth login
          signIn("google");
        } else if (options.redirectToLogin) {
          // For other errors, follow the option setting
          console.log("Redirecting to login page due to refresh error...");
          signIn("google");
        }

        throw error;
      } finally {
        isRefreshing.current = false;
        refreshPromise.current = null;
      }
    };

    // Store the promise so we can reuse it if another request comes in
    refreshPromise.current = refreshProcess();
    return refreshPromise.current;
  }, [session, update, options.redirectToLogin]);

  /**
   * Make an authenticated API request
   */
  const authFetch = useCallback(
    async (url: string, fetchOptions: RequestInit = {}) => {
      if (options.requireAuth !== false && !session?.accessToken) {
        if (options.redirectToLogin) {
          signIn("google");
        }
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
            await refreshToken();
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
            setError(new Error("Session expired. Please log in again."));
            throw refreshError;
          }
        }

        // Get the (potentially refreshed) token
        const headers = new Headers(fetchOptions.headers || {});
        if (session?.accessToken) {
          headers.set("Authorization", `Bearer ${session.accessToken}`);
        }

        // Make the request
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
        });

        if (!response.ok) {
          // If we get a 401 Unauthorized after attempting with a token, the token might be invalid
          if (response.status === 401 && session?.refreshToken) {
            // Only try to refresh once to avoid infinite loops
            if (!isExpired) {
              try {
                await refreshToken();

                // Retry the request with the new token
                headers.set("Authorization", `Bearer ${session?.accessToken}`);
                const retryResponse = await fetch(url, {
                  ...fetchOptions,
                  headers,
                });

                if (!retryResponse.ok) {
                  throw new Error(
                    `API request failed with status: ${retryResponse.status}`
                  );
                }

                return await retryResponse.json();
              } catch (retryError) {
                console.error(
                  "Failed to refresh token and retry request:",
                  retryError
                );
                throw new Error("Session expired. Please log in again.");
              }
            } else {
              // Already tried refreshing, still getting 401
              throw new Error("Session expired. Please log in again.");
            }
          }

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
    [session, refreshToken, options.redirectToLogin, options.requireAuth]
  );

  return {
    authFetch,
    refreshToken,
    isLoading,
    error,
    isAuthenticated: !!session?.accessToken,
  };
}
