import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    const user = await currentUser();
    const response = await fetch(
      `${process.env.API_URL}/app/get_challenges_by_date/${user?.emailAddresses[0].emailAddress}/${date}`
    );
    const responseData = await response.json();
    return NextResponse.json({ data: responseData.data });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
