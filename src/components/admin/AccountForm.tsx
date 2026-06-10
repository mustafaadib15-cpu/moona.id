"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  createClientAccount,
  updateClientAccount,
} from "@/app/(admin)/admin/actions";

interface AccountDefaults {
  name?: string | null;
  company?: string | null;
  role_title?: string | null;
  plan_label?: string | null;
  phase_label?: string | null;
  next_label?: string | null;
  status?: string | null;
}

interface AccountFormProps {
  mode: "create" | "edit";
  clientId?: string;
  account?: AccountDefaults;
}

const STATUS: ReadonlyArray<[string, string]> = [
  ["active", "نشط"],
  ["paused", "متوقف"],
  ["completed", "مكتمل"],
];

export function AccountForm({ mode, clientId, account }: AccountFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaved("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createClientAccount(formData)
          : await updateClientAccount(clientId as string, formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      if ("id" in result) {
        window.location.assign(`/admin/clients/${result.id}`);
        return;
      }
      setSaved("تم حفظ التغييرات.");
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="adm-form-grid">
        <div className="full">
          <label className="fld" htmlFor="ac-name">
            الاسم
          </label>
          <input className="inp" id="ac-name" name="name" defaultValue={account?.name ?? ""} required />
        </div>
        <div>
          <label className="fld" htmlFor="ac-company">
            الجهة
          </label>
          <input className="inp" id="ac-company" name="company" defaultValue={account?.company ?? ""} />
        </div>
        <div>
          <label className="fld" htmlFor="ac-role">
            المنصب
          </label>
          <input className="inp" id="ac-role" name="role_title" defaultValue={account?.role_title ?? ""} />
        </div>
        <div>
          <label className="fld" htmlFor="ac-plan">
            الباقة
          </label>
          <input className="inp" id="ac-plan" name="plan_label" defaultValue={account?.plan_label ?? ""} />
        </div>
        <div>
          <label className="fld" htmlFor="ac-phase">
            المرحلة
          </label>
          <input className="inp" id="ac-phase" name="phase_label" defaultValue={account?.phase_label ?? ""} />
        </div>
        <div>
          <label className="fld" htmlFor="ac-next">
            القادم
          </label>
          <input className="inp" id="ac-next" name="next_label" defaultValue={account?.next_label ?? ""} />
        </div>
        <div>
          <label className="fld" htmlFor="ac-status">
            الحالة
          </label>
          <select className="inp" id="ac-status" name="status" defaultValue={account?.status ?? "active"}>
            {STATUS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <div className="err">{error}</div> : null}
      {saved ? <div className="ok-msg">{saved}</div> : null}

      <button className="btn solid" type="submit" disabled={pending}>
        {mode === "create" ? "إنشاء العميل" : "حفظ التغييرات"}
      </button>
    </form>
  );
}
