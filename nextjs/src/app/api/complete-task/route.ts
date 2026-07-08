import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { ChallengeID, TaskID, TaskPoints } = await req.json();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const taskResponse = await fetch(
      `${process.env.API_URL}/app/task_progress`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          TaskID,
          email: user?.emailAddresses[0].emailAddress,
        }),
      }
    );

    const taskData = await taskResponse.json();
    const client = await clerkClient();

    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        Score: taskData.userScore,
      },
    });

    await fetch(`${process.env.API_URL}/app/challenge_progress`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        email: user?.emailAddresses[0].emailAddress,
        ChallengeID,
        task_score: TaskPoints,
      }),
    });

    return NextResponse.json(
      { message: "Challenge completed successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
