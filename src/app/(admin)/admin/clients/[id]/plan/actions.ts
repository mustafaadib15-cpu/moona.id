"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizePlanStage } from "@/lib/tally";

export type Result = { ok: true } | { error: string };

// Manual override for the plan stage (the Tally webhook moves plan -> schedule
// automatically; admins can correct or advance the stage from here).
export async function setPlanStage(clientId: string, formData: FormData): Promise<Result> {
  const stage = normalizePlanStage(String(formData.get("stage") ?? ""));
  const supabase = await createClient();
  const { error } = await supabase
    .from("client_accounts")
    .update({ plan_stage: stage })
    .eq("id", clientId);
  if (error) return { error: "تعذر تحديث المرحلة." };
  revalidatePath(`/admin/clients/${clientId}/plan`);
  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard");
  return { ok: true };
}
