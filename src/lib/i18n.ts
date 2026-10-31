/**
 * English / Hindi switch. The choice is kept per guest (localStorage) and
 * mirrored on <html lang>, so fonts and styles can follow it in CSS.
 *
 * Components call `useT()` and write both versions side by side:
 *   const t = useT();  t("Wedding Ceremony", "विवाह समारोह")
 */
import { useSyncExternalStore } from "react";
import { wedding } from "../config/wedding";

export type Lang = "en" | "hi";

const KEY = "invite-lang";
const listeners = new Set<() => void>();

function initial(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "en" || saved === "hi") return saved;
  } catch {
    /* storage blocked: fall back to English */
  }
  return "en";
}

let lang: Lang = typeof window === "undefined" ? "en" : initial();
if (typeof document !== "undefined") document.documentElement.lang = lang;

export const getLang = () => lang;

export function setLang(next: Lang) {
  if (next === lang) return;
  lang = next;
  document.documentElement.lang = next;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* not remembered, still switches */
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useLang = () => useSyncExternalStore(subscribe, getLang, () => "en" as Lang);

/** Returns a picker: t(english, hindi). */
export function useT() {
  const l = useLang();
  return (en: string, hi: string) => (l === "hi" ? hi : en);
}

/** The couple's names in the current language. */
export const NAMES = {
  en: { groom: wedding.groom, bride: wedding.bride },
  hi: { groom: "अरुण", bride: "प्रतिमा" },
} as const;

export function useNames() {
  return NAMES[useLang()];
}

/** Dates in the current language, always in the venue's timezone. */
export function useDateFormat() {
  const l = useLang();
  return (iso: string, opts: Intl.DateTimeFormatOptions) => {
    const [y, m, d] = iso.split("-").map(Number);
    // noon UTC never crosses a date line for IST
    return new Intl.DateTimeFormat(l === "hi" ? "hi-IN" : "en-GB", { ...opts, timeZone: wedding.timezone }).format(new Date(Date.UTC(y, m - 1, d, 12)));
  };
}
