import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { EventID } = await req.json();
    const response = await fetch(
      `${process.env.API_URL}/app/cancel_event/${EventID}`,
      {
        method: "POST",
      }
    );
    if (!response.ok) {
      return NextResponse.json({ error: "Reservation could not be canceled." });
    }
    return NextResponse.json({
      message: "Reservation canceled successfully.",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
