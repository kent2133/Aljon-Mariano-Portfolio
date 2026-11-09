"use client";

import { ArrowRight, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRepairStore } from "@/lib/repair-store";
import styles from "./workspace.module.css";

const GUIDE_KEY = "repairflow-workspace-guide-seen-v2";

const questSteps = [
  {
    eyebrow: "Quest 1 of 5",
    title: "Switch to the Customer view",
    text: "Open Viewing as in the top-right corner and select Customer. This reveals Maya's repairs and approval tasks.",
    target: "role-menu",
  },
  {
    eyebrow: "Quest 2 of 5",
    title: "Approve the Pixel 9 Pro quote",
    text: "The Pixel 9 Pro ticket is ready for a decision. Review its quote, then choose Approve quote in the detail panel.",
    target: "next-action",
  },
  {
    eyebrow: "Quest 3 of 5",
    title: "Switch to the Technician view",
    text: "Return to Viewing as and select Technician. The same approved repair will remain selected for workshop action.",
    target: "role-menu",
  },
  {
    eyebrow: "Quest 4 of 5",
    title: "Start the approved repair",
    text: "Move the device to the workbench with Start repair. Watch the status, timeline, and dashboard metrics update together.",
    target: "next-action",
  },
  {
    eyebrow: "Quest 5 of 5",
    title: "Complete the workshop record",
    text: "Describe the completed work and final test, then mark the device ready for pickup.",
    target: "next-action",
  },
] as const;

type GuideMode = "intro" | "quest" | null;

export function WorkspaceGuide({ replaySignal }: { replaySignal: number }) {
  const { state, dispatch } = useRepairStore();
  const [mode, setMode] = useState<GuideMode>(null);
  const [step, setStep] = useState(0);

  const tutorialTicket = useMemo(
    () => state.tickets.find((ticket) => ticket.id === "RF-1048"),
    [state.tickets],
  );
  const stepComplete = useMemo(() => {
    if (step === 0) return state.currentRole === "customer";
    if (step === 1) return ["approved", "in-repair", "ready-for-pickup", "completed"].includes(tutorialTicket?.status ?? "");
    if (step === 2) return state.currentRole === "technician";
    if (step === 3) return ["in-repair", "ready-for-pickup", "completed"].includes(tutorialTicket?.status ?? "");
    return ["ready-for-pickup", "completed"].includes(tutorialTicket?.status ?? "");
  }, [state.currentRole, step, tutorialTicket?.status]);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(GUIDE_KEY) !== "yes") setMode("intro");
    } catch {
      setMode("intro");
    }
  }, []);

  useEffect(() => {
    if (replaySignal > 0) {
      setStep(0);
      setMode("intro");
    }
  }, [replaySignal]);

  useEffect(() => {
    if (mode !== "quest") return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(`[data-tour="${questSteps[step].target}"]`);
      if (!target) return;
      target.dataset.tourActive = "true";
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.querySelectorAll<HTMLElement>("[data-tour-active]").forEach((target) => {
        delete target.dataset.tourActive;
      });
    };
  }, [mode, state.currentRole, step, tutorialTicket?.status]);

  function rememberGuide() {
    try {
      window.localStorage.setItem(GUIDE_KEY, "yes");
    } catch {
      // The guide can still be dismissed when storage is unavailable.
    }
  }

  function dismissGuide() {
    rememberGuide();
    setMode(null);
  }

  function startQuest() {
    dispatch({ type: "reset-demo" });
    setStep(0);
    setMode("quest");
  }

  function continueQuest() {
    if (!stepComplete) return;
    if (step === questSteps.length - 1) {
      dismissGuide();
      return;
    }
    setStep((current) => current + 1);
  }

  if (mode === null) return null;

  if (mode === "intro") {
    return (
      <div className={styles.guideBackdrop} role="presentation">
        <section className={styles.guideCard} role="dialog" aria-modal="true" aria-labelledby="workspace-guide-title">
          <button type="button" className={styles.iconButton} onClick={dismissGuide} aria-label="Close workspace guide">
            <X size={18} />
          </button>
          <div className={styles.guideVisual} aria-hidden="true">
            <span className={styles.guideOrbit} />
            <span className={styles.guideTicket}>RF</span>
            <Sparkles size={20} />
          </div>
          <p className={styles.eyebrow}>Interactive product tutorial</p>
          <h2 id="workspace-guide-title">Learn RepairFlow by completing a repair.</h2>
          <p>
            The tutorial gives you one task at a time, waits for you to perform it, and confirms the result before continuing. Starting it restores the seeded portfolio data.
          </p>
          <div className={styles.guideActions}>
            <button type="button" className={styles.secondaryButton} onClick={dismissGuide}>
              Explore on my own
            </button>
            <button type="button" className={styles.primaryButton} onClick={startQuest}>
              Start interactive tutorial <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </div>
    );
  }

  const quest = questSteps[step];

  return (
    <aside className={styles.questPanel} aria-live="polite" aria-label="Interactive RepairFlow tutorial">
      <button type="button" className={styles.questClose} onClick={dismissGuide} aria-label="End interactive tutorial">
        <X size={16} />
      </button>
      <div className={styles.questHeader}>
        <span><Sparkles size={14} /> Interactive tutorial</span>
        <small>{step + 1} / {questSteps.length}</small>
      </div>
      <p className={styles.eyebrow}>{stepComplete ? "Task completed" : quest.eyebrow}</p>
      <h2>{stepComplete ? (step === questSteps.length - 1 ? "Repair tutorial complete." : "Nice work. Ready for the next step?") : quest.title}</h2>
      <p>{stepComplete ? completedMessage(step) : quest.text}</p>
      <div className={styles.guideProgress} aria-label={`Tutorial step ${step + 1} of ${questSteps.length}`}>
        {questSteps.map((item, index) => (
          <span key={item.title} className={index <= step ? styles.guideDotActive : styles.guideDot} />
        ))}
      </div>
      {stepComplete ? (
        <button type="button" className={styles.primaryButton} onClick={continueQuest}>
          {step === questSteps.length - 1 ? "Finish tutorial" : "Continue"} <ArrowRight size={16} />
        </button>
      ) : (
        <span className={styles.questWaiting}><i /> Waiting for you to complete this task</span>
      )}
    </aside>
  );
}

function completedMessage(step: number) {
  if (step === 0) return "You opened the same ticket data from the customer's point of view.";
  if (step === 1) return "The approval moved the repair forward and added a new timeline event.";
  if (step === 2) return "You are now looking at the approved job from the workshop side.";
  if (step === 3) return "RepairFlow moved the job onto the workbench and refreshed its operational metrics.";
  return "You documented the finished work and returned the device to the customer handoff queue.";
}
