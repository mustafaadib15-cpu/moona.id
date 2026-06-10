"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type Result = { ok: true } | { error: string };

function field(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v.length ? v : null;
}
function intField(formData: FormData, key: string, fallback = 0): number {
  const n = Number(formData.get(key));
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function revalidate(clientId: string) {
  revalidatePath(`/admin/clients/${clientId}/plan`);
  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard");
}

export async function createPlan(clientId: string, formData: FormData): Promise<Result> {
  const title = field(formData, "title");
  if (!title) return { error: "عنوان الخطة مطلوب." };
  const supabase = await createClient();
  const { error } = await supabase.from("content_plans").insert({
    client_id: clientId,
    title,
    period_label: field(formData, "period_label"),
  });
  if (error) return { error: "تعذر إنشاء الخطة." };
  revalidate(clientId);
  return { ok: true };
}

export async function createGroup(
  planId: number,
  clientId: string,
  formData: FormData,
): Promise<Result> {
  const name = field(formData, "name");
  if (!name) return { error: "اسم المجموعة مطلوب." };
  const kind = String(formData.get("kind") ?? "week") === "series" ? "series" : "week";
  const supabase = await createClient();
  const { error } = await supabase.from("content_groups").insert({
    plan_id: planId,
    name,
    kind,
    range_label: field(formData, "range_label"),
    sort_order: intField(formData, "sort_order"),
  });
  if (error) return { error: "تعذر إضافة المجموعة." };
  revalidate(clientId);
  return { ok: true };
}

export async function createPost(
  planId: number,
  groupId: number,
  clientId: string,
  formData: FormData,
): Promise<Result> {
  const subject = field(formData, "subject");
  const hook = field(formData, "hook");
  if (!subject) return { error: "الموضوع مطلوب." };
  if (!hook) return { error: "الخطّاف مطلوب." };

  const body = String(formData.get("body") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const supabase = await createClient();
  const { error } = await supabase.from("posts").insert({
    plan_id: planId,
    group_id: groupId,
    seq: intField(formData, "seq"),
    day_label: field(formData, "day_label"),
    post_date: field(formData, "post_date"),
    subject,
    why_now: field(formData, "why_now"),
    content_form: field(formData, "content_form"),
    hook,
    body,
    tags: field(formData, "tags"),
    part_label: field(formData, "part_label"),
  });
  if (error) return { error: "تعذر إضافة المنشور." };
  revalidate(clientId);
  return { ok: true };
}

export async function deleteGroup(id: number, clientId: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("content_groups").delete().eq("id", id);
  if (error) return { error: "تعذر الحذف." };
  revalidate(clientId);
  return { ok: true };
}

export async function deletePost(id: number, clientId: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { error: "تعذر الحذف." };
  revalidate(clientId);
  return { ok: true };
}
