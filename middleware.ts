import { NextResponse } from "next/server";
import { auth } from "@/app/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Allow access to these routes even if not logged in
  const isPublicPath =
    nextUrl.pathname === "/" ||
    nextUrl.pathname === "/login" ||
    nextUrl.pathname === "/signup" ||
    nextUrl.pathname.startsWith("/api/auth");

  // Check if this is an accept-invite path
  const isAcceptInvitePath = nextUrl.pathname.includes("/accept-invite");

  // Get callback URL if specified (for redirecting back after login)
  const callbackUrl = nextUrl.searchParams.get("callbackUrl");

  // Redirect to login if trying to access a protected route while not logged in
  if (!isPublicPath && !isLoggedIn) {
    // If it's an accept-invite path, preserve the token in the redirect
    if (isAcceptInvitePath) {
      const token = nextUrl.searchParams.get("token");
      const loginUrl = new URL("/login", nextUrl);
      // Encode the current URL as the callback URL
      loginUrl.searchParams.set(
        "callbackUrl",
        encodeURIComponent(nextUrl.pathname + "?token=" + token)
      );
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Handle callback redirects after login
  if (isLoggedIn && callbackUrl) {
    try {
      // Decode the callback URL if needed
      const decodedUrl = decodeURIComponent(callbackUrl);

      // Only redirect to relative URLs to prevent open redirect vulnerabilities
      if (decodedUrl.startsWith("/")) {
        return NextResponse.redirect(new URL(decodedUrl, nextUrl.origin));
      }
    } catch (error) {
      console.error("Error processing callback URL:", error);
    }
  }

  // Redirect to console if accessing login page while already logged in
  if (
    isLoggedIn &&
    (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup") &&
    !callbackUrl
  ) {
    return NextResponse.redirect(new URL("/console", nextUrl));
  }

  return NextResponse.next();
});

// Specify which routes this middleware applies to
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
