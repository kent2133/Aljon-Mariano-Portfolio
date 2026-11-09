import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    product: "RepairFlow",
    status: "operational",
    database: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "demo-mode",
  });
}
