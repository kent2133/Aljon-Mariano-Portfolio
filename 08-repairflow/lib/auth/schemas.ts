import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .email("Enter a valid email address.")
  .max(254, "Email addresses must be 254 characters or fewer.");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Enter at least 2 characters.")
      .max(80, "Names must be 80 characters or fewer."),
    email,
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(72, "Passwords must be 72 characters or fewer.")
      .regex(/[a-z]/, "Add a lowercase letter.")
      .regex(/[A-Z]/, "Add an uppercase letter.")
      .regex(/[0-9]/, "Add a number."),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
