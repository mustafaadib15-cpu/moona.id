// Tally integration config for the plan approval flow.
// The plan review form lives in Moona's Tally account; submissions stay in Tally.

export const TALLY_PLAN_FORM_ID = "b5EbBo";

// Maps a Tally form to the client account whose plan it approves.
// When a new client gets their own review form, add it here.
export const TALLY_FORM_CLIENTS: Record<string, string> = {
  b5EbBo: "af275886-56be-41a1-ad2b-1d8d694ab96e",
};

export type PlanStage = "plan" | "schedule" | "deliverables";

export const PLAN_STAGES: { key: PlanStage; label: string; sub: string }[] = [
  { key: "plan", label: "الخطة", sub: "مراجعة واعتماد المحتوى" },
  { key: "schedule", label: "الجدولة", sub: "فريق مُنى يجدول النشر" },
  { key: "deliverables", label: "التسليمات", sub: "متابعة المخرجات" },
];

export function normalizePlanStage(value: string | null | undefined): PlanStage {
  return value === "schedule" || value === "deliverables" ? value : "plan";
}
