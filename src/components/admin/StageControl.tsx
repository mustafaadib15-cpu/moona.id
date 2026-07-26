"use client";

import { useState, useTransition } from "react";
import { setPlanStage } from "@/app/(admin)/admin/clients/[id]/plan/actions";
import { PLAN_STAGES, type PlanStage } from "@/lib/tally";

// Admin-side manual stage switcher: مسودة الخطة تُعتمد عبر النموذج، وهذه
// الأزرار لتصحيح المرحلة أو تقديمها يدوياً.
export function StageControl({ clientId, stage }: { clientId: string; stage: PlanStage }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const move = (next: PlanStage) => {
    const formData = new FormData();
    formData.set("stage", next);
    startTransition(async () => {
      const res = await setPlanStage(clientId, formData);
      setError("error" in res ? res.error : null);
    });
  };

  return (
    <div className="stage-control">
      {PLAN_STAGES.map((s) => (
        <button
          key={s.key}
          type="button"
          className={`chipx stage-chip${s.key === stage ? " done" : ""}`}
          disabled={pending || s.key === stage}
          onClick={() => move(s.key)}
        >
          {s.label}
        </button>
      ))}
      {error ? <span className="stage-error">{error}</span> : null}
    </div>
  );
}
