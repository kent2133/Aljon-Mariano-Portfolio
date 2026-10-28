import Link from "next/link";
import { ArrowRight, ArrowUpRight, Boxes, Database, KeyRound, Radio, ShieldCheck } from "lucide-react";
import { OpsScene } from "@/components/ops-scene";
import { systemCatalog } from "@/lib/systems";
import styles from "./page.module.css";

export default function SuiteHome() {
  return (
    <main className={styles.home}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.brand}><span>OS</span><div><strong>Operations Suite</strong><small>By Aljon Mariano</small></div></Link>
        <div className={styles.navLinks}><a href="#systems">Systems</a><a href="#architecture">Architecture</a><a href="https://aljon-mariano-contact.vercel.app/#systems">Portfolio</a></div>
        <Link href="/pulsedesk" className={styles.launch}>Open the suite <ArrowUpRight size={14} /></Link>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><i></i> FULL-STACK PORTFOLIO / 01-05</p>
          <h1>Five systems.<br />One operational<br /><em>language.</em></h1>
          <p className={styles.intro}>A role-based suite for the work behind the work: support, inventory, approvals, appointments, and field service - all connected by one accountable data layer.</p>
          <div className={styles.heroActions}><Link href="/pulsedesk">Enter PulseDesk <ArrowRight size={15} /></Link><a href="#systems">Explore all five</a></div>
          <dl className={styles.heroStats}><div><dt>05</dt><dd>Working applications</dd></div><div><dt>15</dt><dd>Demo roles</dd></div><div><dt>01</dt><dd>Shared API core</dd></div></dl>
        </div>
        <OpsScene />
      </section>

      <section className={styles.systems} id="systems">
        <header className={styles.sectionHead}><div><p>01 / THE APPLICATIONS</p><h2>Built around<br /><em>real workflows.</em></h2></div><p>Each system has independent roles, states, decisions, and operational views. Switch roles inside any app to test what changes - and what stays protected.</p></header>
        <div className={styles.systemGrid}>
          {systemCatalog.map((system, index) => (
            <article className={`${styles.systemCard} ${index === 0 ? styles.featured : ""}`} key={system.id} style={{ "--card-accent": system.accent, "--card-rgb": system.accentRgb } as React.CSSProperties}>
              <div className={styles.cardVisual}>
                <div className={styles.mockNav}><i>{system.glyph}</i><span></span><span></span><span></span></div>
                <div className={styles.mockBody}><div><b></b><b></b><b></b></div><span></span><span></span><span></span><span></span></div>
                <strong>{system.index}</strong>
              </div>
              <div className={styles.cardCopy}><p>{system.eyebrow}</p><h3>{system.name}</h3><span>{system.summary}</span><div className={styles.roles}>{system.roles.map((role) => <i key={role.id}>{role.label}</i>)}</div><Link href={system.href}>Launch application <ArrowUpRight size={14} /></Link></div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.architecture} id="architecture">
        <header className={styles.sectionHead}><div><p>02 / UNDER THE INTERFACE</p><h2>A portfolio that<br /><em>behaves like software.</em></h2></div><p>The visible dashboards are only one layer. The same suite includes route handlers, signed demo sessions, server-side permissions, validation, audit events, and optional cloud persistence.</p></header>
        <div className={styles.archGrid}>
          <article><KeyRound /><span>01 / IDENTITY</span><h3>Signed role sessions</h3><p>Three intentional demo roles per system expose the workflow without pretending public credentials are production authentication.</p></article>
          <article><ShieldCheck /><span>02 / PERMISSIONS</span><h3>Server-enforced RBAC</h3><p>Actions are checked by the API - not merely hidden in the interface - so unauthorized transitions are rejected and explained.</p></article>
          <article><Database /><span>03 / DATA</span><h3>Postgres-ready events</h3><p>Every accepted action creates a structured audit event. Fixture mode is safe by default; Supabase enables durable cloud history.</p></article>
          <article><Radio /><span>04 / FEEDBACK</span><h3>Observable state</h3><p>Loading, permission, empty, active, and completed states make the systems understandable under real operating conditions.</p></article>
          <article><Boxes /><span>05 / DELIVERY</span><h3>One Vercel deployment</h3><p>A shared Next.js foundation keeps the five direct routes cohesive while reducing duplicated hosting and maintenance.</p></article>
        </div>
      </section>

      <footer className={styles.footer}><div><span>OS / 2026</span><h2>Choose a workflow.<br /><em>Try the role.</em></h2></div><Link href="/pulsedesk">Start with PulseDesk <ArrowRight size={16} /></Link><p>Illustrative portfolio systems. All names, organizations, and records are fictional.</p></footer>
    </main>
  );
}
