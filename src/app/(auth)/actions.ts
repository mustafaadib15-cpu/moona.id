"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

export type SignInResult = { error: string } | { redirectTo: string };

// Destination for a role after a successful sign-in.
function homeForRole(role: string | null | undefined): string {
  return role === "admin" ? "/admin" : "/dashboard";
}

export async function signIn(values: LoginInput): Promise<SignInResult> {
  // Never trust the client: re-validate on the server.
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "تحقق من المدخلات." };
  }

  if (!isSupabaseConfigured()) {
    return {
      error: "لم يتم ربط قاعدة البيانات بعد. أضف بيانات Supabase للمتابعة.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // Cookies are set on this action's response; the client navigates so the
  // redirect happens reliably (an imperatively-called redirect() can be
  // swallowed by the action dispatcher).
  return { redirectTo: homeForRole((profile as { role?: string } | null)?.role) };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/portal");
}
