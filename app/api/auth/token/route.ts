// app/api/auth/token/route.ts

import { NextRequest, NextResponse } from "next/server";
import { authorizationCodes } from "@/app/utils/auth";
import { createJwtToken } from "@/app/utils/jwt";

export async function POST(request: NextRequest) {
  try {
    // Get authorization code from request body
    const body = await request.json();
    const { grant_type, code, redirect_uri } = body;

    // Validate request parameters
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

    // Get stored authorization code data
    const codeData = authorizationCodes.get(code);

    // Validate authorization code
    if (!codeData) {
      return NextResponse.json(
        {
          error: "invalid_grant",
          error_description: "Code not found or already used",
        },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (codeData.expiresAt < Date.now()) {
      authorizationCodes.delete(code);
      return NextResponse.json(
        { error: "invalid_grant", error_description: "Code has expired" },
        { status: 400 }
      );
    }

    // Validate redirect URI (if provided)
    if (redirect_uri && codeData.redirectUri !== redirect_uri) {
      return NextResponse.json(
        {
          error: "invalid_grant",
          error_description: "Redirect URI does not match",
        },
        { status: 400 }
      );
    }

    // Delete authorization code (used once)
    authorizationCodes.delete(code);

    // Generate access token and refresh token
    const accessToken = createJwtToken(codeData.userId, 15 * 60); // 15 minutes
    const refreshToken = createJwtToken(codeData.userId, 7 * 24 * 60 * 60); // 7 days

    // Return tokens
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
