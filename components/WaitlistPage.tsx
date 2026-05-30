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
  successEmail: string;
};

type WaitlistResponse = {
  count?: number;
  success?: boolean;
  message?: string;
  error?: string;
};

type WaitlistPageProps = {
  currentCount: number;
  isCountLoading: boolean;
  countError: string;
  onCountChange: (count: number) => void;
};

async function readJson(response: Response): Promise<WaitlistResponse> {
  return (await response.json()) as WaitlistResponse;
}

export default function WaitlistPage({
  currentCount,
  isCountLoading,
  countError,
  onCountChange,
}: WaitlistPageProps) {
  const [appState, setAppState] = useState<AppState>({
    view: "form",
    currentCount,
    successMessage: "",
    successEmail: "",
  });
  const [formLeaving, setFormLeaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [ready, setReady] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const readyTimer = window.setTimeout(() => setReady(true), 150);

    return () => {
      clearTimeout(readyTimer);
      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    setAppState((current) => ({ ...current, currentCount }));
  }, [currentCount]);

  useEffect(() => {
    setFormError(countError);
  }, [countError]);

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
      onCountChange(count);
      setFormLeaving(true);
      transitionTimer.current = setTimeout(() => {
        setAppState({
          view: "success",
          currentCount: count,
          successEmail: values.email,
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
            <SuccessView
              count={appState.currentCount}
              email={appState.successEmail}
              message={appState.successMessage}
              onBack={handleBack}
            />
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
              <ProgressBar
                current={appState.currentCount}
                goal={GOAL}
                isLoading={isCountLoading}
                milestoneLabels={MILESTONE_LABELS}
              />
            </div>
          ) : (
            <WaitlistForm
              currentCount={appState.currentCount}
              isCountLoading={isCountLoading}
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
