import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function signOut(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  return NextResponse.redirect(new URL("/sign-in", request.url), { status: 303 });
}

export const GET = signOut;
export const POST = signOut;
