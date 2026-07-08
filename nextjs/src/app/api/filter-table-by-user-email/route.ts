import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const table_name = req.nextUrl.searchParams.get("table_name");
    const user = await currentUser();
    const response = await fetch(
      `${process.env.API_URL}/app/filter_table_by_user_email/${table_name}/${user?.emailAddresses[0].emailAddress}`
    );
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
