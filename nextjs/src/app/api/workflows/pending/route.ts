import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const API_URL = process.env.API_URL;
    if (!API_URL) {
      return NextResponse.json(
        { error: "API_URL environment variable is not set" },
        { status: 500 }
      );
    }

    // Extract query parameters from the request URL
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const queryString = searchParams ? `?${searchParams}` : "";

    const response = await fetch(
      `${API_URL}/app/workflows/pending/${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Django API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching pending workflows:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}