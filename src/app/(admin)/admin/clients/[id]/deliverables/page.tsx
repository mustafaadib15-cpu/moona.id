import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientTabs } from "@/components/admin/ClientTabs";
import {
  AddDeliverableForm,
  DeleteDeliverableButton,
} from "@/components/admin/DeliverableForms";

const LABEL: Record<string, string> = {
  delivered: "تم التسليم",
  in_review: "بانتظار المراجعة",
  upcoming: "قادم",
};
const CLS: Record<string, string> = {
  delivered: "done",
  in_review: "review",
  upcoming: "soon",
};

export default async function AdminDeliverablesPage({
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

  const { data: deliverables } = await supabase
    .from("deliverables")
    .select("id, title, description, status, date_label, file_url")
    .eq("client_id", id)
    .order("sort_order");

  return (
    <div className="view">
      <div className="page-kicker">{account.name}</div>
      <h1 className="page-title">المخرجات</h1>
      <ClientTabs id={id} />

      <AddDeliverableForm clientId={id} />

      {!deliverables || deliverables.length === 0 ? (
        <div className="empty">لا توجد مخرجات بعد.</div>
      ) : (
        <div className="deliv">
          {deliverables.map((d) => (
            <div className="ditem" key={d.id}>
              <div>
                <div className="dt">{d.title}</div>
                {d.description ? <div className="dd">{d.description}</div> : null}
              </div>
              <div className="dmeta">
                <span className={`chipx ${CLS[d.status] ?? ""}`}>
                  {LABEL[d.status] ?? d.status}
                </span>
                {d.file_url ? (
                  <a className="dview" href={d.file_url} target="_blank" rel="noopener noreferrer">
                    ملف
                  </a>
                ) : null}
                <DeleteDeliverableButton id={d.id} clientId={id} label={d.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
