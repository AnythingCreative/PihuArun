import { useEffect, useState } from "react";
import { scrollToSection } from "../../lib/scrollTo";
import { useT } from "../../lib/i18n";

/** One flower per section, in page order. */
const STOPS = [
  { id: "top", en: "Welcome", hi: "स्वागत" },
  { id: "blessings", en: "Blessings", hi: "आशीर्वाद" },
  { id: "story", en: "Our Story", hi: "हमारी कहानी" },
  { id: "traditions", en: "Celebrations", hi: "उत्सव" },
  { id: "wedding-day", en: "Save the Date", hi: "तिथि" },
  { id: "details", en: "Venue", hi: "स्थल" },
  { id: "wishes", en: "Blessings for us", hi: "शुभकामनाएँ" },
  { id: "blessing", en: "With Love", hi: "स्नेह सहित" },
];

/**
 * A varmala hanging down the right edge: a marigold for each section that
 * blooms as the guest reaches it, with a rose marking where they are now.
 * Tap a flower to go to that section. Updates only when the section changes.
 */
export function VarmalaTrail() {
  const t = useT();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const els = STOPS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = STOPS.findIndex((s) => s.id === e.target.id);
          if (i >= 0) setActive(i);
        }
      },
      // a section counts as "current" when it crosses the middle of the screen
      { rootMargin: "-48% 0px -48% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <nav className="varmala" aria-label={t("Sections", "भाग")}>
      <span className="varmala__thread" aria-hidden />
      <ol>
        {STOPS.map((s, i) => (
          <li key={s.id} className={`varmala__stop ${i < active ? "is-bloomed" : ""} ${i === active ? "is-current" : ""}`}>
            <button
              type="button"
              className="varmala__flower"
              onClick={() => scrollToSection(s.id)}
              aria-label={t(s.en, s.hi)}
              aria-current={i === active ? "step" : undefined}
            >
              <span className="varmala__petals" aria-hidden />
              <span className="varmala__label" aria-hidden>
                {t(s.en, s.hi)}
              </span>
            </button>
            {i < STOPS.length - 1 && <span className="varmala__leaf" aria-hidden />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
