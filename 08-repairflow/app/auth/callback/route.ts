import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeAuthRedirect } from "@/lib/auth/redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = safeAuthRedirect(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL(next, url.origin));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await supabase.rpc("bootstrap_personal_organization");
      return NextResponse.redirect(new URL(next, url.origin));
    }

    const signInUrl = new URL("/sign-in", url.origin);
    signInUrl.searchParams.set("error", "expired");
    signInUrl.searchParams.set("next", next);
    return NextResponse.redirect(signInUrl);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      await supabase.rpc("bootstrap_personal_organization");
      return NextResponse.redirect(new URL(next, url.origin));
    }

    const signInUrl = new URL("/sign-in", url.origin);
    signInUrl.searchParams.set("error", "expired");
    signInUrl.searchParams.set("next", next);
    return NextResponse.redirect(signInUrl);
  }

  const signInUrl = new URL("/sign-in", url.origin);
  signInUrl.searchParams.set("error", "missing_code");
  signInUrl.searchParams.set("next", next);
  return NextResponse.redirect(signInUrl);
}
