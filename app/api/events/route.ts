import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

import { DiscordClient } from "@/utils/discordClient";

import { getCountryFlag } from "@/utils/countryUtils";

// @ts-expect-error missing types
import UserAgent from "user-agent";

export async function POST(request: Request) {
  const supabase = createClient();

  const discord = new DiscordClient();

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
    } = body;

    if (href && href.includes("localhost")) {
      return NextResponse.json(
        { error: "Localhost URLs are not allowed" },
        { status: 400 }
      );
    }

    if (!websiteId || !visitorId || !sessionId || !domain || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent");
    const userAgentData = UserAgent.parse(userAgent);

    const headersList = headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
    const country = headersList.get("x-vercel-ip-country") || null;
    const cityHeader = headersList.get("x-vercel-ip-city");
    const city = cityHeader ? cityHeader.replaceAll("%20", " ") : null;
    const region = headersList.get("x-vercel-ip-country-region") || null;

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
          ip,
          country,
          city,
          region,
        },
      },
    ]);

    if (error) {
      throw error;
    }

    const embedFields = [];

    if (extraData.url) {
      embedFields.push({
        name: "URL",
        value: extraData.url,
      });
    }

    embedFields.push({
      name: "Referrer",
      value: referrer || "None",
    });

    await discord.sendEmbed({
      title: `New event recorded: ${type}`,
      description: `Location: ${getCountryFlag(country || "")} ${
        city || "Unknown City"
      }\nDomain: ${domain}`,
      fields: embedFields,
      color: 0x46d4e8,
    });

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
