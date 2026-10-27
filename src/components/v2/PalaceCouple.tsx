import { useLayoutEffect, useRef } from "react";
import { wedding } from "../../config/wedding";
import { EASE, MQ, gsap } from "../../lib/motion";
import { PalaceScene, cuspedArch } from "./PalaceScene";
import { CoupleIllustration } from "./CoupleIllustration";
import { GoldFrame } from "./GoldFrame";
import { art, publicUrl } from "../../data/assets";

const palaceArt = art("palace", "");
const portrait = art("couple-portrait", `${wedding.groom} and ${wedding.bride} in wedding attire, painted portrait`, "50% 30%");

/**
 * Our story — a silk curtain parts inside a palace jharokha to reveal the
 * illustrated couple beneath a lamp-lit colonnade, peacocks either side.
 */
export function PalaceCouple() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    mm.add({ desktop: "(min-width: 768px)", motion: MQ.motion }, (ctx) => {
      if (!ctx.conditions?.motion) return;
      const desktop = ctx.conditions.desktop;
      // one timed reveal when the section arrives: no pinning, nothing tied to every scroll tick
      const tl = gsap.timeline({ defaults: { ease: EASE.soft }, scrollTrigger: { trigger: el, start: "top 55%", once: true } });
      if (desktop) {
        tl.to(q(".palace-sec__curtain--l"), { xPercent: -102, duration: 1.6, ease: "power3.inOut" }, 0).to(
          q(".palace-sec__curtain--r"),
          { xPercent: 102, duration: 1.6, ease: "power3.inOut", onComplete: () => q(".palace-sec__curtain").forEach((c) => ((c as HTMLElement).style.display = "none")) },
          0,
        );
      }
      tl.fromTo(q(".couple-art"), { scale: 0.86, y: 50, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 1.4 }, desktop ? 0.5 : 0)
        .from(q(".palace-sec__text > *"), { opacity: 0, y: 30, stagger: 0.12, duration: 1 }, desktop ? 0.9 : 0.3)
        .fromTo(q(".goldframe__shine"), { xPercent: -150 }, { xPercent: 450, duration: 1.8, ease: "power2.inOut" }, desktop ? 1.6 : 1);
      // the courtyard drifts gently behind the portrait (one transformed layer)
      gsap.fromTo(q(".palace-sec__bg, .palace"), { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    });

    return () => mm.revert();
  }, []);

  const W = 1600;
  const H = 1000;

  return (
    <section id="story" ref={root} className="palace-sec on-dark" aria-labelledby="couple-title">
      <div className="palace-sec__stage">
        {palaceArt ? (
          <img className="palace-sec__bg" src={publicUrl(palaceArt.src)} srcSet={palaceArt.srcSet} sizes="100vw" width={palaceArt.width} height={palaceArt.height} alt="" loading="lazy" decoding="async" />
        ) : (
          <PalaceScene />
        )}
        <div className={`palace-sec__couple ${portrait ? "palace-sec__couple--portrait" : ""}`}>
          {portrait ? (
            <GoldFrame arch className="couple-art">
              <img src={publicUrl(portrait.src)} srcSet={portrait.srcSet} sizes="(min-width: 768px) 40vh, 80vw" width={portrait.width} height={portrait.height} alt={portrait.alt} style={{ objectPosition: portrait.focus }} />
            </GoldFrame>
          ) : (
            <CoupleIllustration />
          )}
        </div>
        <svg className="palace-sec__frame" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" aria-hidden focusable="false">
          <defs>
            <linearGradient id="pf-wall" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#4a0612" />
              <stop offset="0.5" stopColor="#7a0c1c" />
              <stop offset="1" stopColor="#4a0612" />
            </linearGradient>
            <linearGradient id="pf-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff1b8" />
              <stop offset="0.5" stopColor="#e0a526" />
              <stop offset="1" stopColor="#8a5a12" />
            </linearGradient>
          </defs>
          <path fillRule="evenodd" d={`M0 0 H${W} V${H} H0Z ${cuspedArch(330, 60, 940, 940)}`} fill="url(#pf-wall)" />
          <path d={cuspedArch(330, 60, 940, 940)} fill="none" stroke="url(#pf-gold)" strokeWidth="14" />
          <path d={cuspedArch(300, 34, 1000, 966)} fill="none" stroke="url(#pf-gold)" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
          {[150, 1450].map((x) => (
            <g key={x}>
              <rect x={x - 46} y="120" width="92" height="880" fill="#5c0616" stroke="url(#pf-gold)" strokeWidth="3" />
              {Array.from({ length: 9 }, (_, i) => (
                <g key={i}>
                  <circle cx={x} cy={170 + i * 95} r="20" fill="none" stroke="url(#pf-gold)" strokeWidth="2.5" />
                  <circle cx={x} cy={170 + i * 95} r="6" fill="url(#pf-gold)" />
                </g>
              ))}
            </g>
          ))}
        </svg>
        <div className="palace-sec__curtain palace-sec__curtain--l" aria-hidden />
        <div className="palace-sec__curtain palace-sec__curtain--r" aria-hidden />

        <div className="palace-sec__text">
          <p className="label eyebrow">Our story</p>
          <h2 id="couple-title" className="couple__title palace-sec__title">
            {wedding.groom} <span>&amp;</span> {wedding.bride}
          </h2>
          <p className="palace-sec__sub">Two journeys. One beautiful beginning.</p>
        </div>
      </div>
    </section>
  );
}
