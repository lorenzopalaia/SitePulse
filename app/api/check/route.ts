import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { domain, scriptToCheck } = await req.json();

    if (!domain || !scriptToCheck) {
      return NextResponse.json(
        { error: "Domain and script are required" },
        { status: 400 }
      );
    }

    const urlCombinations = [
      `http://${domain}`,
      `https://${domain}`,
      `http://www.${domain}`,
      `https://www.${domain}`,
    ];

    for (const url of urlCombinations) {
      try {
        const response = await fetch(url, {
          method: "GET",
        });

        if (response.ok) {
          const htmlText = await response.text();
          const scriptFound = htmlText.includes(scriptToCheck);

          if (scriptFound) {
            return NextResponse.json(
              { message: "Script found", success: true, url },
              { status: 200 }
            );
          }
        }
      } catch (error) {
        console.error(`Error fetching ${url}:`, error);
      }
    }

    return NextResponse.json(
      { message: "Script not found in any URL combination", success: false },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json(
      { error: "Error occurred during the request" },
      { status: 500 }
    );
  }
}
