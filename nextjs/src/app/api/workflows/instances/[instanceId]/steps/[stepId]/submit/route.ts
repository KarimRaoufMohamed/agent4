import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ instanceId: string; stepId: string }> }
) {
  try {
    const API_URL = process.env.API_URL;
    if (!API_URL) {
      return NextResponse.json(
        { error: "API_URL environment variable is not set" },
        { status: 500 }
      );
    }

    // Await the params Promise
    const { instanceId, stepId } = await params;

    const body = await request.json();

    const response = await fetch(
      `${API_URL}/app/workflows/instances/${instanceId}/steps/${stepId}/submit/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
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
    console.error("Error proxying step submit request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
