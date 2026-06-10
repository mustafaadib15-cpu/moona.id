import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientTabs } from "@/components/admin/ClientTabs";

const DEC_LABEL: Record<string, string> = {
  approved: "معتمد",
  revision: "يحتاج تعديل",
  pending: "بانتظار المراجعة",
};
const DEC_CLASS: Record<string, string> = {
  approved: "done",
  revision: "review",
  pending: "soon",
};

export default async function FeedbackPage({
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
    .select("id")
    .eq("client_id", id)
    .order("id")
    .limit(1)
    .maybeSingle();

  const posts = plan
    ? (
        await supabase
          .from("posts")
          .select("id, seq, subject, decision")
          .eq("plan_id", plan.id)
          .order("seq")
      ).data ?? []
    : [];

  const postIds = posts.map((p) => p.id);
  const comments =
    postIds.length > 0
      ? (
          await supabase
            .from("post_comments")
            .select("post_id, author_role, body, created_at")
            .in("post_id", postIds)
            .order("created_at")
        ).data ?? []
      : [];

  return (
    <div className="view">
      <div className="page-kicker">{account.name}</div>
      <h1 className="page-title">الملاحظات</h1>
      <ClientTabs id={id} />
      <p className="page-sub">قرارات العميل وملاحظاته على كل منشور.</p>

      {posts.length === 0 ? (
        <div className="empty">لا توجد منشورات بعد.</div>
      ) : (
        posts.map((p) => {
          const postComments = comments.filter((c) => c.post_id === p.id);
          return (
            <div className="fb-post" key={p.id}>
              <div className="fb-post__head">
                <span className="fb-post__seq">{String(p.seq).padStart(2, "0")}</span>
                <span className="fb-post__subject">{p.subject}</span>
                <span className={`chipx ${DEC_CLASS[p.decision] ?? ""}`}>
                  {DEC_LABEL[p.decision] ?? p.decision}
                </span>
              </div>
              {postComments.length > 0 ? (
                postComments.map((c, i) => (
                  <div className="fb-comment" key={i}>
                    <span className="who">{c.author_role === "admin" ? "مُنى" : "العميل"}</span>
                    {c.body}
                  </div>
                ))
              ) : (
                <div className="fb-comment">
                  <span className="who">—</span>لا ملاحظات
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
