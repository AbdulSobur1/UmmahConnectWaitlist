"use client";

import { useEffect, useRef, useState } from "react";
import { GOAL, MILESTONE_LABELS } from "@/lib/constants";
import ProgressBar from "./ProgressBar";
import SuccessView from "./SuccessView";
import WaitlistForm, { type WaitlistFormValues } from "./WaitlistForm";
import styles from "./Waitlist.module.css";

type AppState = {
  view: "form" | "success";
  currentCount: number;
  successMessage: string;
};

type WaitlistResponse = {
  count?: number;
  success?: boolean;
  message?: string;
  error?: string;
};

async function readJson(response: Response): Promise<WaitlistResponse> {
  return (await response.json()) as WaitlistResponse;
}

export default function WaitlistPage() {
  const [appState, setAppState] = useState<AppState>({
    view: "form",
    currentCount: 0,
    successMessage: "",
  });
  const [formLeaving, setFormLeaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [ready, setReady] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const markReady = () => setReady(true);

    if (sessionStorage.getItem("uc_loaded") === "true") {
      setReady(true);
    } else {
      window.addEventListener("uc-loading-exiting", markReady);
      window.addEventListener("uc-loading-complete", markReady);
    }

    return () => {
      window.removeEventListener("uc-loading-exiting", markReady);
      window.removeEventListener("uc-loading-complete", markReady);
      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadCount() {
      try {
        const response = await fetch("/api/waitlist", { method: "GET", cache: "no-store" });
        const data = await readJson(response);

        if (!ignore && response.ok && typeof data.count === "number") {
          setAppState((current) => ({ ...current, currentCount: data.count }));
        } else if (!ignore) {
          setFormError(data.error ?? "Unable to load the live waitlist count.");
        }
      } catch {
        if (!ignore) {
          setFormError("Unable to connect to the waitlist. Please try again.");
        }
      }
    }

    loadCount();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(values: WaitlistFormValues): Promise<boolean> {
    setIsSubmitting(true);
    setFormError("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await readJson(response);

      if (!response.ok) {
        setFormError(data.error ?? "Unable to join the waitlist right now.");
        return false;
      }

      const count = typeof data.count === "number" ? data.count : appState.currentCount;
      setFormLeaving(true);
      transitionTimer.current = setTimeout(() => {
        setAppState({
          view: "success",
          currentCount: count,
          successMessage: data.message ?? "You're on the list! جزاك الله خيراً",
        });
        setFormLeaving(false);
      }, 250);

      return true;
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    setAppState((current) => ({
      ...current,
      view: "form",
    }));
    setFormError("");
    window.setTimeout(() => firstFieldRef.current?.focus(), 0);
  }

  const isFull = appState.currentCount >= GOAL;

  return (
    <>
      <div className={styles.bg} />
      <div className={styles.bgGeo} />
      <nav className={styles.nav}>
        <div className={styles.logo}>
          Ummah<span>Connect</span>
        </div>
        <div className={styles.navBadge}>Coming Soon</div>
      </nav>

      <main className={`${styles.page} ${ready ? styles.pageReady : ""}`}>
        <section className={styles.card} id="mainCard" aria-label="Ummah Connect founding members waitlist">
          {appState.view === "success" ? (
            <SuccessView message={appState.successMessage} count={appState.currentCount} onBack={handleBack} />
          ) : isFull ? (
            <div className={styles.formView}>
              <div className={styles.formGreeting} lang="ar" dir="rtl">
                السَّلَامُ عَلَيْكُمْ
              </div>
              <h1 className={styles.cardTitle}>
                Founding spots
                <br />
                <span>are filled</span>
              </h1>
              <p className={styles.cardSub}>
                The first 40 founding member spots have been reserved. Thank you for the support.
              </p>
              <ProgressBar current={appState.currentCount} goal={GOAL} milestoneLabels={MILESTONE_LABELS} />
            </div>
          ) : (
            <WaitlistForm
              currentCount={appState.currentCount}
              isLeaving={formLeaving}
              isLoading={isSubmitting}
              errorMessage={formError}
              onSubmit={handleSubmit}
              registerFirstField={(field) => {
                firstFieldRef.current = field;
              }}
            />
          )}
        </section>

        <div className={styles.arabicFooter} lang="ar" dir="rtl">
          بسم الله الرحمن الرحيم
        </div>
      </main>
    </>
  );
}
