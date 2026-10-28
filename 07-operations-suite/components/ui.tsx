import type { ReactNode } from "react";

export function MetricCard({ label, value, delta, detail, tone = "default" }: { label: string; value: string; delta?: string; detail?: string; tone?: "default" | "good" | "warn" }) {
  return <article className={`metric-card tone-${tone}`}><div><span>{label}</span>{delta && <b>{delta}</b>}</div><strong>{value}</strong>{detail && <p>{detail}</p>}</article>;
}

export function Panel({ eyebrow, title, action, children, className = "" }: { eyebrow?: string; title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`data-panel ${className}`}><header><div>{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2></div>{action}</header><div className="panel-body">{children}</div></section>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "danger" | "info" }) {
  return <span className={`status-badge status-${tone}`}><i></i>{children}</span>;
}

export function ProgressBar({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return <div className="progress-wrap">{label && <div><span>{label}</span><b>{Math.round(percent)}%</b></div>}<span className="progress-track"><i style={{ width: `${percent}%` }} /></span></div>;
}

export function Sparkline({ values, label }: { values: number[]; label: string }) {
  if (values.length === 0) return <svg className="sparkline" viewBox="0 0 100 40" role="img" aria-label={`${label}: no data`} />;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => `${(index / Math.max(1, values.length - 1)) * 100},${36 - ((value - min) / Math.max(1, max - min)) * 30}`).join(" ");
  return <svg className="sparkline" viewBox="0 0 100 40" role="img" aria-label={label} preserveAspectRatio="none"><polyline points={points} /></svg>;
}

export function EmptyState({ title, copy }: { title: string; copy: string }) {
  return <div className="empty-state"><span>◇</span><strong>{title}</strong><p>{copy}</p></div>;
}
