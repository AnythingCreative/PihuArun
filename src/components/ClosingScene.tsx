import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, Share2 } from "lucide-react";
import { wedding, displayDate } from "../config/wedding";
import { Diya, CornerFlourish } from "./ornaments/Ornaments";
import { useInView } from "../hooks/useInView";
import { scrollToSection } from "../lib/scrollTo";
import { shareInvitation } from "../lib/share";
import { EASE, MQ, gsap } from "../lib/motion";

const DIYAS = [
  { x: -2, y: 14, s: 0.8 },
  { x: -1, y: 5, s: 0.92 },
  { x: 0, y: 0, s: 1.05 },
  { x: 1, y: 5, s: 0.92 },
  { x: 2, y: 14, s: 0.8 },
];

/** Section 11 — the final blessing: lamps glowing by the river at night. */
export function ClosingScene() {
  const root = useRef<HTMLElement>(null);
  const active = useInView(root, "100px");
  const [shared, setShared] = useState("");

  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 60%" } });
      tl.from(q(".closing__diya"), { opacity: 0, y: 20, stagger: 0.15, duration: 1.2, ease: EASE.soft })
        .fromTo(q(".closing__corner path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2, ease: EASE.inOut }, 0.2)
        .from(q(".closing__reveal"), { opacity: 0, y: 24, stagger: 0.18, duration: 1.2, ease: EASE.soft }, 0.5)
        .fromTo(q(".closing__line"), { scaleX: 0 }, { scaleX: 1, duration: 1.8, ease: EASE.inOut }, 1.2)
        .from(q(".closing__actions"), { opacity: 0, duration: 1 }, 2);
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="blessing" ref={root} className={`closing on-dark ${active ? "is-active" : ""}`} aria-labelledby="closing-title">
      <div className="closing__sky" aria-hidden />
      <div className="closing__river" aria-hidden />
      <div className="closing__particles" aria-hidden>
        {Array.from({ length: 18 }, (_, i) => (
          <span key={i} style={{ left: `${(i * 41 + 7) % 100}%`, animationDelay: `${-i * 1.3}s`, animationDuration: `${11 + (i % 5) * 2}s` }} />
        ))}
      </div>
      <div className="closing__border" aria-hidden>
        <CornerFlourish className="closing__corner closing__corner--tl" />
        <CornerFlourish className="closing__corner closing__corner--tr" />
        <CornerFlourish className="closing__corner closing__corner--bl" />
        <CornerFlourish className="closing__corner closing__corner--br" />
      </div>

      <div className="closing__content">
        <div className="closing__diyas" aria-hidden>
          {DIYAS.map((d, i) => (
            <span key={i} className="closing__diya-wrap" style={{ transform: `translateY(${d.y}px) scale(${d.s})` }}>
              <Diya className="closing__diya" style={{ ["--flicker-delay" as string]: `${-i * 0.37}s` }} />
            </span>
          ))}
        </div>
        <p className="closing__eyebrow label closing__reveal">With Love &amp; Blessings</p>
        <h2 id="closing-title" className="closing__names display closing__reveal">
          {wedding.groom.toUpperCase()} <span>&amp;</span> {wedding.bride.toUpperCase()}
        </h2>
        <p className="closing__date label closing__reveal">
          <time dateTime={wedding.date}>{displayDate()}</time>
        </p>
        <span className="closing__line" aria-hidden />
        <p className="closing__hindi deva closing__reveal" lang="hi">
          प्रेम • परंपरा • साथ
          <span className="visually-hidden" lang="en">
            {" "}
            (love, tradition, togetherness)
          </span>
        </p>

        <div className="closing__actions">
          <button type="button" className="btn btn--ghost-light" onClick={() => scrollToSection("top")}>
            <ArrowUp aria-hidden /> Back to Top
          </button>
          <button
            type="button"
            className="btn btn--ghost-light"
            onClick={async () => {
              const r = await shareInvitation();
              setShared(r === "copied" ? "Link copied." : r === "shared" ? "Thank you for sharing." : r === "failed" ? "Please copy the address from your browser." : "");
            }}
          >
            <Share2 aria-hidden /> Share
          </button>
        </div>
        <p className="closing__status" aria-live="polite">
          {shared}
        </p>
      </div>

      <footer className="closing__footer">
        <p>
          Made with love for {wedding.groom} &amp; {wedding.bride} · {wedding.city}
        </p>
      </footer>
    </section>
  );
}
