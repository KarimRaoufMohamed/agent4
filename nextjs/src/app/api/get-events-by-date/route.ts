import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const dateParam = req.nextUrl.searchParams.get("date");
    const user = await currentUser();
    let formattedDate = dateParam;
    if (dateParam) {
      const date = new Date(dateParam);
      formattedDate = date.toISOString().split("T")[0];
    }

    const response = await fetch(
      `${process.env.API_URL}/app/get_events_by_date/${user?.emailAddresses[0].emailAddress}/${formattedDate}`
    );

    const responseData = await response.json();

    return NextResponse.json({ events: responseData.data });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
