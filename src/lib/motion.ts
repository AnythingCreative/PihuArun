/**
 * Motion system. One curve family and a short list of durations so every
 * scene moves with the same voice. CSS mirrors these in globals.css.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const EASE = {
  out: "expo.out",
  soft: "power3.out",
  inOut: "power2.inOut",
  none: "none",
} as const;

export const DUR = { quick: 0.35, base: 0.8, slow: 1.6 } as const;

/** Media queries used with gsap.matchMedia(). */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduce: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
} as const;

export { gsap, ScrollTrigger };
