import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const relatedTable = req.nextUrl.searchParams.get("relatedTable");
    const filters = req.nextUrl.searchParams.get("filters");

    let url = `${process.env.API_URL}/app/list_data/${relatedTable}`;
    if (filters) {
      try {
        const filtersArray = JSON.parse(filters) as {
          filterColumn: string;
          filterValue: string;
        }[];

        const queryParams = filtersArray
          .map(
            ({ filterColumn, filterValue }) =>
              `${encodeURIComponent(filterColumn)}=${encodeURIComponent(
                filterValue
              )}`
          )
          .join("&");

        url = `${process.env.API_URL}/app/filter_by_fields/${relatedTable}?${queryParams}`;
      } catch (error) {
        console.error("Invalid filters format:", error);
        return NextResponse.json(
          { message: "Invalid filters format" },
          { status: 400 }
        );
      }
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const responseData = await response.json();
    return NextResponse.json({ data: responseData.data });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 }
    );
  }
}
