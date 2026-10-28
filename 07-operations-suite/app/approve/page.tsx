"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  History,
  MessageSquareText,
  Paperclip,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { SystemShell, WorkflowButton, useOperations } from "@/components/system-shell";
import { MetricCard, Panel, StatusBadge } from "@/components/ui";
import styles from "./page.module.css";

type RequestStatus = "Reviewing" | "Ready" | "Needs evidence" | "Approved" | "Returned" | "Rejected" | "Withdrawn";

type ApprovalRequest = {
  id: string;
  title: string;
  owner: string;
  department: string;
  amount: string;
  submitted: string;
  due: string;
  status: RequestStatus;
  risk: "Low" | "Medium" | "High";
  stage: number;
  summary: string;
  evidence: { name: string; type: string; size: string; state: "Verified" | "Review" | "Missing" }[];
};

const seededRequests: ApprovalRequest[] = [
  {
    id: "APR-0248",
    title: "Regional network modernization",
    owner: "Emil Navarro",
    department: "IT Infrastructure",
    amount: "₱482,000",
    submitted: "28 Oct · 08:42",
    due: "Today · 16:00",
    status: "Ready",
    risk: "Medium",
    stage: 3,
    summary: "Replace aging access switches across three sites before the peak enrollment period.",
    evidence: [
      { name: "Technical scope v4.pdf", type: "PDF · signed", size: "2.4 MB", state: "Verified" },
      { name: "Vendor comparison.xlsx", type: "Spreadsheet", size: "840 KB", state: "Verified" },
      { name: "Security review.pdf", type: "PDF · reviewed", size: "1.1 MB", state: "Review" },
    ],
  },
  {
    id: "APR-0247",
    title: "Customer support tooling renewal",
    owner: "Mina Chua",
    department: "Customer Success",
    amount: "₱216,000",
    submitted: "27 Oct · 14:15",
    due: "29 Oct · 12:00",
    status: "Reviewing",
    risk: "Low",
    stage: 2,
    summary: "Renew the omnichannel support platform for 32 service agents for another twelve months.",
    evidence: [
      { name: "Renewal proposal.pdf", type: "PDF", size: "1.6 MB", state: "Verified" },
      { name: "Usage report.csv", type: "Data export", size: "310 KB", state: "Review" },
    ],
  },
  {
    id: "APR-0246",
    title: "Warehouse safety retrofit",
    owner: "Carlo Reyes",
    department: "Facilities",
    amount: "₱790,500",
    submitted: "27 Oct · 09:02",
    due: "30 Oct · 17:00",
    status: "Needs evidence",
    risk: "High",
    stage: 1,
    summary: "Install guardrails, marked pedestrian lanes, and emergency lighting in the south warehouse.",
    evidence: [
      { name: "Site inspection.pdf", type: "PDF · signed", size: "3.2 MB", state: "Verified" },
      { name: "Final quotation", type: "Required evidence", size: "—", state: "Missing" },
    ],
  },
  {
    id: "APR-0245",
    title: "Q4 community partnership fund",
    owner: "Jessa Aquino",
    department: "Corporate Affairs",
    amount: "₱125,000",
    submitted: "25 Oct · 11:31",
    due: "Completed",
    status: "Approved",
    risk: "Low",
    stage: 4,
    summary: "Fund the final community technology workshops and equipment grants for the quarter.",
    evidence: [
      { name: "Program brief.pdf", type: "PDF · signed", size: "1.3 MB", state: "Verified" },
      { name: "Budget schedule.xlsx", type: "Spreadsheet", size: "490 KB", state: "Verified" },
    ],
  },
];

const stages = ["Submitted", "Evidence", "Review", "Decision"];

function statusTone(status: RequestStatus) {
  if (status === "Approved") return "good" as const;
  if (status === "Rejected" || status === "Withdrawn") return "danger" as const;
  if (status === "Needs evidence" || status === "Returned") return "warn" as const;
  return "info" as const;
}

function ApproveWorkspace() {
  const { session, events } = useOperations();
  const [requests, setRequests] = useState(seededRequests);
  const [selectedId, setSelectedId] = useState(seededRequests[0].id);
  const [view, setView] = useState<"pipeline" | "evidence" | "audit">("pipeline");
  const [query, setQuery] = useState("");
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);

  const selected = requests.find((request) => request.id === selectedId) ?? requests[0];
  const role = session?.role ?? "submitter";

  const filteredRequests = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesQuery = !normalized || `${request.id} ${request.title} ${request.owner} ${request.department}`.toLowerCase().includes(normalized);
      const matchesStatus = !showOnlyOpen || !["Approved", "Rejected", "Withdrawn"].includes(request.status);
      return matchesQuery && matchesStatus;
    });
  }, [query, requests, showOnlyOpen]);

  const updateSelected = (status: RequestStatus, stage = selected.stage) => {
    setRequests((current) => current.map((request) => request.id === selected.id ? { ...request, status, stage } : request));
  };

  const openCount = requests.filter((request) => !["Approved", "Rejected", "Withdrawn"].includes(request.status)).length;
  const completeEvidence = selected.evidence.filter((file) => file.state !== "Missing").length;

  return (
    <>
      <header className="system-header">
        <div>
          <p className="system-eyebrow">Controlled requests · Decision workspace</p>
          <h1>Every decision leaves a <em>clear trail.</em></h1>
          <p className="system-header-copy">Review context, verify supporting evidence, and make policy-safe decisions without losing the conversation that led there.</p>
        </div>
        <div className="system-actions">
          <button onClick={() => setShowOnlyOpen((current) => !current)}><Filter size={14} /> {showOnlyOpen ? "Show all" : "Open only"}</button>
          {role === "submitter" && (
            <WorkflowButton action="request:create" recordId="APR-DRAFT" note="Created a new approval request draft" className="primary">
              New request <ArrowRight size={14} />
            </WorkflowButton>
          )}
        </div>
      </header>

      <section className="metric-grid" aria-label="Approval metrics">
        <MetricCard label="Open requests" value={String(openCount)} delta="2 due today" detail="Across procurement, facilities, and operations" />
        <MetricCard label="Median decision" value="1.8d" delta="−14%" detail="From complete evidence to final approval" tone="good" />
        <MetricCard label="Evidence health" value="92%" delta="+4.2%" detail="Required documents complete at submission" tone="good" />
        <MetricCard label="Policy exceptions" value="03" delta="Review" detail="One high-risk request needs escalation" tone="warn" />
      </section>

      <div className={styles.workspace}>
        <Panel
          eyebrow="Request pipeline"
          title={`${filteredRequests.length} records in view`}
          className={styles.requestPanel}
          action={
            <label className={styles.search}>
              <Search size={14} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search requests" aria-label="Search requests" />
            </label>
          }
        >
          <div className={styles.requestList}>
            {filteredRequests.map((request) => (
              <button
                key={request.id}
                className={`${styles.requestRow} ${selected.id === request.id ? styles.selected : ""}`}
                onClick={() => setSelectedId(request.id)}
              >
                <span className={styles.requestMarker}>{request.stage === 4 ? <Check size={13} /> : request.stage}</span>
                <span className={styles.requestMain}>
                  <span><b>{request.id}</b><StatusBadge tone={statusTone(request.status)}>{request.status}</StatusBadge></span>
                  <strong>{request.title}</strong>
                  <small>{request.department} · {request.owner}</small>
                </span>
                <span className={styles.requestMeta}><b>{request.amount}</b><small>{request.due}</small></span>
                <ChevronRight size={15} className={styles.chevron} />
              </button>
            ))}
            {filteredRequests.length === 0 && <div className={styles.noResults}>No requests match this search.</div>}
          </div>
        </Panel>

        <section className={styles.inspector} aria-label={`${selected.id} request details`}>
          <div className={styles.inspectorTop}>
            <div>
              <span>{selected.id} · {selected.department}</span>
              <h2>{selected.title}</h2>
              <p>{selected.summary}</p>
            </div>
            <StatusBadge tone={selected.risk === "High" ? "danger" : selected.risk === "Medium" ? "warn" : "good"}>{selected.risk} risk</StatusBadge>
          </div>

          <nav className={styles.tabs} aria-label="Request detail views">
            <button aria-pressed={view === "pipeline"} className={view === "pipeline" ? styles.activeTab : ""} onClick={() => setView("pipeline")}><FileCheck2 size={14} /> Review</button>
            <button aria-pressed={view === "evidence"} className={view === "evidence" ? styles.activeTab : ""} onClick={() => setView("evidence")}><Paperclip size={14} /> Evidence <b>{completeEvidence}/{selected.evidence.length}</b></button>
            <button aria-pressed={view === "audit"} className={view === "audit" ? styles.activeTab : ""} onClick={() => setView("audit")}><History size={14} /> Audit</button>
          </nav>

          {view === "pipeline" && (
            <div className={styles.reviewView}>
              <div className={styles.stageTrack}>
                {stages.map((stage, index) => (
                  <div key={stage} className={index + 1 <= selected.stage ? styles.stageComplete : ""}>
                    <span>{index + 1 < selected.stage || selected.stage === 4 ? <Check size={12} /> : index + 1}</span>
                    <b>{stage}</b>
                  </div>
                ))}
              </div>

              <div className={styles.reviewGrid}>
                <div className={styles.briefCard}>
                  <span>Decision brief</span>
                  <dl>
                    <div><dt>Requested by</dt><dd>{selected.owner}</dd></div>
                    <div><dt>Commitment</dt><dd>{selected.amount}</dd></div>
                    <div><dt>Submitted</dt><dd>{selected.submitted}</dd></div>
                    <div><dt>Decision due</dt><dd>{selected.due}</dd></div>
                  </dl>
                </div>
                <div className={styles.policyCard}>
                  <span><ShieldCheck size={15} /> Policy checks</span>
                  <ul>
                    <li className={styles.passed}><CheckCircle2 size={15} /><div><b>Budget owner confirmed</b><small>Matched against cost center IT-410</small></div></li>
                    <li className={styles.passed}><CheckCircle2 size={15} /><div><b>Competitive quotes attached</b><small>Three qualified vendors compared</small></div></li>
                    <li><Clock3 size={15} /><div><b>Security review in progress</b><small>One reviewer note remains open</small></div></li>
                  </ul>
                </div>
              </div>

              <div className={styles.decisionBar}>
                <div><span>Acting as</span><strong>{session?.name ?? "Starting session"} · {role}</strong></div>
                <div className={styles.decisionActions}>
                  {role === "submitter" && (
                    <>
                      <WorkflowButton action="request:comment" recordId={selected.id} note="Added supporting context to the request"><MessageSquareText size={14} /> Add context</WorkflowButton>
                      <WorkflowButton action="request:withdraw" recordId={selected.id} note="Withdrew request from consideration" className={styles.danger} onSuccess={() => updateSelected("Withdrawn")}><Archive size={14} /> Withdraw</WorkflowButton>
                    </>
                  )}
                  {role === "reviewer" && (
                    <>
                      <WorkflowButton action="request:return" recordId={selected.id} note="Returned to submitter for additional evidence" className={styles.danger} onSuccess={() => updateSelected("Returned", 1)}><RotateCcw size={14} /> Return</WorkflowButton>
                      <WorkflowButton action="request:review" recordId={selected.id} note="Completed evidence and policy review" className="primary" onSuccess={() => updateSelected("Ready", 3)}>Complete review <Check size={14} /></WorkflowButton>
                    </>
                  )}
                  {role === "approver" && (
                    <>
                      <WorkflowButton action="request:reject" recordId={selected.id} note="Rejected after final decision review" className={styles.danger} onSuccess={() => updateSelected("Rejected", 4)}><X size={14} /> Reject</WorkflowButton>
                      <WorkflowButton action="request:approve" recordId={selected.id} note="Approved after final decision review" className="primary" onSuccess={() => updateSelected("Approved", 4)}>Approve request <Check size={14} /></WorkflowButton>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {view === "evidence" && (
            <div className={styles.evidenceView}>
              <div className={styles.evidenceSummary}>
                <FileCheck2 size={24} />
                <div><strong>{completeEvidence} of {selected.evidence.length} items supplied</strong><p>Evidence is hashed and preserved with the decision record.</p></div>
                <span>{Math.round((completeEvidence / selected.evidence.length) * 100)}%</span>
              </div>
              <div className={styles.fileList}>
                {selected.evidence.map((file) => (
                  <button key={file.name}>
                    <span className={styles.fileIcon}><FileText size={17} /></span>
                    <span><strong>{file.name}</strong><small>{file.type} · {file.size}</small></span>
                    <StatusBadge tone={file.state === "Verified" ? "good" : file.state === "Missing" ? "danger" : "warn"}>{file.state}</StatusBadge>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === "audit" && (
            <div className={styles.auditView}>
              <div className={styles.auditIntro}><ShieldCheck size={18} /><div><strong>Immutable activity history</strong><p>Server-recorded demo actions appear here immediately.</p></div></div>
              <ol>
                {events.map((event) => (
                  <li key={event.id}><span></span><div><strong>{event.action.replaceAll(":", " ")}</strong><p>{event.note || "Workflow event recorded"}</p><small>{event.actorName} · {new Date(event.createdAt).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</small></div></li>
                ))}
                <li><span></span><div><strong>request submitted</strong><p>Evidence bundle sealed and sent for review.</p><small>{selected.owner} · {selected.submitted}</small></div></li>
                <li><span></span><div><strong>policy checks started</strong><p>Automated checks matched the request to policy FIN-04.</p><small>Approve automation · 2 minutes later</small></div></li>
              </ol>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default function ApprovePage() {
  return <SystemShell systemId="approve" activeArea="Decision workspace"><ApproveWorkspace /></SystemShell>;
}
