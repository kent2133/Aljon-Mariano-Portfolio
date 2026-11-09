"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { roleLabels } from "@/lib/repair-data";
import type { RepairRole } from "@/lib/repair-types";
import styles from "./workspace.module.css";

const roles = Object.keys(roleLabels) as RepairRole[];

interface RoleMenuProps {
  value: RepairRole;
  onChange: (role: RepairRole) => void;
}

export function RoleMenu({ value, onChange }: RoleMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (open) firstItemRef.current?.focus();
  }, [open]);

  return (
    <div className={styles.roleMenu} ref={rootRef} data-tour="role-menu">
      <span className={styles.roleCaption}>Viewing as</span>
      <button
        type="button"
        className={styles.roleTrigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="workspace-role-menu"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{roleLabels[value]}</span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>
      {open ? (
        <div id="workspace-role-menu" className={styles.rolePopover} role="menu" aria-label="Choose workspace role">
          <p className={styles.rolePopoverLabel}>Preview a workflow</p>
          {roles.map((role, index) => (
            <button
              key={role}
              ref={index === 0 ? firstItemRef : undefined}
              type="button"
              role="menuitemradio"
              aria-checked={value === role}
              className={styles.roleOption}
              onClick={() => {
                onChange(role);
                setOpen(false);
              }}
            >
              <span>
                <strong>{roleLabels[role]}</strong>
                <small>{roleDescription(role)}</small>
              </span>
              {value === role ? <Check size={17} aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function roleDescription(role: RepairRole): string {
  if (role === "customer") return "Submit repairs and approve quotes";
  if (role === "technician") return "Diagnose and complete workshop jobs";
  return "Route work and monitor the operation";
}
