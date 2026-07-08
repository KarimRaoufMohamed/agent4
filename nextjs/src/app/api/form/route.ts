import { NextResponse, NextRequest } from "next/server";

// Handler for POST requests
export async function POST(req: NextRequest) {
  return handleRequest(req, "POST");
}

// Handler for PUT requests
export async function PUT(req: NextRequest) {
  return handleRequest(req, "PUT");
}

// Shared logic for both POST and PUT
async function handleRequest(req: NextRequest, method: "POST" | "PUT") {
  try {
    const body = await req.json();
    const { table_name, ...restOfBody } = body;

    await fetch(`${process.env.API_URL}/app/formData/${table_name}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(restOfBody),
    });

    return NextResponse.json(
      {
        message: `${
          method === "POST" ? "Feedback submitted" : "Data updated"
        } successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(`Error handling ${method.toLowerCase()} request:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
