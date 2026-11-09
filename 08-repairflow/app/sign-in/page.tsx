import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeAuthRedirect } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignInPanel } from "./sign-in-panel";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Access your RepairFlow service workspace.",
};

type SignInPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    error?: string | string[];
    mode?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const next = safeAuthRedirect(
    typeof params.next === "string" ? params.next : null,
  );
  const configured = isSupabaseConfigured();

  if (configured) {
    const supabase = await createSupabaseServerClient();
    const { data } = (await supabase?.auth.getUser()) ?? { data: { user: null } };
    if (data.user) redirect(next);
  }

  const initialMode = params.mode === "register" ? "register" : "sign-in";
  const callbackError = typeof params.error === "string" ? params.error : null;

  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#access-panel">
        Skip to account access
      </a>

      <section className={styles.story} aria-label="RepairFlow introduction">
        <a className={styles.brand} href="/" aria-label="RepairFlow home">
          <span className={styles.brandMark} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>REPAIRFLOW</span>
        </a>

        <div className={styles.storyContent}>
          <p className={styles.eyebrow}>Service operations - connected</p>
          <h1>
            Every repair.
            <br />
            <em>One clear flow.</em>
          </h1>
          <p className={styles.storyCopy}>
            Bring requests, diagnostics, approvals, repairs, and customer updates
            into one accountable workspace.
          </p>

          <div className={styles.flowPreview} aria-label="Repair workflow preview">
            <div className={styles.flowTrack} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <ol>
              <li>
                <strong>01</strong>
                <span>Intake</span>
              </li>
              <li>
                <strong>02</strong>
                <span>Diagnose</span>
              </li>
              <li>
                <strong>03</strong>
                <span>Repair</span>
              </li>
              <li>
                <strong>04</strong>
                <span>Return</span>
              </li>
            </ol>
          </div>
        </div>

        <p className={styles.location}>Designed and built in the Philippines</p>
      </section>

      <section className={styles.access} id="access-panel">
        <SignInPanel
          configured={configured}
          next={next}
          initialMode={initialMode}
          callbackError={callbackError}
        />
      </section>
    </main>
  );
}
