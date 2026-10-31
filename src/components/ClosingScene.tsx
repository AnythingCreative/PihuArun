import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUp, Share2 } from "lucide-react";
import { wedding, displayDate } from "../config/wedding";
import { Diya, CornerFlourish } from "./ornaments/Ornaments";
import { useInView } from "../hooks/useInView";
import { scrollToSection } from "../lib/scrollTo";
import { shareInvitation } from "../lib/share";
import { SkyLanterns } from "./v2/SkyLanterns";
import { SectionBackdrop } from "./v2/SectionBackdrop";
import { useDateFormat, useNames, useT } from "../lib/i18n";
import { SectionToran } from "./v2/SectionToran";
import { EASE, MQ, gsap } from "../lib/motion";

const PETAL_COLOURS = ["#f4a21c", "#ff7a1a", "#d6246e", "#f6c34a", "#e2551f", "#fff3c4"];

/** A shower of marigold and rose petals bursting from a point. Transform-only, removed when done. */
function showerPetals(host: HTMLElement, x: number, y: number, count = 34) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "shower-petal";
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.background = PETAL_COLOURS[i % PETAL_COLOURS.length];
    host.appendChild(el);
    const angle = (Math.random() - 0.5) * Math.PI * 1.4 - Math.PI / 2;
    const dist = 120 + Math.random() * 220;
    gsap
      .timeline({ onComplete: () => el.remove() })
      .to(el, { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, rotate: Math.random() * 540, duration: 0.9, ease: "power3.out" })
      .to(el, { y: `+=${260 + Math.random() * 200}`, x: `+=${(Math.random() - 0.5) * 120}`, rotate: "+=360", opacity: 0, duration: 2.2 + Math.random(), ease: "power1.in" });
  }
}

const DIYAS = [
  { x: -2, y: 14, s: 0.8 },
  { x: -1, y: 5, s: 0.92 },
  { x: 0, y: 0, s: 1.05 },
  { x: 1, y: 5, s: 0.92 },
  { x: 2, y: 14, s: 0.8 },
];

/** Section 11 — the final blessing: lamps glowing by the river at night. */
export function ClosingScene() {
  const t = useT();
  const names = useNames();
  const fmt = useDateFormat();
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
        .fromTo(q(".closing__glow"), { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.4, ease: "power2.out" }, 0.6)
        .call(() => {
          // the lanterns lift faster for a few seconds, then settle back
          const lanterns = (q(".lanterns--closing .lantern") as HTMLElement[]).flatMap((l) => l.getAnimations());
          lanterns.forEach((a) => a.updatePlaybackRate(2.6));
          window.setTimeout(() => lanterns.forEach((a) => a.updatePlaybackRate(1)), 5000);
        }, [], 1)
        .call(() => {
          const names = q(".closing__names")[0] as HTMLElement | undefined;
          if (!names) return;
          const host = el.getBoundingClientRect();
          const r = names.getBoundingClientRect();
          showerPetals(el, r.left - host.left + r.width / 2, r.top - host.top + r.height / 2, 46);
        }, [], 1.4)
        .fromTo(q(".closing__line"), { scaleX: 0 }, { scaleX: 1, duration: 1.8, ease: EASE.inOut }, 1.2)
        .from(q(".closing__actions"), { opacity: 0, duration: 1 }, 2);
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="blessing" ref={root} className={`closing on-dark ${active ? "is-active" : ""}`} aria-labelledby="closing-title">
      <div className="closing__sky" aria-hidden />
      <SectionBackdrop slot="couple-pheras" className="backdrop--closing" />
      <SectionToran />
      <div className="closing__river" aria-hidden />
      <SkyLanterns className="lanterns--closing" count={10} />
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
        <span className="closing__glow" aria-hidden />
        <p className="closing__eyebrow label closing__reveal">{t("With Love & Blessings", "स्नेह और आशीर्वाद सहित")}</p>
        <h2
          id="closing-title"
          className="closing__names display closing__reveal"
          title={t("Tap for a shower of petals", "फूलों की वर्षा के लिए छूएँ")}
          onClick={(e) => {
            const host = root.current!;
            const r = host.getBoundingClientRect();
            showerPetals(host, e.clientX - r.left, e.clientY - r.top);
          }}
        >
          {names.groom.toUpperCase()} <span>&amp;</span> {names.bride.toUpperCase()}
        </h2>
        <p className="closing__date label closing__reveal">
          <time dateTime={wedding.date}>{t(displayDate(), fmt(wedding.date, { day: "numeric", month: "long", year: "numeric" }))}</time>
        </p>
        <span className="closing__line" aria-hidden />
        <p className="closing__hindi deva closing__reveal" lang="hi">
          प्रेम • परंपरा • साथ
          <span className="visually-hidden" lang="en">
            {" "}
            (love, tradition, togetherness)
          </span>
        </p>

        <div className="closing__diyas" aria-hidden>
          {DIYAS.map((d, i) => (
            <span key={i} className="closing__diya-wrap" style={{ transform: `translateY(${d.y}px) scale(${d.s})` }}>
              <Diya className="closing__diya" style={{ ["--flicker-delay" as string]: `${-i * 0.37}s` }} />
            </span>
          ))}
        </div>

        <div className="closing__actions">
          <button type="button" className="btn btn--ghost-light" onClick={() => scrollToSection("top")}>
            <ArrowUp aria-hidden /> {t("Back to Top", "शुरुआत पर जाएँ")}
          </button>
          <button
            type="button"
            className="btn btn--ghost-light"
            onClick={async () => {
              const r = await shareInvitation();
              setShared(r === "copied" ? t("Link copied.", "लिंक कॉपी हो गया।") : r === "shared" ? t("Thank you for sharing.", "साझा करने के लिए धन्यवाद।") : r === "whatsapp" ? t("Opening WhatsApp…", "WhatsApp खुल रहा है…") : r === "failed" ? t("Share this address: ", "यह पता साझा करें: ") + window.location.href.split("#")[0] : "");
            }}
          >
            <Share2 aria-hidden /> {t("Share", "साझा करें")}
          </button>
        </div>
        <p className="closing__status" aria-live="polite">
          {shared}
        </p>
      </div>

      <footer className="closing__footer">
        <p>
          {t(`Made with love for ${wedding.groom} & ${wedding.bride} · ${wedding.city}`, `स्नेह सहित, ${names.groom} और ${names.bride} · प्रयागराज`)}
        </p>
      </footer>
    </section>
  );
}
