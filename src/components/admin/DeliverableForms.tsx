"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createDeliverable,
  deleteDeliverable,
} from "@/app/(admin)/admin/clients/[id]/deliverables/actions";

const STATUS: ReadonlyArray<[string, string]> = [
  ["upcoming", "قادم"],
  ["in_review", "بانتظار المراجعة"],
  ["delivered", "تم التسليم"],
];

export function AddDeliverableForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await createDeliverable(clientId, fd);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      form.reset();
      router.refresh();
    });
  };

  return (
    <div className="adm-add">
      <h4>إضافة مخرج</h4>
      <form onSubmit={onSubmit} noValidate>
        <div className="adm-form-grid">
          <div className="full">
            <label className="fld">العنوان</label>
            <input className="inp" name="title" aria-label="العنوان" required />
          </div>
          <div className="full">
            <label className="fld">الوصف</label>
            <input className="inp" name="description" aria-label="الوصف" />
          </div>
          <div>
            <label className="fld">الحالة</label>
            <select className="inp" name="status" defaultValue="upcoming" aria-label="الحالة">
              {STATUS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="fld">التاريخ</label>
            <input className="inp" name="date_label" aria-label="التاريخ" placeholder="مايو 2026" />
          </div>
          <div>
            <label className="fld">الترتيب</label>
            <input className="inp" name="sort_order" type="number" aria-label="الترتيب" defaultValue={0} />
          </div>
          <div>
            <label className="fld">ملف (اختياري)</label>
            <input className="inp" name="file" type="file" aria-label="ملف" />
          </div>
        </div>
        {error ? <div className="err">{error}</div> : null}
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "جارٍ الحفظ" : "إضافة"}
        </button>
      </form>
    </div>
  );
}

export function DeleteDeliverableButton({
  id,
  clientId,
  label,
}: {
  id: number;
  clientId: string;
  label: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const onClick = () => {
    if (!window.confirm(`حذف ${label}؟`)) return;
    startTransition(async () => {
      const res = await deleteDeliverable(id, clientId);
      if (!("error" in res)) router.refresh();
    });
  };
  return (
    <button className="logout" type="button" onClick={onClick} disabled={pending}>
      حذف
    </button>
  );
}
