// app/auth.ts

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthConfig } from "next-auth";
import { fetchJwtToken, refreshJwtToken } from "./services/auth"; // Updated import

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        accessToken: { label: "Access Token", type: "text" },
        refreshToken: { label: "Refresh Token", type: "text" },
        accessTokenExpires: { label: "Token Expiry", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.accessToken) return null;

        // Return the credentials directly to be stored in the JWT
        return {
          id: "user-id", // Will be updated in the jwt callback
          accessToken: credentials.accessToken,
          refreshToken: credentials.refreshToken,
          accessTokenExpires: credentials.accessTokenExpires,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login/error",
  },
  callbacks: {
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
          return true;
        } catch (error) {
          console.error("Error obtaining token from backend:", error);
          return false; // Deny sign in if token fetch fails
        }
      }

      // Allow sign in for other providers or if no email
      return true;
    },

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
          const refreshedTokens = await refreshJwtToken(
            token.refreshToken as string
          );

          return {
            ...token,
            accessToken: refreshedTokens.access_token,
            refreshToken: refreshedTokens.refresh_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
          };
        } catch (error) {
          console.error("Error refreshing token:", error);
          // Return token without refresh - user will need to sign in again
          return {
            ...token,
            error: "RefreshAccessTokenError",
          };
        }
      }

      return token;
    },

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
