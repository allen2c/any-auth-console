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
      throw new Error(
        `Backend returned status: ${
          response.status
        }, response: ${await response.text()}`
      );
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

    const response = await fetch("http://localhost:8000/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    console.log(`Refresh token response status: ${response.status}`);

    // Try to get the response text
    const responseText = await response.text();

    if (!response.ok) {
      // Parse the response back to JSON if possible, otherwise use the text
      let errorDetail;
      let isExpiredToken = false;

      try {
        const errorJson = JSON.parse(responseText);
        errorDetail = errorJson.detail || responseText;

        // Check if the error indicates token expiration
        isExpiredToken =
          errorDetail.includes("expired") ||
          errorDetail.includes("has expired") ||
          response.status === 401;
      } catch {
        errorDetail = responseText || `HTTP error: ${response.status}`;
        isExpiredToken = response.status === 401;
      }

      console.error(`Refresh token failed: ${errorDetail}`);

      // Throw a specific error for expired tokens
      if (isExpiredToken) {
        throw new Error("TOKEN_EXPIRED");
      }

      throw new Error(`Refresh token failed: ${errorDetail}`);
    }

    // Parse JSON from the text we already got
    const newTokens = JSON.parse(responseText);
    console.log("Successfully refreshed tokens");

    return newTokens;
  } catch (error) {
    console.error("Error refreshing JWT token:", error);
    throw error;
  }
}
