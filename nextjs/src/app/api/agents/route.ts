import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_email = searchParams.get("user_email") || "";
    const API_URL = process.env.API_URL;

    const response = await fetch(
      `${API_URL}/app/agents/by-email/?user_email=${encodeURIComponent(user_email)}`,
      { cache: "no-store" }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error in /api/agents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
