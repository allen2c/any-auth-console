// middleware.ts
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
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/api/me");

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
      // The Auth.js redirect callback will have already validated this URL
      // So we can safely redirect to it
      const decodedUrl = decodeURIComponent(callbackUrl);
      return NextResponse.redirect(decodedUrl);
    } catch (error) {
      console.error("Error processing callback URL:", error);
    }
  }

  // Redirect to console if accessing login page or root path while already logged in
  if (
    isLoggedIn &&
    (nextUrl.pathname === "/" ||
      nextUrl.pathname === "/login" ||
      nextUrl.pathname === "/signup") &&
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
