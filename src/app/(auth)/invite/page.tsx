import { redirect } from "next/navigation";

// Interstitial for email invite links. Outlook and similar email scanners
// prefetch every URL in an email, which would consume a one-time invite token
// before the recipient clicks it. Loading this page does NOT touch the token;
// verification happens only when the user submits the form (POST /confirm),
// which scanners do not do.
export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash: tokenHash, type } = await searchParams;
  if (!tokenHash) redirect("/portal");

  return (
    <section className="login">
      <div className="login-card">
        <div className="login-kicker">Client Portal</div>
        <h1 className="login-title">أهلاً بك في مُنى</h1>
        <p className="page-sub">
          تمت دعوتك إلى بوابة العملاء. اضغط الزر أدناه لإكمال إنشاء حسابك وتعيين كلمة
          المرور.
        </p>
        <form method="POST" action="/confirm">
          <input type="hidden" name="token_hash" value={tokenHash} />
          <input type="hidden" name="type" value={type ?? "invite"} />
          <button className="btn solid full" type="submit">
            متابعة إنشاء الحساب
          </button>
        </form>
      </div>
    </section>
  );
}
