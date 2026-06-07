"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

export type SignInResult = { error: string };

export async function signIn(values: LoginInput): Promise<SignInResult | void> {
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
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
  }

  // Role-based routing is wired in Phase 1; root resolves the destination.
  redirect("/");
}
