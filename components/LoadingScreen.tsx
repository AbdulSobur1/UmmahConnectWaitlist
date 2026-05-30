"use client";

import { useEffect, useState } from "react";
import styles from "./LoadingScreen.module.css";

type LoadingState = "hidden" | "visible" | "exiting";

export default function LoadingScreen() {
  const [state, setState] = useState<LoadingState>("hidden");

  useEffect(() => {
    if (sessionStorage.getItem("uc_loaded") === "true") {
      window.dispatchEvent(new CustomEvent("uc-loading-complete"));
      return;
    }

    let exitTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;
    setState("visible");

    exitTimer = setTimeout(() => {
      setState("exiting");
      sessionStorage.setItem("uc_loaded", "true");
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("uc-loading-exiting"));
      }, 300);

      hideTimer = setTimeout(() => {
        setState("hidden");
        window.dispatchEvent(new CustomEvent("uc-loading-complete"));
      }, 400);
    }, 2200);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (state === "hidden") {
    return null;
  }

  return (
    <div
      className={`${styles.loading} ${state === "exiting" ? styles.exiting : ""}`}
      role="status"
      aria-label="Loading Ummah Connect"
    >
      <div className={styles.bg} />
      <div className={styles.geo} />
      <div className={styles.content}>
        <div className={styles.greeting} lang="ar" dir="rtl" aria-live="polite">
          السَّلَامُ عَلَيْكُمْ
        </div>
        <div className={styles.transliteration}>Assalamu Alaikum</div>
        <div className={styles.dots} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
