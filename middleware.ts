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

  // Redirect to login if trying to access a protected route while not logged in
  if (!isPublicPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Redirect to console if accessing login page while already logged in
  if (
    isLoggedIn &&
    (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup")
  ) {
    return NextResponse.redirect(new URL("/console", nextUrl));
  }

  return NextResponse.next();
});

// Specify which routes this middleware applies to
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
