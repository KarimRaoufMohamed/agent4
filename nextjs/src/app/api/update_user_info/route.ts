import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    await fetch(`${process.env.API_URL}/app/create_or_update_user`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Email: user.emailAddresses[0].emailAddress,
        FirstName: user.firstName,
        LastName: user.lastName,
        ...body,
      }),

      method: "POST",
    });
    const client = await clerkClient();

    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...body,
      },
    });
    return NextResponse.json(
      { message: "User info updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
