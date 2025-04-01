// app/api/auth/token/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createJwtToken } from "@/app/utils/jwt";

// In-memory storage for authorization codes (in a real app, use a database)
const authorizationCodes = new Map<
  string,
  {
    userId: string;
    clientId: string;
    expiresAt: number;
  }
>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grant_type, code, redirect_uri } = body;

    // Validate request
    if (grant_type !== "authorization_code") {
      return NextResponse.json(
        { error: "unsupported_grant_type" },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "invalid_request", error_description: "Code is required" },
        { status: 400 }
      );
    }

    // Retrieve and validate the stored authorization code
    const codeDetails = authorizationCodes.get(code);

    if (!codeDetails) {
      return NextResponse.json(
        {
          error: "invalid_grant",
          error_description: "Code not found or already used",
        },
        { status: 400 }
      );
    }

    if (codeDetails.expiresAt < Date.now()) {
      authorizationCodes.delete(code);
      return NextResponse.json(
        { error: "invalid_grant", error_description: "Code has expired" },
        { status: 400 }
      );
    }

    // Delete the code (one-time use)
    authorizationCodes.delete(code);

    // In a real implementation, we would validate the client and redirect_uri here

    // For demo purposes, get the user from the stored code details
    const userId = codeDetails.userId;

    // Generate access and refresh tokens
    const accessToken = createJwtToken(userId, 15 * 60); // 15 minutes
    const refreshToken = createJwtToken(userId, 7 * 24 * 60 * 60); // 7 days

    // Return the tokens
    return NextResponse.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: "Bearer",
      expires_in: 15 * 60,
    });
  } catch (error) {
    console.error("Error in token endpoint:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// Helper function to store authorization codes (would be called from login route)
export function storeAuthorizationCode(
  code: string,
  userId: string,
  clientId: string
) {
  authorizationCodes.set(code, {
    userId,
    clientId,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
}
