"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Wrench,
} from "lucide-react";
import { registerSchema, signInSchema } from "@/lib/auth/schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

type Mode = "sign-in" | "register";

type SignInPanelProps = {
  configured: boolean;
  next: string;
  initialMode: Mode;
  callbackError: string | null;
};

type FieldErrors = Partial<
  Record<"fullName" | "email" | "password" | "confirmPassword", string>
>;

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "The email or password is incorrect. Please try again.";
  }
  if (normalized.includes("already registered") || normalized.includes("already been registered")) {
    return "An account already exists for this email. Sign in instead.";
  }
  if (normalized.includes("email rate limit")) {
    return "Too many email requests were made. Wait a moment and try again.";
  }

  return "We could not complete that request. Please try again.";
}

function callbackMessage(code: string | null) {
  if (!code) return null;
  if (code === "expired") return "That sign-in link has expired. Request a new one.";
  if (code === "missing_code") return "The sign-in link is incomplete. Please try again.";
  return "We could not confirm your sign-in link. Please try again.";
}

export function SignInPanel({
  configured,
  next,
  initialMode,
  callbackError,
}: SignInPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<string | null>(callbackMessage(callbackError));
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function selectMode(nextMode: Mode) {
    setMode(nextMode);
    setErrors({});
    setNotice(null);
  }

  function updateField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setNotice(null);

    if (!configured) {
      setNotice("Cloud access is not connected in this preview.");
      return;
    }

    const schema = mode === "sign-in" ? signInSchema : registerSchema;
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FieldErrors | undefined;
        if (field && !nextErrors[field]) nextErrors[field] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setNotice("Cloud access is temporarily unavailable. Open portfolio mode instead.");
      return;
    }

    setPending(true);

    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email.trim(),
          password: values.password,
        });
        if (error) throw error;

        router.push(next);
        router.refresh();
        return;
      }

      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", next);

      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          emailRedirectTo: callback.toString(),
          data: { full_name: values.fullName.trim() },
        },
      });
      if (error) throw error;

      if (data.session) {
        await supabase.rpc("bootstrap_personal_organization");
        router.push(next);
        router.refresh();
      } else {
        setNotice(
          "Your account is ready. Check your inbox to confirm your email, then return here to sign in.",
        );
      }
    } catch (error) {
      setNotice(
        friendlyAuthError(error instanceof Error ? error.message : "Unknown authentication error"),
      );
    } finally {
      setPending(false);
    }
  }

  if (!configured) {
    return (
      <div className={styles.panelShell}>
        <div className={styles.panelHeader}>
          <p className={styles.panelIndex}>PORTFOLIO ACCESS / 01</p>
          <h2>Explore the working product.</h2>
          <p>
            Cloud authentication is ready for deployment. This local preview uses
            portfolio mode so you can test every role without an account.
          </p>
        </div>

        <div className={styles.previewCard}>
          <div className={styles.previewIcon} aria-hidden="true">
            <Wrench size={25} strokeWidth={1.8} />
          </div>
          <div>
            <strong>Seeded service workspace</strong>
            <p>Realistic customers, devices, tickets, quotes, and repair activity.</p>
          </div>
        </div>

        <Link className={styles.primaryAction} href={next}>
          Open portfolio workspace
          <ArrowRight size={18} />
        </Link>

        <ul className={styles.previewDetails}>
          <li>
            <Check size={15} /> Customer, technician, and admin views
          </li>
          <li>
            <Check size={15} /> Interactive updates stored for this browser
          </li>
          <li>
            <Check size={15} /> Guided product tour included
          </li>
        </ul>

        <p className={styles.configurationNote}>
          Connect Supabase environment variables to enable secure live accounts and
          persistent cloud data.
        </p>
        <Link className={styles.backLink} href="/">
          Return to product overview
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.panelShell}>
      <div className={styles.cloudStatus}>
        <span aria-hidden="true" /> Cloud workspace online
      </div>

      <div className={styles.panelHeader}>
        <p className={styles.panelIndex}>SECURE ACCESS / 01</p>
        <h2>{mode === "sign-in" ? "Welcome back." : "Create your workspace."}</h2>
        <p>
          {mode === "sign-in"
            ? "Sign in to continue managing service work."
            : "Start with a secure account for your repair team."}
        </p>
      </div>

      <div className={styles.modeSwitch} aria-label="Account access options">
        <button
          type="button"
          className={mode === "sign-in" ? styles.activeMode : undefined}
          onClick={() => selectMode("sign-in")}
          aria-pressed={mode === "sign-in"}
        >
          Sign in
        </button>
        <button
          type="button"
          className={mode === "register" ? styles.activeMode : undefined}
          onClick={() => selectMode("register")}
          aria-pressed={mode === "register"}
        >
          Create account
        </button>
      </div>

      <form className={styles.form} onSubmit={submit} noValidate>
        {mode === "register" ? (
          <label>
            <span>Full name</span>
            <input
              name="fullName"
              type="text"
              autoComplete="name"
              value={values.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "full-name-error" : undefined}
              placeholder="Your name"
            />
            {errors.fullName ? <small id="full-name-error">{errors.fullName}</small> : null}
          </label>
        ) : null}

        <label>
          <span>Email address</span>
          <input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            placeholder="you@company.com"
          />
          {errors.email ? <small id="email-error">{errors.email}</small> : null}
        </label>

        <label>
          <span>Password</span>
          <div className={styles.passwordField}>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              value={values.password}
              onChange={(event) => updateField("password", event.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              placeholder={mode === "register" ? "8 or more characters" : "Your password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
          {errors.password ? <small id="password-error">{errors.password}</small> : null}
        </label>

        {mode === "register" ? (
          <label>
            <span>Confirm password</span>
            <input
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={values.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
              placeholder="Repeat your password"
            />
            {errors.confirmPassword ? (
              <small id="confirm-password-error">{errors.confirmPassword}</small>
            ) : null}
          </label>
        ) : null}

        {notice ? (
          <p className={styles.formNotice} role="status" aria-live="polite">
            {notice}
          </p>
        ) : null}

        <button className={styles.primaryAction} type="submit" disabled={pending}>
          {pending
            ? "Working..."
            : mode === "sign-in"
              ? "Enter workspace"
              : "Create secure account"}
          {pending ? <LockKeyhole className={styles.pendingIcon} size={17} /> : <ArrowRight size={18} />}
        </button>
      </form>

      <div className={styles.panelFooter}>
        <LockKeyhole size={15} />
        <span>Protected by Supabase Auth and row-level security.</span>
      </div>
      <Link className={styles.backLink} href="/">
        Return to product overview
      </Link>
    </div>
  );
}
