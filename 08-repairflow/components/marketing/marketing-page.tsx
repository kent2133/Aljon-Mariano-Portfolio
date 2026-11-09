"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RepairDeviceScene } from "./repair-device-scene";
import styles from "./marketing.module.css";

const workflow = [
  {
    number: "01",
    label: "Request",
    owner: "Customer and front desk",
    title: "Start with the whole story.",
    body: "Capture the device, the issue, photos, contact details, and service preference in one structured request. The team begins with context instead of a vague handoff.",
    detail: "One intake record follows the repair from first message to final release.",
  },
  {
    number: "02",
    label: "Diagnose",
    owner: "Assigned technician",
    title: "Turn inspection into evidence.",
    body: "Record test results, observed damage, recommended parts, and technician notes against the same ticket. Every finding stays connected to the device and its history.",
    detail: "Clear findings help the next decision happen without another round of questions.",
  },
  {
    number: "03",
    label: "Quote",
    owner: "Customer approval",
    title: "Make the decision explicit.",
    body: "Share labor, parts, timing, and service notes as a reviewable quote. Approval or rejection becomes a visible checkpoint before work moves forward.",
    detail: "The customer sees what is changing, what it costs, and what happens next.",
  },
  {
    number: "04",
    label: "Repair",
    owner: "Workshop team",
    title: "Show the work in motion.",
    body: "Track repair status, parts used, labor notes, and supporting photos as the job progresses. Updates become part of the record, not scattered messages.",
    detail: "Technicians get focus while the front desk gets a reliable answer for every follow-up.",
  },
  {
    number: "05",
    label: "Complete",
    owner: "Service handoff",
    title: "Close with confidence.",
    body: "Confirm the completed work, final amount, pickup status, and warranty notes. The customer leaves with a clear receipt and the team retains a complete service trail.",
    detail: "A finished ticket becomes useful history for the next visit, not a closed tab.",
  },
] as const;

const platformFeatures = [
  {
    index: "A",
    title: "A shared repair record",
    body: "Requests, diagnostics, quotes, files, messages, and status changes stay attached to one ticket.",
  },
  {
    index: "B",
    title: "Approval with context",
    body: "Customers can review the recommendation and decide from the same information the team sees.",
  },
  {
    index: "C",
    title: "Access by responsibility",
    body: "Customers, technicians, and administrators see tools shaped around the decisions they need to make.",
  },
  {
    index: "D",
    title: "History that explains itself",
    body: "A traceable activity timeline shows what changed, who handled it, and when the handoff happened.",
  },
] as const;

const roles = [
  {
    number: "01",
    role: "Customer",
    title: "Know where the repair stands.",
    body: "Submit a request, review a quote, follow progress, and return to the service history without calling for every update.",
  },
  {
    number: "02",
    role: "Technician",
    title: "Keep the bench focused.",
    body: "See assigned work, document findings, update the repair, and leave a clean record for the next teammate.",
  },
  {
    number: "03",
    role: "Administrator",
    title: "Run the operation from one view.",
    body: "Assign work, manage approvals, review activity, and understand where every active ticket needs attention.",
  },
] as const;

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20">
      <path d="M4 10h11M11 6l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function MarketingPage() {
  const rootRef = useRef<HTMLElement>(null);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      anchors: { offset: -84 },
      autoRaf: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const context = gsap.context(() => {
      gsap.from("[data-hero-reveal]", {
        y: 34,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.09,
        delay: 0.1,
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 28,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            once: true,
          },
        });
      });
    }, rootRef);

    ScrollTrigger.refresh();

    return () => {
      context.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <main ref={rootRef} className={styles.page}>
      <a className={styles.skipLink} href="#main-content">
        Skip to main content
      </a>

      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="RepairFlow home">
          <span className={styles.brandMark} aria-hidden="true">
            <span />
            <span />
          </span>
          <span>RepairFlow</span>
        </Link>

        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#workflow">Workflow</a>
          <a href="#platform">Platform</a>
          <a href="#roles">Roles</a>
        </nav>

        <div className={styles.headerActions}>
          <Link className={styles.textLink} href="/sign-in">
            Sign in
          </Link>
          <Link className={styles.compactButton} href="/workspace">
            Open workspace
            <ArrowIcon />
          </Link>
        </div>
      </header>

      <div id="main-content" className={styles.storyGrid}>
        <div className={styles.storyCopy}>
          <section className={styles.hero} aria-labelledby="hero-title">
            <div className={styles.heroEyebrow} data-hero-reveal>
              <span>Service operations, connected</span>
              <span>Repair platform concept</span>
            </div>

            <h1 id="hero-title" data-hero-reveal>
              Every repair,
              <span> visible from intake to handoff.</span>
            </h1>

            <p className={styles.heroLead} data-hero-reveal>
              RepairFlow gives customers, technicians, and service teams one dependable record for every device, decision, and update.
            </p>

            <div className={styles.heroActions} data-hero-reveal>
              <Link className={styles.primaryButton} href="/workspace">
                Explore the live workspace
                <ArrowIcon />
              </Link>
              <a className={styles.secondaryButton} href="#workflow">
                See the workflow
              </a>
            </div>

            <dl className={styles.heroProof} data-hero-reveal>
              <div>
                <dt>01</dt>
                <dd>Role based access</dd>
              </div>
              <div>
                <dt>02</dt>
                <dd>Approval checkpoints</dd>
              </div>
              <div>
                <dt>03</dt>
                <dd>Traceable handoffs</dd>
              </div>
            </dl>
          </section>

          <section id="workflow" className={styles.workflowIntro} aria-labelledby="workflow-title">
            <p className={styles.sectionLabel} data-reveal>
              01 / The service journey
            </p>
            <h2 id="workflow-title" data-reveal>
              One ticket.
              <span> Five accountable moments.</span>
            </h2>
            <p data-reveal>
              Scroll through the device to see how the physical repair and the operational record stay in sync.
            </p>
          </section>

          <div className={styles.workflowSteps}>
            {workflow.map((step, index) => (
              <article
                key={step.label}
                className={styles.workflowStep}
                data-repair-step={index}
                aria-labelledby={`workflow-step-${index}`}
              >
                <div className={styles.stepMeta}>
                  <span>{step.number}</span>
                  <span>{step.owner}</span>
                </div>
                <p className={styles.stepLabel}>{step.label}</p>
                <h3 id={`workflow-step-${index}`}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
                <p className={styles.stepDetail}>{step.detail}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className={styles.sceneRail} aria-label="Interactive repair workflow model">
          <div className={styles.sceneFrame}>
            <RepairDeviceScene onStepChange={setActiveStage} />

            <div className={styles.sceneTopline} aria-hidden="true">
              <span>Device record RF-2048</span>
              <span>Live assembly</span>
            </div>

            <div className={styles.sceneCaption} aria-live="polite">
              <span className={styles.sceneNumber}>{workflow[activeStage].number}</span>
              <span>
                <small>Current stage</small>
                {workflow[activeStage].label}
              </span>
            </div>

            <div className={styles.progressDots} aria-label={`Workflow stage ${activeStage + 1} of ${workflow.length}`}>
              {workflow.map((step, index) => (
                <span
                  key={step.label}
                  className={index === activeStage ? styles.progressDotActive : undefined}
                  aria-hidden="true"
                />
              ))}
            </div>

            <p className={styles.sceneHint}>Scroll to inspect the service layers</p>
          </div>
        </aside>
      </div>

      <section id="platform" className={styles.platform} aria-labelledby="platform-title">
        <div className={styles.platformHeading}>
          <p className={styles.sectionLabel} data-reveal>
            02 / Operational clarity
          </p>
          <h2 id="platform-title" data-reveal>
            Built around evidence,
            <span> not status theater.</span>
          </h2>
          <p data-reveal>
            The workspace keeps the work, the decision, and the customer update close enough to explain each other.
          </p>
        </div>

        <div className={styles.featureGrid}>
          {platformFeatures.map((feature) => (
            <article key={feature.index} className={styles.featureCard} data-reveal>
              <span>{feature.index}</span>
              <h3>{feature.title}</h3>
              <p>{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="roles" className={styles.roles} aria-labelledby="roles-title">
        <div className={styles.rolesHeading}>
          <p className={styles.sectionLabel} data-reveal>
            03 / One system, three perspectives
          </p>
          <h2 id="roles-title" data-reveal>
            The right detail
            <span> for the person acting next.</span>
          </h2>
        </div>

        <div className={styles.roleList}>
          {roles.map((role) => (
            <article className={styles.roleCard} key={role.role} data-reveal>
              <div className={styles.roleIndex}>{role.number}</div>
              <div>
                <p>{role.role}</p>
                <h3>{role.title}</h3>
              </div>
              <p className={styles.roleBody}>{role.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-cta-title">
        <div>
          <p className={styles.sectionLabel} data-reveal>
            Ready for inspection
          </p>
          <h2 id="final-cta-title" data-reveal>
            Follow a repair from first request to final handoff.
          </h2>
        </div>
        <div className={styles.finalActions} data-reveal>
          <Link className={styles.darkButton} href="/workspace">
            Enter the workspace
            <ArrowIcon />
          </Link>
          <Link className={styles.outlineButton} href="/sign-in">
            Sign in to your role
          </Link>
        </div>
      </section>

      <footer className={styles.footer}>
        <Link className={styles.brand} href="/" aria-label="RepairFlow home">
          <span className={styles.brandMark} aria-hidden="true">
            <span />
            <span />
          </span>
          <span>RepairFlow</span>
        </Link>
        <p>A full stack service management concept for a portfolio demonstration.</p>
        <div>
          <a href="#main-content">Back to top</a>
          <span>Next.js / TypeScript / Three.js</span>
        </div>
      </footer>
    </main>
  );
}
