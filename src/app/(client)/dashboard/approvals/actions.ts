"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { error: string };

const DECISIONS = ["pending", "approved", "revision"] as const;
type Decision = (typeof DECISIONS)[number];

// Client approve / request-edit. Writes ONLY decision-related columns, even
// though RLS would permit a broader update — the source-of-truth restriction
// lives here (per DATABASE_SCHEMA.md).
export async function decidePost(
  postId: number,
  decision: Decision,
): Promise<ActionResult> {
  if (!DECISIONS.includes(decision)) return { error: "قرار غير صالح." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "انتهت الجلسة." };

  const { error } = await supabase
    .from("posts")
    .update({
      decision,
      decided_at: decision === "pending" ? null : new Date().toISOString(),
      decided_by: decision === "pending" ? null : user.id,
    })
    .eq("id", postId);

  if (error) return { error: "تعذر حفظ القرار." };

  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard");
  return { ok: true };
}

// Insert a client note on a post (kept as a thread; the UI shows the latest).
export async function saveComment(
  postId: number,
  body: string,
): Promise<ActionResult> {
  const trimmed = body.trim();
  if (!trimmed) return { ok: true };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "انتهت الجلسة." };

  const { error } = await supabase.from("post_comments").insert({
    post_id: postId,
    author_id: user.id,
    author_role: "client",
    body: trimmed,
  });

  if (error) return { error: "تعذر حفظ الملاحظة." };

  revalidatePath("/dashboard/approvals");
  return { ok: true };
}
