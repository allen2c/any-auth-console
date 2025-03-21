// app/services/api.ts
import { createJwtToken } from "../utils/jwt";

export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const token = createJwtToken(process.env.APPLICATION_USER_ID || "");

    const response = await fetch(
      `http://localhost:8000/users/check?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    throw error;
  }
}

export async function createUser(
  email: string,
  name: string | null | undefined,
  picture: string | null | undefined
): Promise<boolean> {
  try {
    const token = createJwtToken(process.env.APPLICATION_USER_ID || "");

    // Extract the part before @ for full_name and username base
    const emailName = email.split("@")[0];

    // Clean the emailName to keep only valid characters (alphanumeric, underscore, hyphen)
    const cleanEmailName = emailName.replace(/[^a-zA-Z0-9_-]/g, "");

    // Generate a random string for username suffix (alphanumeric)
    const randomSuffix = Math.random().toString(36).substring(2, 8);

    // Create username by combining email name and random suffix
    const username = `${cleanEmailName}_${randomSuffix}`;

    // Generate a secure password
    const password = generateSecurePassword();

    const userData = {
      username,
      full_name: emailName,
      email,
      phone: null,
      picture: picture || null,
      password,
      metadata: {},
    };

    const response = await fetch("http://localhost:8000/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(
        `API error: ${response.status}: ${await response.text()}`
      );
    }

    return true;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Helper function to generate a secure password
function generateSecurePassword(): string {
  const length = 16;
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  const allChars = lowercase + uppercase + numbers + symbols;

  let password = "";

  // Ensure at least one character from each category
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  // Fill the rest of the password
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Shuffle the password characters
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}
