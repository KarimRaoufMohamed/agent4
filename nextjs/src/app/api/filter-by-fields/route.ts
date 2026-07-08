import { Filter } from "@/types/screens";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  try {
    const table_name = req.nextUrl.searchParams.get("table_name");
    const params = JSON.parse(
      req.nextUrl.searchParams.get("params") || "[]"
    ) as Filter[];

    const queryParams = params
      .map(
        ({ param_column, param_value }: Filter) =>
          `${encodeURIComponent(param_column)}=${encodeURIComponent(
            String(param_value)
          )}`
      )
      .join("&");
    const sessionsResponse = await fetch(
      `${process.env.API_URL}/app/filter_by_fields/${table_name}?${queryParams}`
    );
    const sessionsResponseData = await sessionsResponse.json();

    return NextResponse.json({
      availableSessions: sessionsResponseData.data,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
