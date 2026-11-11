"use client";

import { ArrowRight, GitBranch, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRepairStore } from "@/lib/repair-store";
import {
  getNextTutorialStep,
  getTutorialTicket,
  isDeclinedDecision,
  isTutorialStepComplete,
  TUTORIAL_MILESTONES,
  TUTORIAL_START_STEP,
  TUTORIAL_TICKET_ID,
  tutorialCompletedMessage,
  tutorialSteps,
  type TutorialStepId,
} from "./workspace-guide-logic";
import styles from "./workspace.module.css";

const GUIDE_KEY = "repairflow-workspace-guide-seen-v3";

type GuideMode = "intro" | "quest" | "declined" | null;

export function WorkspaceGuide({ replaySignal }: { replaySignal: number }) {
  const { state, dispatch } = useRepairStore();
  const [mode, setMode] = useState<GuideMode>(null);
  const [stepId, setStepId] = useState<TutorialStepId>(TUTORIAL_START_STEP);
  const [completedTasks, setCompletedTasks] = useState(0);

  const tutorialTicket = useMemo(() => getTutorialTicket(state), [state]);
  const step = tutorialSteps[stepId];
  const stepComplete = isTutorialStepComplete(stepId, state);
  const nextStep = stepComplete ? getNextTutorialStep(stepId, state) : null;
  const finalStepComplete = stepComplete && nextStep === null;
  const declinedDecision = stepComplete && isDeclinedDecision(stepId, state);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(GUIDE_KEY) !== "yes") setMode("intro");
    } catch {
      setMode("intro");
    }
  }, []);

  useEffect(() => {
    if (replaySignal > 0) {
      setStepId(TUTORIAL_START_STEP);
      setCompletedTasks(0);
      setMode("intro");
    }
  }, [replaySignal]);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>("[data-tour-active]").forEach((target) => {
      delete target.dataset.tourActive;
    });

    if (mode !== "quest" || stepComplete) return;

    if (step.target !== "role-menu" && state.selectedTicketId !== TUTORIAL_TICKET_ID) {
      dispatch({ type: "select-ticket", ticketId: TUTORIAL_TICKET_ID });
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
      if (!target) return;

      target.dataset.tourActive = "true";
      const bounds = target.getBoundingClientRect();
      const topBoundary = 92;
      const bottomBoundary = window.innerHeight - 92;
      if (bounds.top < topBoundary || bounds.bottom > bottomBoundary) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.querySelectorAll<HTMLElement>("[data-tour-active]").forEach((target) => {
        delete target.dataset.tourActive;
      });
    };
  }, [
    mode,
    state.currentRole,
    state.selectedTicketId,
    step.target,
    stepComplete,
    stepId,
    tutorialTicket?.assignedTechnicianId,
    tutorialTicket?.diagnosis,
    tutorialTicket?.quote?.status,
    tutorialTicket?.status,
  ]);

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
    dispatch({ type: "start-tutorial" });
    setStepId(TUTORIAL_START_STEP);
    setCompletedTasks(0);
    setMode("quest");
  }

  function continueQuest() {
    if (!stepComplete) return;
    if (!nextStep) {
      dismissGuide();
      return;
    }

    setStepId(nextStep);
    setCompletedTasks((current) => current + 1);
  }

  function finishDeclinedPath() {
    setCompletedTasks((current) => current + 1);
    setMode("declined");
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
          <h2 id="workspace-guide-title">Learn RepairFlow across all three roles.</h2>
          <p>
            Route a repair as Administrator, diagnose it as Technician, and decide as Customer. Approve and decline are both supported, so the guide follows the workflow you choose. Starting restores dedicated tutorial data.
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

  if (mode === "declined") {
    return (
      <aside className={styles.questPanel} aria-live="polite" aria-label="Interactive RepairFlow tutorial complete">
        <button type="button" className={styles.questClose} onClick={dismissGuide} aria-label="Close interactive tutorial">
          <X size={16} />
        </button>
        <div className={styles.questHeader}>
          <span><GitBranch size={14} /> Decision path complete</span>
          <small>{completedTasks} tasks</small>
        </div>
        <p className={styles.eyebrow}>Valid customer outcome</p>
        <h2>The declined quote was handled correctly.</h2>
        <p>RepairFlow recorded the customer's decision, returned the ticket for review, and preserved the complete audit trail. You can replay later to explore the revision or approval path.</p>
        <GuideProgress milestone={3} />
        <button type="button" className={styles.primaryButton} onClick={dismissGuide}>
          Finish tutorial <ArrowRight size={16} />
        </button>
      </aside>
    );
  }

  const completedTitle = finalStepComplete
    ? "Repair tutorial complete."
    : declinedDecision
      ? "Decision recorded. Choose the next path."
      : "Nice work. Ready for the next step?";

  return (
    <aside className={styles.questPanel} aria-live="polite" aria-label="Interactive RepairFlow tutorial">
      <button type="button" className={styles.questClose} onClick={dismissGuide} aria-label="End interactive tutorial">
        <X size={16} />
      </button>
      <div className={styles.questHeader}>
        <span><Sparkles size={14} /> Interactive tutorial</span>
        <small>Step {completedTasks + 1}</small>
      </div>
      <p className={styles.eyebrow}>{stepComplete ? "Task completed" : step.eyebrow}</p>
      <h2>{stepComplete ? completedTitle : step.title}</h2>
      <p>{stepComplete ? tutorialCompletedMessage(stepId, state) : step.text}</p>
      <GuideProgress milestone={step.milestone} complete={finalStepComplete} />
      {stepComplete ? (
        declinedDecision ? (
          <div className={styles.questBranchActions}>
            <button type="button" className={styles.primaryButton} onClick={continueQuest}>
              Follow revision workflow <GitBranch size={16} />
            </button>
            <button type="button" className={styles.secondaryButton} onClick={finishDeclinedPath}>
              Finish with quote declined
            </button>
          </div>
        ) : (
          <button type="button" className={styles.primaryButton} onClick={continueQuest}>
            {finalStepComplete ? "Finish tutorial" : "Continue"} <ArrowRight size={16} />
          </button>
        )
      ) : (
        <span className={styles.questWaiting}><i /> Waiting for you to complete this task</span>
      )}
    </aside>
  );
}

function GuideProgress({ milestone, complete = false }: { milestone: number; complete?: boolean }) {
  return (
    <div className={styles.guideProgress} aria-label={`Tutorial workflow phase ${milestone + 1} of ${TUTORIAL_MILESTONES.length}`}>
      {TUTORIAL_MILESTONES.map((label, index) => (
        <span
          key={label}
          title={label}
          className={complete || index < milestone ? styles.guideDotComplete : index === milestone ? styles.guideDotActive : styles.guideDot}
        />
      ))}
    </div>
  );
}
