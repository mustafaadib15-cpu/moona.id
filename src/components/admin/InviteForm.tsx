"use client";

import { useState, useTransition, type FormEvent } from "react";
import { inviteClient } from "@/app/(admin)/admin/actions";

export function InviteForm({ clientId }: { clientId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await inviteClient(clientId, formData);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setMessage(result.message);
      form.reset();
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <label className="fld" htmlFor="invite-email">
        دعوة عميل بالبريد الإلكتروني
      </label>
      <input
        className="inp"
        id="invite-email"
        name="email"
        type="email"
        dir="ltr"
        placeholder="name@company.com"
        required
      />
      {error ? <div className="err">{error}</div> : null}
      {message ? <div className="ok-msg">{message}</div> : null}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "جارٍ الإرسال" : "إرسال الدعوة"}
      </button>
    </form>
  );
}
