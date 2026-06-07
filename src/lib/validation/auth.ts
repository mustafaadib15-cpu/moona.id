import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "أدخل البريد الإلكتروني.")
    .email("صيغة البريد الإلكتروني غير صحيحة."),
  password: z.string().min(1, "أدخل كلمة المرور."),
});

export type LoginInput = z.infer<typeof loginSchema>;
