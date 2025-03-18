// app/utils/api-client.ts
import { getSession } from "next-auth/react";

/**
 * Makes an authenticated API request using the JWT token
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get the session to retrieve the access token
  const session = await getSession();

  if (!session?.accessToken) {
    throw new Error("No access token available");
  }

  // Add the Authorization header with the token
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${session.accessToken}`);

  // Make the request with the JWT token
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Example function to fetch user data from the backend
 */
export async function fetchUserData() {
  try {
    const response = await fetchWithAuth("http://localhost:8000/me");

    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}
