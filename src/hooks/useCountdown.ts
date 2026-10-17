import { useEffect, useState } from "react";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** before: counting down · today: the day has arrived · after: the day has passed */
  phase: "before" | "today" | "after";
}

/**
 * Pure calculation, independent of the visitor's timezone: both instants are
 * absolute (built with an explicit UTC offset), so the browser's own DST
 * rules never enter the maths. Values never go negative.
 */
export function computeCountdown(target: Date, dayEnd: Date, now = Date.now()): Countdown {
  const diff = Math.max(0, target.getTime() - now);
  const phase = now < target.getTime() ? "before" : now < dayEnd.getTime() ? "today" : "after";
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    phase,
  };
}

/** Ticks once per second, aligned to the clock's second boundary; cleans up on unmount. */
export function useCountdown(target: Date, dayEnd: Date): Countdown {
  const [state, setState] = useState(() => computeCountdown(target, dayEnd));

  useEffect(() => {
    let timer = 0;
    const tick = () => {
      const next = computeCountdown(target, dayEnd);
      setState(next);
      if (next.phase !== "after") {
        timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
      }
    };
    tick();
    // re-sync after the tab returns from the background (timers are throttled there)
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        window.clearTimeout(timer);
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [target.getTime(), dayEnd.getTime()]);

  return state;
}
