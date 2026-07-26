import { createHmac, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TALLY_FORM_CLIENTS } from "@/lib/tally";

// Tally calls this endpoint when the client submits the plan review form.
// It verifies Tally's signature and moves that client's stage from
// 'plan' to 'schedule'. Configure in Tally: form -> Integrations -> Webhooks,
// with the signing secret stored in TALLY_SIGNING_SECRET (Vercel env).

function isValidSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.TALLY_SIGNING_SECRET ?? "";
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  if (!isValidSignature(rawBody, request.headers.get("tally-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { eventType?: string; data?: { formId?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (payload.eventType !== "FORM_RESPONSE") {
    return NextResponse.json({ ok: true, ignored: "event" });
  }

  const formId = payload.data?.formId ?? "";
  const clientId = TALLY_FORM_CLIENTS[formId];
  if (!clientId) {
    return NextResponse.json({ ok: true, ignored: "form" });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("client_accounts")
    .update({ plan_stage: "schedule" })
    .eq("id", clientId)
    .eq("plan_stage", "plan");
  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  revalidatePath(`/admin/clients/${clientId}/plan`);
  revalidatePath("/dashboard/approvals");
  revalidatePath("/dashboard");
  return NextResponse.json({ ok: true });
}
