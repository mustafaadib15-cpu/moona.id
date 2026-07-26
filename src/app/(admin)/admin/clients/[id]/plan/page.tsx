import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientTabs } from "@/components/admin/ClientTabs";
import { PlanStages } from "@/components/portal/PlanStages";
import { TallyEmbed } from "@/components/portal/TallyEmbed";
import { StageControl } from "@/components/admin/StageControl";
import { PLAN_STAGES, TALLY_PLAN_FORM_ID, normalizePlanStage } from "@/lib/tally";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: account } = await supabase
    .from("client_accounts")
    .select("name, plan_stage")
    .eq("id", id)
    .maybeSingle();
  if (!account) notFound();

  const stage = normalizePlanStage(account.plan_stage);
  const stageLabel = PLAN_STAGES.find((s) => s.key === stage)?.label ?? "";

  return (
    <div className="view">
      <div className="page-kicker">{account.name}</div>
      <h1 className="page-title">الخطة</h1>
      <ClientTabs id={id} />

      <p className="page-sub">
        يعتمد العميل خطة المحتوى من النموذج أدناه. عند إرسال اعتماده تنتقل المرحلة تلقائياً إلى
        الجدولة، ويمكن تعديل المرحلة يدوياً من هنا عند الحاجة.
      </p>

      <PlanStages stage={stage} />

      <div className="panel">
        <div className="adm-bar">
          <h3>المرحلة الحالية: {stageLabel}</h3>
          <span className="adm-bar__spacer" />
          <StageControl clientId={id} stage={stage} />
        </div>
        <p className="page-sub page-sub--tight">
          تصل قرارات العميل وملاحظاته إلى حساب Tally الخاص بفريق مُنى، منشوراً بمنشور.
        </p>
      </div>

      <div className="divider" />

      <TallyEmbed formId={TALLY_PLAN_FORM_ID} title="نموذج مراجعة واعتماد خطة المحتوى" />
    </div>
  );
}
