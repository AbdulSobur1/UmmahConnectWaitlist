"use client";

import { useEffect, useState } from "react";
import WaitlistPage from "@/components/WaitlistPage";

type WaitlistResponse = {
  count?: number;
  error?: string;
};

async function readJson(response: Response): Promise<WaitlistResponse> {
  return (await response.json()) as WaitlistResponse;
}

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [isCountLoading, setIsCountLoading] = useState(true);
  const [countError, setCountError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let fadeTimer: number | undefined;

    async function loadIntro() {
      const minimumDelay = new Promise<void>((resolve) => {
        window.setTimeout(resolve, 1800);
      });

      const countRequest = fetch("/api/waitlist", { method: "GET", cache: "no-store" })
        .then(readJson)
        .then((data) => {
          if (!isMounted) return;

          if (typeof data.count === "number") {
            setWaitlistCount(data.count);
            setCountError("");
          } else {
            setCountError(data.error ?? "Unable to load the live waitlist count.");
          }
        })
        .catch(() => {
          if (isMounted) {
            setCountError("Unable to connect to the waitlist. Please try again.");
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsCountLoading(false);
          }
        });

      await Promise.all([minimumDelay, countRequest]);

      if (!isMounted) return;

      setIsFading(true);
      fadeTimer = window.setTimeout(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      }, 600);
    }

    loadIntro();

    return () => {
      isMounted = false;
      if (fadeTimer !== undefined) {
        window.clearTimeout(fadeTimer);
      }
    };
  }, []);

  return (
    <>
      {isLoading ? (
        <div
          className={`fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-[#0B0F0E] transition-opacity duration-[600ms] ease-out ${
            isFading ? "opacity-0" : "opacity-100"
          }`}
          role="status"
          aria-label="Loading UmmahConnect"
        >
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="font-serif text-3xl font-semibold text-[#F5D78A] sm:text-4xl">
              Ummah<span className="text-white">Connect</span>
            </div>
            <div className="animate-pulse text-xl text-white/70" lang="ar" dir="rtl">
              بسم الله الرحمن الرحيم
            </div>
            <div className="h-6 w-6 rounded-full border-2 border-white/15 border-t-[#F5D78A] animate-spin" />
          </div>
        </div>
      ) : null}
      <WaitlistPage
        countError={countError}
        currentCount={waitlistCount}
        isCountLoading={isCountLoading}
        onCountChange={setWaitlistCount}
      />
    </>
  );
}
