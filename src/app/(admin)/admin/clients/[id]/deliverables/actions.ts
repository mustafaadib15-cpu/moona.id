"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type Result = { ok: true } | { error: string };

const STATUSES = ["delivered", "in_review", "upcoming"] as const;
type DStatus = (typeof STATUSES)[number];

const BUCKET = "deliverables";

function field(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v.length ? v : null;
}
function statusField(formData: FormData): DStatus {
  const raw = String(formData.get("status") ?? "upcoming");
  return (STATUSES as readonly string[]).includes(raw) ? (raw as DStatus) : "upcoming";
}
function revalidate(clientId: string) {
  revalidatePath(`/admin/clients/${clientId}/deliverables`);
  revalidatePath("/dashboard/deliverables");
  revalidatePath("/dashboard");
}

// Upload an optional file to Storage (admin/service client) and return a public
// URL. Falls back to a manually-entered URL field.
async function resolveFileUrl(clientId: string, formData: FormData): Promise<string | null> {
  const manual = field(formData, "file_url");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return manual;

  const admin = createAdminClient();
  await admin.storage.createBucket(BUCKET, { public: true }).catch(() => undefined);
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${clientId}/${Date.now()}-${safeName}`;
  const { error } = await admin.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (error) return manual;
  return admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function createDeliverable(
  clientId: string,
  formData: FormData,
): Promise<Result> {
  const title = field(formData, "title");
  if (!title) return { error: "العنوان مطلوب." };

  const fileUrl = await resolveFileUrl(clientId, formData);
  const supabase = await createClient();
  const { error } = await supabase.from("deliverables").insert({
    client_id: clientId,
    title,
    description: field(formData, "description"),
    status: statusField(formData),
    date_label: field(formData, "date_label"),
    file_url: fileUrl,
    sort_order: Number(formData.get("sort_order")) || 0,
  });
  if (error) return { error: "تعذر إضافة المخرج." };
  revalidate(clientId);
  return { ok: true };
}

export async function updateDeliverable(
  id: number,
  clientId: string,
  formData: FormData,
): Promise<Result> {
  const title = field(formData, "title");
  if (!title) return { error: "العنوان مطلوب." };

  const fileUrl = await resolveFileUrl(clientId, formData);
  const supabase = await createClient();
  const base = {
    title,
    description: field(formData, "description"),
    status: statusField(formData),
    date_label: field(formData, "date_label"),
    sort_order: Number(formData.get("sort_order")) || 0,
  };

  // Only overwrite file_url when a new file/url was provided.
  const { error } = await supabase
    .from("deliverables")
    .update(fileUrl ? { ...base, file_url: fileUrl } : base)
    .eq("id", id);
  if (error) return { error: "تعذر حفظ التغييرات." };
  revalidate(clientId);
  return { ok: true };
}

export async function deleteDeliverable(id: number, clientId: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("deliverables").delete().eq("id", id);
  if (error) return { error: "تعذر الحذف." };
  revalidate(clientId);
  return { ok: true };
}
