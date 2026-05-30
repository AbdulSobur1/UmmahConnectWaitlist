"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ProgressBar.module.css";

type MilestoneLabels = Record<number, string>;

type ProgressBarProps = {
  current: number;
  goal: number;
  isLoading?: boolean;
  milestoneLabels: MilestoneLabels;
};

function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}

function getMilestone(current: number, milestoneLabels: MilestoneLabels): string {
  return Object.entries(milestoneLabels)
    .map(([threshold, label]) => ({ threshold: Number(threshold), label }))
    .filter((item) => current >= item.threshold)
    .sort((a, b) => b.threshold - a.threshold)[0]?.label ?? "";
}

export default function ProgressBar({ current, goal, isLoading = false, milestoneLabels }: ProgressBarProps) {
  const [displayCount, setDisplayCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayCount(Math.floor(easeOutCubic(progress) * current));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(update);
      }
    };

    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [current]);

  const percent = Math.min((displayCount / goal) * 100, 100);
  const milestone = getMilestone(displayCount, milestoneLabels);

  return (
    <div className={styles.counterBar}>
      <div className={styles.counterTop}>
        <span className={styles.counterLabel}>Founding members so far</span>
        <span className={`${styles.counterNum} ${isLoading ? styles.counterNumLoading : ""}`}>
          {displayCount} <span>/ {goal}</span>
        </span>
      </div>
      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressFill} style={{ width: `${percent}%` }} />
      </div>
      <div className={styles.milestoneLabel}>{milestone}</div>
    </div>
  );
}
