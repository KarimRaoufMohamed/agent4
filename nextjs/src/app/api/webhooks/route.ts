import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  let headerPayload;
  try {
    headerPayload = await headers();
  } catch (err) {
    console.error("Error: Failed to retrieve headers:", err);
    return new Response("Error: Failed to retrieve headers", {
      status: 500,
    });
  }

  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  let payload;
  try {
    payload = await req.json();
  } catch (err) {
    console.error("Error: Failed to parse JSON payload:", err);
    return new Response("Error: Invalid JSON payload", {
      status: 400,
    });
  }

  // Verify payload with headers
  try {
    wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Forward the payload to the Django backend
  try {
    const response = await fetch(`${process.env.API_URL}/app/userCreated`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.data.email_addresses[0].email_address,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error: Django backend returned an error:", errorText);
      return new Response(`Error: Django backend error: ${errorText}`, {
        status: response.status,
      });
    }
  } catch (err) {
    console.error("Error: Failed to forward payload to Django backend:", err);
    return new Response("Error: Failed to forward payload to backend", {
      status: 500,
    });
  }

  return new Response("Webhook received", { status: 200 });
}
