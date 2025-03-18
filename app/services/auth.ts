// app/services/auth.ts

import { createJwtToken } from "../utils/jwt";

interface JwtTokenRequest {
  provider: string;
  email: string;
  name: string;
  picture?: string;
  googleId?: string;
}

interface JwtTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  expires_at: number;
  issued_at: string;
}

/**
 * Fetches a JWT token from the backend using OAuth credentials
 */
export async function fetchJwtToken(
  credentials: JwtTokenRequest
): Promise<JwtTokenResponse> {
  const token = createJwtToken(process.env.APPLICATION_USER_ID || "");

  try {
    const response = await fetch("http://localhost:8000/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Backend returned status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching JWT token:", error);
    throw error;
  }
}

/**
 * Refreshes an expired JWT token using a refresh token
 */
export async function refreshJwtToken(
  refreshToken: string
): Promise<JwtTokenResponse> {
  try {
    const response = await fetch("http://localhost:8000/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error refreshing JWT token:", error);
    throw error;
  }
}

/**
 * Login with email/username and password
 */
export async function loginWithCredentials(
  username: string,
  password: string
): Promise<JwtTokenResponse> {
  try {
    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username,
        password,
      }),
    });

    // Handle authentication errors properly
    if (!response.ok) {
      // Try to get the detailed error message from the response
      let errorMessage = "Authentication failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        // If we can't parse the JSON, try to get the text content
        try {
          errorMessage = await response.text();
        } catch {
          // If all else fails, use the status text
          errorMessage = response.statusText || errorMessage;
        }
      }

      // Create a specific error for 401 Unauthorized
      if (response.status === 401) {
        throw new Error("Invalid username or password");
      }

      // Handle other error statuses
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    // Re-throw with a clear message
    if (error instanceof Error) {
      throw error; // Keep the original error message
    } else {
      throw new Error("Failed to connect to authentication server");
    }
  }
}
