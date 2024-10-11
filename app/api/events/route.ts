/*
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Configura Supabase
const supabase = createClient(
  process.env.NEXT_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_KEY!
);

// Funzione per la gestione di POST request
export async function POST(request: Request) {
  try {
    // Estrai i dati inviati nella richiesta
    const body = await request.json();

    // Valida i dati principali (website_id, tipo di evento, ecc.)
    const {
      websiteId,
      domain,
      visitorId,
      sessionId,
      type,
      url,
      referrer,
      timestamp,
    } = body;

    if (!websiteId || !type || !timestamp) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Salva l'evento nel database
    const { data, error } = await supabase.from("events").insert([
      {
        website_id: websiteId,
        visitor_id: visitorId,
        session_id: sessionId,
        type,
        url,
        referrer,
        timestamp,
      },
    ]);

    if (error) {
      throw error;
    }

    // Risposta in caso di successo
    return NextResponse.json(
      { message: "Event recorded successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving event:", error);
    return NextResponse.json(
      { error: "Failed to record event" },
      { status: 500 }
    );
  }
}
*/

import { NextResponse } from "next/server";
//import { createClient } from "@/utils/supabase/server";

//const supabase = createClient();

// create a temporary dummy endpoint

export async function GET() {
  return NextResponse.json({ message: "Hello World" });
}
