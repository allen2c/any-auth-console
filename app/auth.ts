// app/auth.ts

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { fetchJwtToken, refreshJwtToken } from "./services/auth";
import { getSession } from "next-auth/react";

// Simple in-memory store for authorization codes
// In production, use a database
export const authorizationCodes = new Map();

// Store an authorization code
function storeAuthorizationCode(
  code: string,
  userId: string,
  clientId: string,
  redirectUri: string
) {
  authorizationCodes.set(code, {
    userId,
    clientId,
    redirectUri,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiration
  });
  console.log(`Stored authorization code for user ${userId}`);
}

// Generate a secure random string for authorization codes
function generateAuthCode() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array); // Use Web Crypto API to generate random values
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  ); // Convert to hex string
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login/error",
  },

  callbacks: {
    // Step 1: Handle authorization logic only in signIn
    async signIn({ user, account }) {
      // Only run this for Google provider
      if (account?.provider === "google" && user.email) {
        try {
          // Call the token endpoint directly, which handles user existence/creation
          await fetchJwtToken({
            provider: "google",
            email: user.email,
            name: user.name || "",
            picture: user.image || "",
            googleId: account.providerAccountId,
          });

          // If we get here, the token was successfully obtained
          return true; // Allow sign-in to proceed
        } catch (error) {
          console.error("Error obtaining token from backend:", error);
          return false; // Deny sign-in if token fetch fails
        }
      }

      // Allow sign in for other providers or if no email
      return true;
    },

    // Step 2: Handle JWT token generation
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Get JWT token from backend using Google credentials
        if (account.provider === "google") {
          try {
            const jwtResponse = await fetchJwtToken({
              provider: "google",
              email: user.email as string,
              name: user.name as string,
              picture: user.image as string,
              googleId: account.providerAccountId,
            });

            return {
              ...token,
              accessToken: jwtResponse.access_token,
              refreshToken: jwtResponse.refresh_token,
              accessTokenExpires: Date.now() + jwtResponse.expires_in * 1000,
              id: user.id,
            };
          } catch (error) {
            console.error("Error fetching JWT token:", error);
            // Still return token without JWT information
            return {
              ...token,
              id: user.id,
            };
          }
        }

        return {
          ...token,
          accessToken: account.access_token,
          id: user.id,
        };
      }

      // On subsequent calls, check if access token has expired
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to refresh it
      if (token.refreshToken) {
        try {
          console.log("Token expired, attempting refresh...");
          const refreshedTokens = await refreshJwtToken(
            token.refreshToken as string
          );

          console.log("Token refresh successful!");

          // Store the new token expiration time
          const newExpiryTime = Date.now() + refreshedTokens.expires_in * 1000;

          return {
            ...token,
            accessToken: refreshedTokens.access_token,
            refreshToken: refreshedTokens.refresh_token,
            accessTokenExpires: newExpiryTime,
          };
        } catch (error) {
          console.error("Error refreshing token:", error);

          // Return token with an error flag - user will need to sign in again
          return {
            ...token,
            error: "RefreshAccessTokenError",
          };
        }
      }

      return token;
    },

    // Step 3: Handle session creation
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
        // Add additional fields if needed
        session.refreshToken = token.refreshToken as string;
        session.accessTokenExpires = token.accessTokenExpires as number;
      }
      return session;
    },

    // Step 4: Handle redirection logic in redirect callback
    async redirect({ url, baseUrl }) {
      console.log("Auth redirect triggered with URL:", url);

      // Check if the URL is valid
      if (!url || typeof url !== "string" || !url.startsWith("http")) {
        console.error("Invalid URL provided:", url);
        return baseUrl;
      }

      // Parse the URL to extract parameters
      const urlObj = new URL(url);

      // Check if this URL has a redirect_uri parameter (from OAuth flow)
      const redirectUri = urlObj.searchParams.get("redirect_uri");
      if (redirectUri) {
        console.log("Found redirect_uri parameter:", redirectUri);
        // Store it as callbackUrl for NextAuth to use
        urlObj.searchParams.set("callbackUrl", redirectUri);
        urlObj.searchParams.delete("redirect_uri");
        url = urlObj.toString();
        console.log("Updated URL with callbackUrl:", url);
      }

      // Define trusted external domains that are allowed for redirects
      const trustedDomains = [
        "http://localhost:3010",
        // Add other trusted domains here as needed
      ];

      // Special case - if this is our redirect API, let it handle the redirect
      if (url.startsWith(`${baseUrl}/api/auth/redirect`)) {
        console.log("Using redirect API:", url);
        return url;
      }

      // Check if the URL is relative (starts with /)
      if (url.startsWith("/")) {
        console.log("Redirecting to relative URL:", `${baseUrl}${url}`);
        return `${baseUrl}${url}`;
      }

      // Check if URL is in our trusted domains list
      else if (trustedDomains.some((domain) => url.startsWith(domain))) {
        // For trusted cross-domain callbacks, allow redirection
        try {
          const session = await getSession();
          if (!session || !session.user || !session.user.id) {
            console.error("Cannot redirect: User ID is missing from session");
            return baseUrl; // Redirect to home if no user ID
          }

          const userId = session.user.id;

          // Generate a secure authorization code
          const authCode = generateAuthCode();

          // Store the code with the user ID and original redirect URI
          storeAuthorizationCode(authCode, userId, "anychat_client", url);

          // Create the final redirect URL with the code
          const redirectUrl = new URL(url);
          redirectUrl.searchParams.set("code", authCode);

          // Add state parameter if needed for CSRF protection
          const state = generateAuthCode();
          redirectUrl.searchParams.set("state", state);

          console.log(
            "Redirecting to trusted external domain with code:",
            redirectUrl.toString()
          );

          return redirectUrl.toString();
        } catch (error) {
          console.error("Error in redirect callback:", error);
          return baseUrl; // Fallback to home page on error
        }
      }

      // Default to base URL for all other cases
      console.log("Redirecting to default baseUrl:", baseUrl);
      return baseUrl;
    },

    // Step 5: Handle authorization logic in authorized callback
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnConsole = nextUrl.pathname.startsWith("/console");
      if (isOnConsole) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/console", nextUrl));
      }
      return true;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
