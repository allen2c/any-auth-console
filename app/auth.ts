// app/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextAuthConfig } from "next-auth";
import { checkUserExists, createUser } from "./services/api";

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login/error", // Add an error page
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
              return true; // Allow sign in after user creation
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
        return {
          ...token,
          accessToken: account.access_token,
          id: user.id,
        };
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
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
