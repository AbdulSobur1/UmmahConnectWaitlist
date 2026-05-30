"use client";

import { useEffect, useRef, useState } from "react";
import { GOAL } from "@/lib/constants";
import { buildShareText, buildTwitterText } from "@/lib/utils";
import styles from "./Waitlist.module.css";

type SuccessViewProps = {
  message: string;
  count: number;
  email: string;
  onBack: () => void;
};

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/Lr6gnYcJ2tS2bzsSzWPgbS";

function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}

function openExternal(url: string) {
  const popup = window.open(url, "_blank", "noopener,noreferrer");

  if (!popup) {
    window.location.href = url;
  }
}

export default function SuccessView({ message, count, email, onBack }: SuccessViewProps) {
  const [displayCount, setDisplayCount] = useState(Math.max(count - 1, 0));
  const [copyText, setCopyText] = useState("Copy Link");
  const [joinPromptOpen, setJoinPromptOpen] = useState(true);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const duration = 600;
    const start = Math.max(count - 1, 0);
    const target = count;
    const startTime = performance.now();

    const update = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplayCount(Math.floor(start + easeOutCubic(progress) * (target - start)));
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
  }, [count]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.href : "");
  const othersCount = Math.max(displayCount - 1, 0);

  function shareWhatsApp() {
    const text = buildShareText(appUrl);
    openExternal(`https://wa.me/?text=${encodeURIComponent(text)}`);
  }

  async function shareTwitter() {
    const text = buildTwitterText();

    if (navigator.share) {
      try {
        await navigator.share({ text, url: appUrl });
        return;
      } catch {
        // Continue to the X share URL if native sharing is unavailable or cancelled.
      }
    }

    openExternal(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopyText("Copied!");
    } catch {
      const input = document.createElement("textarea");
      input.value = appUrl;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();

      const didCopy = document.execCommand("copy");
      document.body.removeChild(input);
      setCopyText(didCopy ? "Copied!" : "Copy failed");
    }

    window.setTimeout(() => setCopyText("Copy Link"), 2000);
  }

  function joinWhatsAppGroup() {
    openExternal(WHATSAPP_GROUP_URL);
    setJoinPromptOpen(false);
  }

  function emailGroupLink() {
    const subject = "UmmahConnect WhatsApp group";
    const body = `Here is the UmmahConnect WhatsApp group link:\n\n${WHATSAPP_GROUP_URL}`;
    openExternal(`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setJoinPromptOpen(false);
  }

  return (
    <div className={styles.successView} role="alert">
      {joinPromptOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="joinPromptTitle">
          <div className={styles.joinModal}>
            <h3 id="joinPromptTitle">Join the community?</h3>
            <p>Share your waitlist moment first, or join the WhatsApp group now. We can also open an email draft with the link.</p>
            <div className={styles.modalActions}>
              <button className={styles.modalPrimary} type="button" onClick={joinWhatsAppGroup}>
                Join WhatsApp
              </button>
              <button className={styles.modalSecondary} type="button" onClick={emailGroupLink}>
                Email link
              </button>
              <button className={styles.modalText} type="button" onClick={() => setJoinPromptOpen(false)}>
                Maybe later
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.successGreeting} lang="ar" dir="rtl">
        السَّلَامُ عَلَيْكُمْ
      </div>

      <h2 className={styles.successTitle}>
        JazakAllahu
        <br />
        Khayran!
      </h2>

      <p className={styles.successMessage}>
        {message}
        <br />
        We&apos;ll notify you the moment we launch.
      </p>

      <div className={styles.successCount}>
        {count <= 1 ? (
          <>
            You&apos;re the first
            <br />
            on the founding list.
          </>
        ) : (
          <>
            You joined <strong>{othersCount}</strong> {othersCount === 1 ? "other" : "others"}
            <br />
            on the founding list.
          </>
        )}
      </div>

      <div className={styles.divider} />

      <p className={styles.hadith}>
        &quot;The best of people are those who are most beneficial to people.&quot;
        <cite>— Prophet Muhammad ﷺ</cite>
      </p>

      <div className={styles.shareRow}>
        <button className={styles.shareBtn} type="button" onClick={shareWhatsApp} aria-label="Share on WhatsApp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
          WhatsApp
        </button>
        <button className={styles.shareBtn} type="button" onClick={shareTwitter} aria-label="Share on X">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          Share
        </button>
        <button className={styles.shareBtn} type="button" onClick={copyLink} aria-label="Copy waitlist link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
          <span>{copyText}</span>
        </button>
      </div>

      <button className={styles.backLink} type="button" onClick={onBack}>
        ← Back to waitlist
      </button>

      <span className={styles.goalNote} aria-hidden="true">{GOAL} founding spots</span>
    </div>
  );
}
