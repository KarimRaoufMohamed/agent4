import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const limit = req.nextUrl.searchParams.get("limit");
    const user = await currentUser();
    const response = await fetch(
      `${process.env.API_URL}/app/list_events/${
        user?.emailAddresses[0].emailAddress
      }?${limit ? `limit=${limit}` : ""}`
    );
    const responseData = await response.json();
    return NextResponse.json(responseData.events);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
