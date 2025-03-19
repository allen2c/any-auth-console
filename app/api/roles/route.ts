// app/api/roles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createJwtToken } from "@/app/utils/jwt";

export async function GET(request: NextRequest) {
  try {
    // Create application JWT token for backend operations
    const appToken = createJwtToken(process.env.APPLICATION_USER_ID || "");

    // Parse query parameters
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") || "500";
    const order = url.searchParams.get("order") || "desc";
    const after = url.searchParams.get("after") || "";
    const before = url.searchParams.get("before") || "";

    // Make request to backend API with application token
    const response = await fetch(
      `http://localhost:8000/roles?limit=${limit}&order=${order}&after=${after}&before=${before}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${appToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch roles: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}
