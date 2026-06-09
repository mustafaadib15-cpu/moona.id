"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { decidePost, saveComment } from "@/app/(client)/dashboard/approvals/actions";

export type Decision = "pending" | "approved" | "revision";

export interface ApprovalPost {
  id: number;
  seq: number;
  dayLabel: string;
  postDate: string;
  subject: string;
  whyNow: string;
  contentForm: string;
  hook: string;
  body: string[];
  tags: string;
  partLabel: string | null;
  decision: Decision;
  comment: string;
}

export interface ApprovalGroup {
  id: number;
  name: string;
  kind: "week" | "series";
  posts: ApprovalPost[];
}

interface ApprovalsViewProps {
  planTitle: string;
  planSub: string;
  clientName: string;
  groups: ApprovalGroup[];
  total: number;
}

const STATUS_LABEL: Record<Decision, string> = {
  approved: "معتمد",
  revision: "يحتاج تعديل",
  pending: "بانتظار المراجعة",
};

// Body lines starting with "- " or "N- " render with the indented item style.
function isItem(line: string): boolean {
  return /^\s*-\s/.test(line) || /^\d+-\s/.test(line);
}

export function ApprovalsView({
  planTitle,
  planSub,
  clientName,
  groups,
  total,
}: ApprovalsViewProps) {
  const allPosts = useMemo(() => groups.flatMap((g) => g.posts), [groups]);

  const [decisions, setDecisions] = useState<Record<number, Decision>>(() =>
    Object.fromEntries(allPosts.map((p) => [p.id, p.decision])),
  );
  const [comments, setComments] = useState<Record<number, string>>(() =>
    Object.fromEntries(allPosts.map((p) => [p.id, p.comment])),
  );
  const savedComments = useRef<Record<number, string>>(
    Object.fromEntries(allPosts.map((p) => [p.id, p.comment])),
  );
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [, startTransition] = useTransition();
  const [toast, setToast] = useState("");

  const decided = Object.values(decisions).filter((d) => d !== "pending").length;
  const fill = total ? (decided / total) * 100 : 0;

  function toggleOpen(id: number) {
    setOpen((o) => ({ ...o, [id]: !o[id] }));
  }

  function choose(id: number, act: "approved" | "revision") {
    const prev = decisions[id];
    const next: Decision = prev === act ? "pending" : act;
    setDecisions((d) => ({ ...d, [id]: next })); // optimistic
    startTransition(async () => {
      const result = await decidePost(id, next);
      if ("error" in result) {
        setDecisions((d) => ({ ...d, [id]: prev })); // revert on failure
        showToast(result.error);
      }
    });
  }

  function commitComment(id: number) {
    const value = comments[id] ?? "";
    if (value.trim() === (savedComments.current[id] ?? "").trim()) return;
    savedComments.current[id] = value;
    startTransition(async () => {
      await saveComment(id, value);
    });
  }

  function buildReport(): string {
    let out = `ملاحظات ${clientName} — ${planTitle}\nMoona · 2026\n`;
    for (const g of groups) {
      out += `\n=== ${g.name} ===\n`;
      for (const po of g.posts) {
        const note = (comments[po.id] ?? "").trim();
        out += `\n${String(po.seq).padStart(2, "0")} (${po.postDate})\n`;
        out += `الموضوع: ${po.subject}\n`;
        out += `الحالة: ${STATUS_LABEL[decisions[po.id]]}\n`;
        if (note) out += `ملاحظة: ${note}\n`;
      }
    }
    return out;
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  async function copyNotes() {
    try {
      await navigator.clipboard.writeText(buildReport());
      showToast("نُسخت الملاحظات");
    } catch {
      showToast("تعذر النسخ");
    }
  }

  function downloadNotes() {
    const blob = new Blob([buildReport()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ملاحظات.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="view">
      <div className="page-kicker">الموافقة على المحتوى</div>
      <h1 className="page-title">{planTitle}</h1>
      <p className="page-sub">{planSub}</p>

      <div className="appr-bar">
        <div className="progress">
          <span>
            تمت مراجعة <b>{decided}</b> من {total}
          </span>
          <span className="track">
            {/* computed progress width — the one inline style the bar needs */}
            <i style={{ width: `${fill}%` }} />
          </span>
        </div>
        <div className="appr-actions">
          <button className="btn" type="button" onClick={copyNotes}>
            نسخ الملاحظات
          </button>
          <button className="btn solid" type="button" onClick={downloadNotes}>
            تنزيل الملاحظات
          </button>
        </div>
      </div>

      {groups.map((g) => (
        <div className={`grp${g.kind === "series" ? " series" : ""}`} key={g.id}>
          <div className="grp-head">
            <div className="grp-k">{g.kind === "series" ? "سلسلة مترابطة" : "أسبوع"}</div>
            <div className="grp-n">{g.name}</div>
          </div>

          {g.posts.map((po) => {
            const dec = decisions[po.id];
            const stateClass =
              dec === "approved" ? "is-approve" : dec === "revision" ? "is-revise" : "";
            return (
              <article
                className={`acard ${stateClass}${open[po.id] ? " open" : ""}`}
                key={po.id}
              >
                <div
                  className="ahead"
                  role="button"
                  tabIndex={0}
                  aria-expanded={!!open[po.id]}
                  onClick={() => toggleOpen(po.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleOpen(po.id);
                    }
                  }}
                >
                  <span className="anum">{String(po.seq).padStart(2, "0")}</span>
                  <span className="adate">
                    {po.dayLabel} · {po.postDate}
                  </span>
                  <span className="asubj">{po.subject}</span>
                  {po.partLabel ? <span className="apart">{po.partLabel}</span> : null}
                  <span className="astatus">{STATUS_LABEL[dec]}</span>
                  <span className="acaret">▾</span>
                </div>

                <div className="abody">
                  <div className="meta-row">
                    {po.whyNow ? (
                      <span className="meta">
                        <b>لماذا الآن</b>
                        {po.whyNow}
                      </span>
                    ) : null}
                    {po.contentForm ? (
                      <span className="meta">
                        <b>الشكل</b>
                        {po.contentForm}
                      </span>
                    ) : null}
                  </div>

                  <span className="fl">الخطّاف</span>
                  <p className="hook">{po.hook}</p>

                  <span className="fl">نص المنشور</span>
                  <div className="btext">
                    {po.body.map((para, i) => (
                      <p className={isItem(para) ? "item" : ""} key={i}>
                        {para}
                      </p>
                    ))}
                  </div>

                  {po.tags ? (
                    <>
                      <span className="fl">الوسوم</span>
                      <p className="tags">{po.tags}</p>
                    </>
                  ) : null}

                  <div className="review">
                    <div className="chips">
                      <button
                        className="chip"
                        type="button"
                        data-act="approve"
                        onClick={() => choose(po.id, "approved")}
                      >
                        موافق للنشر
                      </button>
                      <button
                        className="chip"
                        type="button"
                        data-act="revise"
                        onClick={() => choose(po.id, "revision")}
                      >
                        يحتاج تعديل
                      </button>
                    </div>
                    <textarea
                      className="cmt"
                      rows={2}
                      placeholder="اكتب ملاحظتك أو موافقتك هنا"
                      value={comments[po.id] ?? ""}
                      onChange={(e) =>
                        setComments((c) => ({ ...c, [po.id]: e.target.value }))
                      }
                      onBlur={() => commitComment(po.id)}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ))}

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}
