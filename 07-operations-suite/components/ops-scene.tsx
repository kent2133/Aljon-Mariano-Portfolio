"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";
import styles from "./ops-scene.module.css";

const panels = [
  { code: "PD", title: "SERVICE", value: "24 open", x: "8%", y: "14%", z: "40px" },
  { code: "SF", title: "STOCK", value: "98.4%", x: "62%", y: "8%", z: "74px" },
  { code: "AP", title: "APPROVAL", value: "07 due", x: "70%", y: "57%", z: "28px" },
  { code: "CQ", title: "QUEUE", value: "11 min", x: "11%", y: "67%", z: "62px" },
  { code: "RO", title: "FIELD", value: "16 live", x: "42%", y: "39%", z: "108px" },
];

export function OpsScene() {
  const scene = useRef<HTMLDivElement>(null);

  function move(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    scene.current?.style.setProperty("--scene-x", `${x * 9}deg`);
    scene.current?.style.setProperty("--scene-y", `${y * -7}deg`);
  }

  function reset() {
    scene.current?.style.setProperty("--scene-x", "0deg");
    scene.current?.style.setProperty("--scene-y", "0deg");
  }

  return (
    <div
      className={styles.viewport}
      onPointerMove={move}
      onPointerLeave={reset}
      role="img"
      aria-label="Interactive three-dimensional topology connecting the five business systems to one API core"
    >
      <div className={styles.scene} ref={scene}>
        <div className={styles.floor}><i></i><i></i><i></i></div>
        <svg className={styles.rails} viewBox="0 0 100 100" aria-hidden="true">
          <path d="M18 24 L49 49 L73 20 M49 49 L80 67 M49 49 L20 76" />
          <circle cx="49" cy="49" r="27" />
        </svg>
        {panels.map((panel, index) => (
          <article className={styles.panel} key={panel.code} style={{ left: panel.x, top: panel.y, "--z": panel.z, "--delay": `${index * -0.8}s` } as CSSProperties}>
            <div><span>{panel.code}</span><i></i></div>
            <small>{panel.title}</small>
            <strong>{panel.value}</strong>
            <b>{String(index + 1).padStart(2, "0")}</b>
          </article>
        ))}
        <div className={styles.core}><span></span><i></i><strong>OPS</strong><small>API CORE</small></div>
      </div>
      <div className={styles.hint}><span></span> Move to inspect the suite</div>
    </div>
  );
}
