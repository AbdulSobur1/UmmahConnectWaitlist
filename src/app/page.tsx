"use client";

import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";
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
      {isLoading ? <LoadingScreen isFading={isFading} /> : null}
      <WaitlistPage
        countError={countError}
        currentCount={waitlistCount}
        isCountLoading={isCountLoading}
        onCountChange={setWaitlistCount}
      />
    </>
  );
}
