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
      console.error(
        `Backend token fetch failed with status: ${response.status}`
      );
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
    console.log("Attempting to refresh token...");

    // Create FormData to match the backend expectation
    const formData = new URLSearchParams();
    formData.append("grant_type", "refresh_token");
    formData.append("refresh_token", refreshToken);

    console.log("Sending refresh request with form data...");

    const response = await fetch("http://localhost:8000/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    console.log(`Refresh token response status: ${response.status}`);

    if (!response.ok) {
      // Try to get more detailed error information
      let errorDetail = "Unknown error";
      try {
        const errorData = await response.json();
        errorDetail =
          errorData.detail || errorData.error || JSON.stringify(errorData);
      } catch {
        errorDetail =
          (await response.text()) || `HTTP error: ${response.status}`;
      }

      console.error(`Refresh token failed: ${errorDetail}`);
      throw new Error(`Refresh token failed: ${errorDetail}`);
    }

    const newTokens = await response.json();
    console.log("Successfully refreshed tokens");

    return newTokens;
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
    // Create FormData instead of using URLSearchParams
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: formData,
    });

    // Handle authentication errors properly
    if (!response.ok) {
      console.error(`Login failed with status: ${response.status}`);

      // Handle 401 Unauthorized separately
      if (response.status === 401) {
        throw new Error("Invalid username or password");
      }

      // Try to get error details from response
      const errorData = await response.json();
      throw new Error(errorData.error || "Authentication failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    // Re-throw for component handling
    throw error;
  }
}
