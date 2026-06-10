"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createPlan,
  createGroup,
  createPost,
  deleteGroup,
  deletePost,
} from "@/app/(admin)/admin/clients/[id]/plan/actions";

function useSubmit() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const run = (
    e: FormEvent<HTMLFormElement>,
    action: (fd: FormData) => Promise<{ ok: true } | { error: string }>,
  ) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await action(fd);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      form.reset();
      router.refresh();
    });
  };
  return { pending, error, run };
}

export function CreatePlanForm({ clientId }: { clientId: string }) {
  const { pending, error, run } = useSubmit();
  return (
    <form onSubmit={(e) => run(e, (fd) => createPlan(clientId, fd))} noValidate>
      <label className="fld" htmlFor="pl-title">
        عنوان الخطة
      </label>
      <input className="inp" id="pl-title" name="title" placeholder="تقويم المحتوى · يونيو ويوليو 2026" required />
      <label className="fld" htmlFor="pl-period">
        الفترة
      </label>
      <input className="inp" id="pl-period" name="period_label" placeholder="1 يونيو · 1 يوليو 2026" />
      {error ? <div className="err">{error}</div> : null}
      <button className="btn solid" type="submit" disabled={pending}>
        إنشاء الخطة
      </button>
    </form>
  );
}

export function AddGroupForm({ planId, clientId }: { planId: number; clientId: string }) {
  const { pending, error, run } = useSubmit();
  return (
    <div className="adm-add">
      <h4>إضافة مجموعة</h4>
      <form onSubmit={(e) => run(e, (fd) => createGroup(planId, clientId, fd))} noValidate>
        <div className="adm-form-grid">
          <div>
            <label className="fld">الاسم</label>
            <input className="inp" name="name" placeholder="الأسبوع الأول" required />
          </div>
          <div>
            <label className="fld">النوع</label>
            <select className="inp" name="kind" defaultValue="week">
              <option value="week">أسبوع</option>
              <option value="series">سلسلة</option>
            </select>
          </div>
          <div>
            <label className="fld">المدى</label>
            <input className="inp" name="range_label" placeholder="من 1 يونيو إلى 6 يونيو" />
          </div>
          <div>
            <label className="fld">الترتيب</label>
            <input className="inp" name="sort_order" type="number" defaultValue={0} />
          </div>
        </div>
        {error ? <div className="err">{error}</div> : null}
        <button className="btn" type="submit" disabled={pending}>
          إضافة المجموعة
        </button>
      </form>
    </div>
  );
}

export function AddPostForm({
  planId,
  groupId,
  clientId,
}: {
  planId: number;
  groupId: number;
  clientId: string;
}) {
  const { pending, error, run } = useSubmit();
  return (
    <div className="adm-add">
      <h4>إضافة منشور</h4>
      <form onSubmit={(e) => run(e, (fd) => createPost(planId, groupId, clientId, fd))} noValidate>
        <div className="adm-form-grid">
          <div>
            <label className="fld">الرقم (seq)</label>
            <input className="inp" name="seq" type="number" defaultValue={0} />
          </div>
          <div>
            <label className="fld">اليوم</label>
            <input className="inp" name="day_label" placeholder="الإثنين" />
          </div>
          <div>
            <label className="fld">التاريخ</label>
            <input className="inp" name="post_date" placeholder="1 - 6 - 2026" />
          </div>
          <div>
            <label className="fld">الجزء (للسلسلة)</label>
            <input className="inp" name="part_label" placeholder="الجزء الأول" />
          </div>
          <div className="full">
            <label className="fld">الموضوع</label>
            <input className="inp" name="subject" required />
          </div>
          <div>
            <label className="fld">لماذا الآن</label>
            <input className="inp" name="why_now" />
          </div>
          <div>
            <label className="fld">الشكل</label>
            <input className="inp" name="content_form" />
          </div>
          <div className="full">
            <label className="fld">الخطّاف</label>
            <input className="inp" name="hook" required />
          </div>
          <div className="full">
            <label className="fld">نص المنشور (كل سطر فقرة)</label>
            <textarea className="inp" name="body" rows={6} />
          </div>
          <div className="full">
            <label className="fld">الوسوم</label>
            <input className="inp" name="tags" />
          </div>
        </div>
        {error ? <div className="err">{error}</div> : null}
        <button className="btn" type="submit" disabled={pending}>
          إضافة المنشور
        </button>
      </form>
    </div>
  );
}

export function DeleteButton({
  kind,
  id,
  clientId,
  label,
}: {
  kind: "group" | "post";
  id: number;
  clientId: string;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const onClick = () => {
    if (!window.confirm(`حذف ${label}؟`)) return;
    startTransition(async () => {
      const res = kind === "group" ? await deleteGroup(id, clientId) : await deletePost(id, clientId);
      if (!("error" in res)) router.refresh();
    });
  };
  return (
    <button className="logout" type="button" onClick={onClick} disabled={pending}>
      حذف
    </button>
  );
}
