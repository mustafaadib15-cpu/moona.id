"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/app/(auth)/actions";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

export function LoginForm() {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginInput) => {
    setServerError("");
    startTransition(async () => {
      const result = await signIn(values);
      if (result?.error) {
        setServerError(result.error);
      }
    });
  };

  const message = serverError || errors.email?.message || errors.password?.message || "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="fld" htmlFor="email">
        البريد الإلكتروني
      </label>
      <input
        className="inp"
        id="email"
        type="email"
        placeholder="name@company.com"
        autoComplete="username"
        {...register("email")}
      />

      <label className="fld" htmlFor="password">
        كلمة المرور
      </label>
      <input
        className="inp"
        id="password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        {...register("password")}
      />

      <div className="err">{message}</div>

      <button className="btn solid full" type="submit" disabled={pending}>
        {pending ? "جارٍ الدخول" : "تسجيل الدخول"}
      </button>
    </form>
  );
}
