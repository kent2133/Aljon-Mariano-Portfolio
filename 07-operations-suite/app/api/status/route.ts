import { NextResponse } from "next/server";
import { cloudPersistenceEnabled } from "@/lib/store";

export function GET() {
  return NextResponse.json({
    service: "Aljon Operations Suite",
    status: "operational",
    persistence: cloudPersistenceEnabled() ? "Supabase Postgres" : "Fixture mode",
    timestamp: new Date().toISOString(),
  });
}
