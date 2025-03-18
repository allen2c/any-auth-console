// app/services/auth.ts

interface JwtTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface JwtTokenRequest {
  provider: string;
  email: string;
  name: string;
  picture?: string;
  googleId?: string;
}

/**
 * Fetches a JWT token from the backend using OAuth credentials
 */
export async function fetchJwtToken(
  credentials: JwtTokenRequest
): Promise<JwtTokenResponse> {
  try {
    const response = await fetch("http://localhost:8000/api/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Backend returned status: ${response.status}`);
    }

    const data = await response.json();
    return data;
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
    const response = await fetch("http://localhost:8000/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error refreshing JWT token:", error);
    throw error;
  }
}
