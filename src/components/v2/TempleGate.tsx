import { useEffect, useRef, useState } from "react";
import { wedding } from "../../config/wedding";
import { GaneshMotif } from "../ornaments/Ornaments";
import { ScrollTrigger } from "../../lib/motion";
import { art, publicUrl } from "../../data/assets";

/** Painted carved doors (public/art/doors.jpg) replace the drawn leaves once supplied. */
const doorsArt = art("doors", "");

/**
 * Opening gate — two carved temple doors fill the screen. A tap, a scroll,
 * a key press (or a few seconds of waiting) swings them open onto the
 * Kailash dawn behind. Reduced motion: the doors simply fade away.
 */
function DoorLeaf({ side }: { side: "l" | "r" }) {
  const id = `wood-${side}`;
  return (
    <svg className={`gate__door gate__door--${side}`} viewBox="0 0 300 800" preserveAspectRatio="none" aria-hidden focusable="false">
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor="#4a2410" />
          <stop offset="0.45" stopColor="#7a3f1b" />
          <stop offset="0.55" stopColor="#6b3416" />
          <stop offset="1" stopColor="#3b1c0c" />
        </linearGradient>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff0b8" />
          <stop offset="0.4" stopColor="#e0a526" />
          <stop offset="1" stopColor="#8a5a12" />
        </linearGradient>
        <pattern id={`${id}-grain`} width="300" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 8 Q75 2 150 9 T300 7 M0 24 Q90 30 170 22 T300 26" stroke="#2a1206" strokeOpacity="0.35" fill="none" />
        </pattern>
      </defs>
      <rect width="300" height="800" fill={`url(#${id})`} />
      <rect width="300" height="800" fill={`url(#${id}-grain)`} />
      <rect x="14" y="14" width="272" height="772" fill="none" stroke={`url(#${id}-brass)`} strokeWidth="6" />
      {[40, 300, 560].map((y, i) => (
        <g key={y}>
          <rect x="40" y={y} width="220" height={i === 1 ? 220 : 200} rx="6" fill="#00000030" stroke="#2a1206" strokeWidth="3" />
          <path
            d={`M60 ${y + (i === 1 ? 200 : 180)} V${y + 70} Q60 ${y + 20} 150 ${y + 16} Q240 ${y + 20} 240 ${y + 70} V${y + (i === 1 ? 200 : 180)}Z`}
            fill="#ffffff08"
            stroke={`url(#${id}-brass)`}
            strokeWidth="2.5"
          />
          <circle cx="150" cy={y + (i === 1 ? 118 : 108)} r="34" fill="none" stroke={`url(#${id}-brass)`} strokeWidth="2" />
          {Array.from({ length: 12 }, (_, k) => {
            const a = (k / 12) * Math.PI * 2;
            const cy = y + (i === 1 ? 118 : 108);
            return <ellipse key={k} cx={150 + Math.cos(a) * 22} cy={cy + Math.sin(a) * 22} rx="7" ry="3" transform={`rotate(${(a * 180) / Math.PI} ${150 + Math.cos(a) * 22} ${cy + Math.sin(a) * 22})`} fill={`url(#${id}-brass)`} />;
          })}
          <circle cx="150" cy={y + (i === 1 ? 118 : 108)} r="8" fill={`url(#${id}-brass)`} />
        </g>
      ))}
      {/* brass studs */}
      {[26, 274].map((x) => Array.from({ length: 16 }, (_, k) => <circle key={`${x}-${k}`} cx={x} cy={44 + k * 48} r="5" fill={`url(#${id}-brass)`} />))}
      {/* knocker ring on the meeting edge */}
      <g transform={`translate(${side === "l" ? 262 : 38} 410)`}>
        <circle r="14" fill={`url(#${id}-brass)`} />
        <circle cy="34" r="22" fill="none" stroke={`url(#${id}-brass)`} strokeWidth="6" />
      </g>
    </svg>
  );
}

/** A link to a section (e.g. …/#details) goes straight there: the doors are only for the front page. */
const SECTIONS = ["blessings", "story", "traditions", "wedding-day", "details", "wishes", "blessing"];
const deepLink = () => SECTIONS.includes(window.location.hash.slice(1));

export function TempleGate() {
  const [state, setState] = useState<"closed" | "opening" | "open">(() => (deepLink() ? "open" : "closed"));

  // skipped doors still count as opened, so the hero's entrance and other listeners behave the same
  useEffect(() => {
    if (state !== "open" || document.documentElement.classList.contains("gate-opened")) return;
    document.documentElement.classList.add("gate-opened");
    window.dispatchEvent(new Event("gate:open"));
  }, [state]);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state !== "closed") return;
    const root = document.documentElement;
    root.classList.add("gate-locked");
    // the invitation always begins at the doors, even after a reload mid-page
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const open = () => setState("opening");
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", " ", "ArrowDown", "PageDown", "Escape"].includes(e.key)) open();
    };
    const auto = window.setTimeout(open, 6500);
    window.addEventListener("wheel", open, { passive: true, once: true });
    window.addEventListener("touchmove", open, { passive: true, once: true });
    window.addEventListener("pointerdown", open, { once: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(auto);
      window.removeEventListener("wheel", open);
      window.removeEventListener("touchmove", open);
      window.removeEventListener("pointerdown", open);
      window.removeEventListener("keydown", onKey);
    };
  }, [state]);

  useEffect(() => {
    if (state !== "opening") return;
    document.documentElement.classList.remove("gate-locked");
    document.documentElement.classList.add("gate-opened");
    window.dispatchEvent(new Event("gate:open"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = window.setTimeout(() => {
      setState("open");
      ScrollTrigger.refresh();
    }, reduce ? 450 : 2200);
    return () => window.clearTimeout(t);
  }, [state]);

  if (state === "open") return null;

  return (
    <div className={`gate ${doorsArt ? "gate--art" : ""} ${state === "opening" ? "is-opening" : ""}`} role="dialog" aria-modal="false" aria-label="Wedding invitation — open the doors">
      {doorsArt && <div className="gate__backdrop" aria-hidden style={{ backgroundImage: `url(${publicUrl(doorsArt.src)})` }} />}
      <div className="gate__glow" aria-hidden />
      <div className="gate__doors">
        {doorsArt ? (
          (["l", "r"] as const).map((side) => (
            <div key={side} className={`gate__door gate__door--art gate__door--${side}`} aria-hidden>
              <span className="gate__door-img" style={{ backgroundImage: `url(${publicUrl(doorsArt.src)})` }} />
            </div>
          ))
        ) : (
          <>
            <DoorLeaf side="l" />
            <DoorLeaf side="r" />
          </>
        )}
      </div>
      <div className="gate__lintel" aria-hidden hidden={Boolean(doorsArt)}>
        <div className="gate__toran">
          {Array.from({ length: 21 }, (_, i) => (
            <span key={i} className={i % 2 ? "gate__marigold gate__marigold--deep" : "gate__marigold"} style={{ animationDelay: `${-i * 0.18}s` }} />
          ))}
        </div>
      </div>
      <div className="gate__seal">
        <GaneshMotif className="gate__ganesh" title="Shri Ganesh" />
        <p className="gate__shloka deva" lang="sa">॥ श्री गणेशाय नमः ॥</p>
        <p className="gate__names">
          {wedding.groom} <span>&amp;</span> {wedding.bride}
        </p>
        <button ref={btn} type="button" className="gate__open" onClick={() => setState("opening")} autoFocus>
          Open the doors
        </button>
        <p className="gate__hint">tap · scroll · or press Enter</p>
      </div>
    </div>
  );
}
