// types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    /** The user's ID */
    userId?: string;
    /** The user's JWT access token */
    accessToken?: string;
    /** The user's JWT refresh token */
    refreshToken?: string;
    /** Expiration time for the access token */
    accessTokenExpires?: number;
    /** The user's JWT access token issued at */
    accessTokenIssuedAt?: number;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** The user's ID */
    id?: string;
    /** The user's JWT access token */
    accessToken?: string;
    /** The user's JWT refresh token */
    refreshToken?: string;
    /** The user's JWT access token issued at */
    accessTokenIssuedAt?: number;
    /** Expiration time for the access token */
    accessTokenExpires?: number;
  }
}
