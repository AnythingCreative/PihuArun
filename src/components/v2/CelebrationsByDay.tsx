import { useLayoutEffect, useRef } from "react";
import { traditions, type Tradition } from "../../data/traditions";
import { TraditionArt } from "../scenes/TraditionArt";
import { art, photo, publicUrl } from "../../data/assets";
import { EASE, MQ, gsap } from "../../lib/motion";
import { useDateFormat, useLang, useT } from "../../lib/i18n";

/** AI-painted ritual cards (public/art/) take over from the photos once supplied. */
const ART_FOR: Record<string, string> = { haldi: "haldi", mehendi: "mehendi", sangeet: "sangeet", mandap: "mandap", "saat-phere": "pheras" };

/** Rituals grouped by their confirmed day, in date order. Rituals without a date are not shown. */
const days = [...new Set(traditions.filter((t) => t.date).map((t) => t.date!))]
  .sort()
  .map((date) => ({ date, rituals: traditions.filter((t) => t.date === date) }));

function RitualPicture({ t, sizes }: { t: Tradition; sizes: string }) {
  const pic = art(ART_FOR[t.id] ?? "", `${t.name}, painted artwork`) ?? photo(t.photoSlot);
  return pic ? (
    <img src={publicUrl(pic.src)} srcSet={pic.srcSet} sizes={sizes} width={pic.width} height={pic.height} alt={pic.alt} loading="lazy" decoding="async" />
  ) : (
    <TraditionArt kind={t.art} />
  );
}

/**
 * The wedding celebrations as a two-day programme: one gilded panel per day
 * with that day's rituals inside.
 */
export function CelebrationsByDay() {
  const root = useRef<HTMLElement>(null);
  const t = useT();
  const hindi = useLang() === "hi";
  const fmt = useDateFormat();

  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const once = { trigger: el, start: "top 70%", once: true };
      gsap.from(q(".byday__head > *"), { opacity: 0, y: 24, stagger: 0.08, duration: 0.8, ease: EASE.soft, scrollTrigger: once });
      const tl = gsap.timeline({ defaults: { ease: EASE.soft }, scrollTrigger: once });
      // the two days slide in from either side, then each painting turns to face the guest
      tl.from(q(".byday__panel:nth-child(1)"), { opacity: 0, x: -80, rotate: -3, duration: 1.1 }, 0.1)
        .from(q(".byday__panel:nth-child(2)"), { opacity: 0, x: 80, rotate: 3, duration: 1.1 }, 0.25)
        .from(q(".byday__daynum"), { scale: 0, rotate: -20, stagger: 0.15, duration: 0.7, ease: "back.out(2.4)" }, 0.6)
        .from(q(".byday__art"), { rotateY: 75, opacity: 0, transformPerspective: 900, stagger: 0.12, duration: 1, ease: "power3.out" }, 0.55)
        .from(q(".byday__text > *"), { opacity: 0, y: 14, stagger: 0.04, duration: 0.6 }, 1);
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="traditions" ref={root} className="traditions byday" aria-labelledby="traditions-title">
      <header className="byday__head">
        <p className="label eyebrow">{t("Sacred rituals", "पवित्र रस्में")}</p>
        <h2 id="traditions-title" className="h2" data-focus-target>
          {t("The Wedding Celebrations", "विवाह उत्सव")}
        </h2>
      </header>

      <div className="byday__days">
        {days.map(({ date, rituals }, i) => (
          <article key={date} className="byday__panel" aria-labelledby={`day-${date}`}>
            <header className="byday__dayhead">
              <p className="byday__daynum">{t(`Day ${i + 1}`, `दिन ${i + 1}`)}</p>
              <h3 id={`day-${date}`} className="byday__date">
                <time dateTime={date}>
                  <span className="byday__weekday">{fmt(date, { weekday: "long" })}</span>
                  {fmt(date, { day: "numeric", month: "long", year: "numeric" })}
                </time>
              </h3>
            </header>
            <ul className="byday__rituals">
              {rituals.map((r) => (
                <li key={r.id} className="byday__ritual">
                  <figure className="byday__art">
                    <span className="byday__shine" aria-hidden />
                    <RitualPicture t={r} sizes="(min-width: 1024px) 18vw, 22vw" />
                  </figure>
                  <div className="byday__text">
                    {!hindi && (
                      <p className="byday__hindi deva" lang="hi">
                        {r.hindi}
                      </p>
                    )}
                    <h4 className="byday__name">{hindi ? r.hindi : r.name}</h4>
                    <p className="byday__meaning">{hindi ? r.meaningHi : r.meaning}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

    </section>
  );
}
