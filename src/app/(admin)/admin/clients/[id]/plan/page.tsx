import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientTabs } from "@/components/admin/ClientTabs";
import {
  CreatePlanForm,
  AddGroupForm,
  AddPostForm,
  DeleteButton,
} from "@/components/admin/PlanForms";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: account } = await supabase
    .from("client_accounts")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  if (!account) notFound();

  const { data: plan } = await supabase
    .from("content_plans")
    .select("id, title, period_label")
    .eq("client_id", id)
    .order("id")
    .limit(1)
    .maybeSingle();

  const groups = plan
    ? (
        await supabase
          .from("content_groups")
          .select("id, name, kind, range_label, sort_order")
          .eq("plan_id", plan.id)
          .order("sort_order")
      ).data ?? []
    : [];
  const posts = plan
    ? (
        await supabase
          .from("posts")
          .select("id, group_id, seq, subject, part_label")
          .eq("plan_id", plan.id)
          .order("seq")
      ).data ?? []
    : [];

  return (
    <div className="view">
      <div className="page-kicker">{account.name}</div>
      <h1 className="page-title">الخطة</h1>
      <ClientTabs id={id} />

      {!plan ? (
        <div className="panel">
          <h3>إنشاء خطة المحتوى</h3>
          <CreatePlanForm clientId={id} />
        </div>
      ) : (
        <>
          <p className="page-sub">
            {plan.title}
            {plan.period_label ? ` · ${plan.period_label}` : ""}
          </p>

          <AddGroupForm planId={plan.id} clientId={id} />

          {groups.map((g) => (
            <div className="panel" key={g.id}>
              <div className="adm-bar">
                <h3>{g.name}</h3>
                <span className="adm-bar__spacer" />
                <span className="chipx">{g.kind === "series" ? "سلسلة" : "أسبوع"}</span>
                <DeleteButton kind="group" id={g.id} clientId={id} label={g.name} />
              </div>

              {posts
                .filter((p) => p.group_id === g.id)
                .map((p) => (
                  <div className="ditem" key={p.id}>
                    <div>
                      <div className="dt">
                        {String(p.seq).padStart(2, "0")} · {p.subject}
                      </div>
                      {p.part_label ? <div className="dd">{p.part_label}</div> : null}
                    </div>
                    <div className="dmeta">
                      <DeleteButton kind="post" id={p.id} clientId={id} label={p.subject} />
                    </div>
                  </div>
                ))}

              <div className="divider" />
              <AddPostForm planId={plan.id} groupId={g.id} clientId={id} />
            </div>
          ))}
        </>
      )}
    </div>
  );
}
