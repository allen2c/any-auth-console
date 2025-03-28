// app/api/auth/redirect/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    // Get the callback URL from the query parameters
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");

    console.log("Redirect API called with callbackUrl:", callbackUrl);

    if (!callbackUrl) {
      console.error("Missing callbackUrl parameter");
      return NextResponse.json(
        { error: "Missing callbackUrl parameter" },
        { status: 400 }
      );
    }

    // Get user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    console.log("Token retrieved:", {
      hasAccessToken: !!token?.accessToken,
      hasRefreshToken: !!token?.refreshToken,
    });

    if (!token?.accessToken || !token?.refreshToken) {
      console.error("Missing tokens in user session");
      return NextResponse.json(
        { error: "User not authenticated or missing tokens" },
        { status: 401 }
      );
    }

    // Calculate token expiration (default to 1 hour if not available)
    const expiresIn = token.accessTokenExpires
      ? Math.floor((token.accessTokenExpires - Date.now()) / 1000)
      : 3600;

    // Create the redirect URL with tokens as query parameters
    const redirectUrl = new URL(callbackUrl);
    redirectUrl.searchParams.set("access_token", token.accessToken as string);
    redirectUrl.searchParams.set("refresh_token", token.refreshToken as string);
    redirectUrl.searchParams.set("expires_in", expiresIn.toString());

    console.log("Redirecting to:", redirectUrl.toString());

    // Redirect with the tokens
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error in redirect API:", error);
    return NextResponse.json(
      { error: "Failed to process redirect" },
      { status: 500 }
    );
  }
}
