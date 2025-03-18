// app/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { checkUserExists, createUser } from "./services/api";
import { fetchJwtToken } from "./services/auth"; // New import

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Only run this check for Google provider
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user exists in your backend
          const exists = await checkUserExists(user.email);

          if (!exists) {
            // User doesn't exist, create a new user
            try {
              await createUser(user.email, user.name, user.image);
              console.log(`Created new user for: ${user.email}`);
            } catch (error) {
              console.error("Error creating user:", error);
              return false; // Deny sign in if user creation fails
            }
          }

          // User exists, allow sign in
          return true;
        } catch (error) {
          console.error("Error during user existence check:", error);
          // Handle error case (could return false to deny sign in)
          return false;
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

      // Access token has expired, try to refresh it (requires additional implementation)
      // This is where you would use the refresh token to get a new access token

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
