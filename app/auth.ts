// app/auth.ts

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { fetchJwtToken, refreshJwtToken } from "./services/auth";
import { decodeJwtToken } from "./utils/jwt";
import { generateAuthCode, storeAuthorizationCode } from "@/app/utils/auth";

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
      console.log(
        `Signing in with user ${JSON.stringify(
          user
        )} and account ${JSON.stringify(account)}`
      );

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
            const decodedPayload = decodeJwtToken(jwtResponse.access_token);
            const userId = decodedPayload.sub;
            console.log(`Decoded payload: ${JSON.stringify(decodedPayload)}`);

            return {
              ...token,
              accessToken: jwtResponse.access_token,
              refreshToken: jwtResponse.refresh_token,
              accessTokenIssuedAt: decodedPayload.iat * 1000,
              accessTokenExpires: decodedPayload.exp * 1000,
              id: userId,
            };
          } catch (error) {
            console.error("Error fetching JWT token:", error);
            // Still return token without JWT information
            return {
              ...token,
              error: "Invalid JWT token",
            };
          }
        }

        return {
          ...token,
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
          const decodedPayload = decodeJwtToken(refreshedTokens.access_token);

          console.log("Token refresh successful!");

          return {
            ...token,
            accessToken: refreshedTokens.access_token,
            refreshToken: refreshedTokens.refresh_token,
            accessTokenIssuedAt: decodedPayload.iat * 1000,
            accessTokenExpires: decodedPayload.exp * 1000,
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
      if (token.id) {
        // Use token.id to set userId
        session.userId = token.id; // Set userId to session
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.accessTokenExpires = token.accessTokenExpires as number;
      }
      return session;
    },

    // Step 4: Handle redirection logic in redirect callback
    async redirect({ url, baseUrl }) {
      console.log(
        `Auth redirect triggered with URL: ${url}, baseUrl: ${baseUrl}`
      );

      // Define trusted external domains
      const trustedDomains = [
        "http://localhost:3010",
        // Add other trusted domains
      ];

      // Check if URL is a relative path (starts with /)
      if (url.startsWith("/")) {
        console.log("Redirecting to relative URL:", `${baseUrl}${url}`);
        return `${baseUrl}${url}`;
      }

      // Check if URL is in our trusted domain list
      else if (trustedDomains.some((domain) => url.startsWith(domain))) {
        // For trusted cross-domain callbacks, allow redirection
        console.log("Redirecting to trusted external domain:", url);
        return url;
      }

      // Default return baseUrl (for all other cases)
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
