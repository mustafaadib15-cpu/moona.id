"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    password: z.string().min(8, "كلمة المرور يجب أن تكون ثمانية أحرف على الأقل."),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "كلمتا المرور غير متطابقتين.",
    path: ["confirm"],
  });

type SetPasswordInput = z.infer<typeof schema>;

export function SetPasswordForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetPasswordInput>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = (values: SetPasswordInput) => {
    setServerError("");
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) {
        setServerError("تعذر تعيين كلمة المرور. حاول مرة أخرى.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    });
  };

  const message =
    serverError || errors.password?.message || errors.confirm?.message || "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="fld" htmlFor="new-password">
        كلمة المرور الجديدة
      </label>
      <input
        className="inp"
        id="new-password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        {...register("password")}
      />

      <label className="fld" htmlFor="confirm-password">
        تأكيد كلمة المرور
      </label>
      <input
        className="inp"
        id="confirm-password"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        {...register("confirm")}
      />

      <div className="err">{message}</div>

      <button className="btn solid full" type="submit" disabled={pending}>
        {pending ? "جارٍ الحفظ" : "حفظ كلمة المرور"}
      </button>
    </form>
  );
}
