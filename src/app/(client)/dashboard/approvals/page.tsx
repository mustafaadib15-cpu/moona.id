import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PlanStages } from "@/components/portal/PlanStages";
import { TallyEmbed } from "@/components/portal/TallyEmbed";
import { TALLY_PLAN_FORM_ID, normalizePlanStage } from "@/lib/tally";

export default async function PlanApprovalPage() {
  const supabase = await createClient();
  const { data: account } = await supabase
    .from("client_accounts")
    .select("name, plan_stage")
    .maybeSingle();

  const stage = normalizePlanStage(account?.plan_stage);

  return (
    <div className="view">
      <div className="page-kicker">الخطة</div>
      <h1 className="page-title">خطة المحتوى</h1>
      <p className="page-sub">
        {stage === "plan"
          ? "راجع كل منشور، واعتمده أو اطلب تعديلاً. قراراتك وملاحظاتك تصل الفريق مباشرة."
          : stage === "schedule"
            ? "خطتك معتمدة. فريق مُنى يجهز جدولة النشر الآن."
            : "اكتملت الجدولة. تابع مخرجاتك من صفحة المخرجات."}
      </p>

      <PlanStages stage={stage} />

      {stage === "plan" ? (
        <TallyEmbed formId={TALLY_PLAN_FORM_ID} title="نموذج مراجعة واعتماد خطة المحتوى" />
      ) : stage === "schedule" ? (
        <div className="panel">
          <h3>الخطة معتمدة</h3>
          <p className="page-sub page-sub--tight">
            وصلنا اعتمادك وملاحظاتك كاملة. نعمل الآن على جدولة المحتوى، وستنتقل المتابعة إلى
            صفحة المخرجات فور الجهوز.
          </p>
        </div>
      ) : (
        <div className="panel">
          <h3>المتابعة في المخرجات</h3>
          <p className="page-sub">كل ما يتم إنتاجه وتسليمه تجده في صفحة المخرجات.</p>
          <Link className="dview" href="/dashboard/deliverables">
            الانتقال إلى المخرجات
          </Link>
        </div>
      )}
    </div>
  );
}
