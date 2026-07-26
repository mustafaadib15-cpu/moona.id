import { PLAN_STAGES, type PlanStage } from "@/lib/tally";

// Three-step progress strip for the plan flow: الخطة -> الجدولة -> التسليمات.
// Server-safe: pure markup, no state.
export function PlanStages({ stage }: { stage: PlanStage }) {
  const activeIndex = PLAN_STAGES.findIndex((s) => s.key === stage);
  return (
    <ol className="plan-steps" aria-label="مراحل الخطة">
      {PLAN_STAGES.map((s, i) => {
        const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "next";
        return (
          <li key={s.key} className={`plan-step ${state}`} aria-current={state === "active" ? "step" : undefined}>
            <span className="plan-step__num">{i + 1}</span>
            <span className="plan-step__text">
              <span className="plan-step__label">{s.label}</span>
              <span className="plan-step__sub">{s.sub}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
