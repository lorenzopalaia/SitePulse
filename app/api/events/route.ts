import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// @ts-expect-error missing types
import UserAgent from "user-agent";

export async function OPTIONS() {
  const response = NextResponse.json(
    { message: "Preflight request successful" },
    { status: 200 }
  );
  response.headers.set("Access-Control-Allow-Origin", "*"); // Consenti richieste da qualsiasi origine
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

export async function POST(request: Request) {
  const supabase = createClient();

  try {
    const body = await request.json();
    const {
      websiteId,
      visitorId,
      sessionId,
      domain,
      href,
      referrer,
      type,
      extraData,
      timestamp,
    } = body;

    if (
      !websiteId ||
      !visitorId ||
      !sessionId ||
      !domain ||
      !type ||
      !timestamp
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent");
    const userAgentData = UserAgent.parse(userAgent);

    const { error } = await supabase.from("events").insert([
      {
        website_id: websiteId,
        visitor_id: visitorId,
        session_id: sessionId,
        domain,
        href,
        referrer,
        event_type: type,
        extra_data: {
          ...extraData,
          browser: userAgentData.browser,
          os: userAgentData.os,
          device: userAgentData.device,
        },
        timestamp,
      },
    ]);

    if (error) {
      throw error;
    }

    // Risposta in caso di successo
    return NextResponse.json(
      { message: "Event recorded successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving event:", error);
    return NextResponse.json(
      { error: "Failed to record event" },
      { status: 500 }
    );
  }
}
