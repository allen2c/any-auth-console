// Define an interface for the authorization code structure
interface AuthorizationCode {
  userId: string;
  redirectUri: string;
  expiresAt: number;
}

// Update the typing of authorizationCodes
export const authorizationCodes: Map<string, AuthorizationCode> = new Map();

// Store an authorization code
export function storeAuthorizationCode(
  code: string,
  redirectUri: string,
  userId: string
) {
  authorizationCodes.set(code, {
    redirectUri,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiration for the code
    userId,
  });
  console.log(`Stored authorization code for user ${redirectUri}`);
}

// Generate a secure random string for authorization codes
export function generateAuthCode() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array); // Use Web Crypto API to generate random values
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  ); // Convert to hex string
}
