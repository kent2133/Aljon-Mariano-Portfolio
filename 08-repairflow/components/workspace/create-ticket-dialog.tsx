"use client";

import { ArrowRight, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { CreateTicketInput } from "@/lib/repair-types";
import styles from "./workspace.module.css";

interface CreateTicketDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: CreateTicketInput) => void;
}

export function CreateTicketDialog({ open, onClose, onCreate }: CreateTicketDialogProps) {
  const [device, setDevice] = useState("");
  const [category, setCategory] = useState("Smartphone");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState<CreateTicketInput["priority"]>("standard");

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  function submit(event: FormEvent) {
    event.preventDefault();
    onCreate({ device: device.trim(), deviceCategory: category, issue: issue.trim(), priority });
    setDevice("");
    setIssue("");
    setPriority("standard");
  }

  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={styles.dialogCard} role="dialog" aria-modal="true" aria-labelledby="new-ticket-title">
        <div className={styles.dialogHeader}>
          <div>
            <p className={styles.eyebrow}>New service request</p>
            <h2 id="new-ticket-title">Tell us what needs attention</h2>
          </div>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close new ticket form">
            <X size={19} />
          </button>
        </div>
        <form className={styles.dialogForm} onSubmit={submit}>
          <div className={styles.twoFields}>
            <label className={styles.field}>
              <span>Device name</span>
              <input
                value={device}
                onChange={(event) => setDevice(event.target.value)}
                placeholder="Example: Galaxy S25"
                minLength={2}
                autoFocus
                required
              />
            </label>
            <label className={styles.field}>
              <span>Device category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option>Smartphone</option>
                <option>Laptop</option>
                <option>Tablet</option>
                <option>Headphones</option>
                <option>Console</option>
                <option>Other electronics</option>
              </select>
            </label>
          </div>
          <label className={styles.field}>
            <span>What is happening?</span>
            <textarea
              value={issue}
              onChange={(event) => setIssue(event.target.value)}
              placeholder="Describe the symptoms, when they started, and anything that may have caused them."
              rows={5}
              minLength={12}
              required
            />
          </label>
          <fieldset className={styles.priorityFieldset}>
            <legend>Service priority</legend>
            <label className={priority === "standard" ? styles.priorityOptionActive : styles.priorityOption}>
              <input type="radio" name="priority" value="standard" checked={priority === "standard"} onChange={() => setPriority("standard")} />
              <span><strong>Standard</strong><small>Normal workshop queue</small></span>
            </label>
            <label className={priority === "urgent" ? styles.priorityOptionActive : styles.priorityOption}>
              <input type="radio" name="priority" value="urgent" checked={priority === "urgent"} onChange={() => setPriority("urgent")} />
              <span><strong>Urgent</strong><small>Prioritized service review</small></span>
            </label>
          </fieldset>
          <div className={styles.dialogFooter}>
            <p>This offline portfolio mode stores changes only in this browser.</p>
            <button type="submit" className={styles.primaryButton}>
              Create ticket <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
