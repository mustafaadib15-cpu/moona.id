"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STATUSES = ["active", "paused", "completed"] as const;
type Status = (typeof STATUSES)[number];

function field(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v.length ? v : null;
}

function accountPayload(formData: FormData) {
  const statusRaw = String(formData.get("status") ?? "active");
  const status: Status = (STATUSES as readonly string[]).includes(statusRaw)
    ? (statusRaw as Status)
    : "active";
  return {
    company: field(formData, "company"),
    role_title: field(formData, "role_title"),
    plan_label: field(formData, "plan_label"),
    phase_label: field(formData, "phase_label"),
    next_label: field(formData, "next_label"),
    status,
  };
}

export async function createClientAccount(
  formData: FormData,
): Promise<{ error: string } | { id: string }> {
  const name = field(formData, "name");
  if (!name) return { error: "الاسم مطلوب." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_accounts")
    .insert({ name, ...accountPayload(formData) })
    .select("id")
    .single();

  if (error || !data) return { error: "تعذر إنشاء العميل." };
  revalidatePath("/admin");
  return { id: data.id };
}

export async function updateClientAccount(
  id: string,
  formData: FormData,
): Promise<{ error: string } | { ok: true }> {
  const name = field(formData, "name");
  if (!name) return { error: "الاسم مطلوب." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("client_accounts")
    .update({ name, ...accountPayload(formData) })
    .eq("id", id);

  if (error) return { error: "تعذر حفظ التغييرات." };
  revalidatePath(`/admin/clients/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}

// Invite a client by email (Supabase creates the user + emails a set-password
// link to /confirm), then link the new profile to this client account.
export async function inviteClient(
  clientId: string,
  formData: FormData,
): Promise<{ error: string } | { ok: true; message: string }> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { error: "البريد الإلكتروني مطلوب." };

  const admin = createAdminClient();
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const redirectTo = `${proto}://${host}/confirm`;

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });
  if (error || !data.user) {
    return { error: `تعذر إرسال الدعوة. ${error?.message ?? ""}`.trim() };
  }

  // The handle_new_user trigger created the profile; link it to this account.
  await new Promise((r) => setTimeout(r, 500));
  const { error: linkErr } = await admin
    .from("profiles")
    .update({ client_id: clientId, role: "client" })
    .eq("id", data.user.id);
  if (linkErr) {
    return { error: "أُرسلت الدعوة لكن تعذر ربط الحساب." };
  }

  revalidatePath(`/admin/clients/${clientId}`);
  return { ok: true, message: "أُرسلت الدعوة وتم ربط الحساب." };
}
