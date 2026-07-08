import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { availability_id, coach_id, date, user_email } = await req.json();
    const response = await fetch(
      `${process.env.API_URL}/app/book_coach_availability`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          availability_id,
          coach_id,
          date,
          user_email,
        }),
      }
    );
    return NextResponse.json(
      { message: "Session scheduled successfully." },
      {
        status: response.status,
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
