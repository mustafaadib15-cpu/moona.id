import { type NextRequest, NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Landing point for Supabase email links (invite / recovery). Establishes the
// session, then sends the user to set a password. The redirect target of the
// email must be allow-listed in Supabase Auth -> URL Configuration.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/set-password`);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}/set-password`);
  }

  return NextResponse.redirect(`${origin}/portal?error=invalid_link`);
}

// POST target of the /invite interstitial page. The one-time token is only
// consumed here, on an explicit user action, so email link scanners that
// prefetch GET URLs cannot burn it.
export async function POST(request: NextRequest) {
  const { origin } = new URL(request.url);
  const form = await request.formData();
  const tokenHash = String(form.get("token_hash") ?? "");
  const type = String(form.get("type") ?? "invite") as EmailOtpType;

  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}/set-password`, 303);
  }
  return NextResponse.redirect(`${origin}/portal?error=invalid_link`, 303);
}
