// app/api/auth/authorize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { generateAuthCode, storeAuthorizationCode } from "@/app/utils/auth";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const redirectUri = searchParams.get("redirect_uri");
    const clientId = searchParams.get("client_id");

    if (!redirectUri) {
      return NextResponse.json(
        { error: "Missing redirect_uri" },
        { status: 400 }
      );
    }

    // Check client ID (should be validated in actual application)
    if (clientId !== "anychat_client") {
      return NextResponse.json({ error: "Invalid client_id" }, { status: 401 });
    }

    // Get current user session
    const token = await getToken({ req: request });
    if (!token?.id) {
      // If not logged in, redirect to login page
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Generate authorization code for authenticated user
    const authCode = generateAuthCode();

    // Store authorization code with user ID and redirect URI
    storeAuthorizationCode(authCode, redirectUri, token.id);

    // Redirect user to client application with authorization code
    const finalRedirectUrl = new URL(redirectUri);
    finalRedirectUrl.searchParams.set("code", authCode);

    return NextResponse.redirect(finalRedirectUrl);
  } catch (error) {
    console.error("Error in authorize endpoint:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
