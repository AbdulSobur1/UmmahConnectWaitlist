"use client";

import { useEffect, useRef, useState } from "react";
import { TAKEN_SEATS } from "@/lib/constants";
import type { MemberData } from "@/lib/utils";
import SuccessView from "./SuccessView";
import WaitlistForm from "./WaitlistForm";
import styles from "./Waitlist.module.css";

type AppState = {
  view: "form" | "success";
  currentCount: number;
  memberData: MemberData | null;
};

export default function WaitlistPage() {
  const [appState, setAppState] = useState<AppState>({
    view: "form",
    currentCount: TAKEN_SEATS,
    memberData: null,
  });
  const [formLeaving, setFormLeaving] = useState(false);
  const [ready, setReady] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const markReady = () => setReady(true);

    if (sessionStorage.getItem("uc_loaded") === "true") {
      setReady(true);
      return;
    }

    window.addEventListener("uc-loading-exiting", markReady);
    window.addEventListener("uc-loading-complete", markReady);

    return () => {
      window.removeEventListener("uc-loading-exiting", markReady);
      window.removeEventListener("uc-loading-complete", markReady);
      if (transitionTimer.current) {
        clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  function handleSuccess(member: MemberData) {
    setFormLeaving(true);
    transitionTimer.current = setTimeout(() => {
      setAppState({
        view: "success",
        currentCount: member.memberNumber,
        memberData: member,
      });
      setFormLeaving(false);
    }, 250);
  }

  function handleBack() {
    setAppState((current) => ({
      ...current,
      view: "form",
    }));
    window.setTimeout(() => firstFieldRef.current?.focus(), 0);
  }

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
          {appState.view === "form" ? (
            <WaitlistForm
              currentCount={appState.currentCount}
              isLeaving={formLeaving}
              onSuccess={handleSuccess}
              registerFirstField={(field) => {
                firstFieldRef.current = field;
              }}
            />
          ) : appState.memberData ? (
            <SuccessView member={appState.memberData} onBack={handleBack} />
          ) : null}
        </section>

        <div className={styles.arabicFooter} lang="ar" dir="rtl">
          بسم الله الرحمن الرحيم
        </div>
      </main>
    </>
  );
}
