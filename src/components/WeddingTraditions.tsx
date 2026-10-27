import { useLayoutEffect, useRef, useState } from "react";
import { traditions } from "../data/traditions";
import { TraditionArt } from "./scenes/TraditionArt";
import { art, photo, publicUrl } from "../data/assets";
import { wedding } from "../config/wedding";
import { EASE, MQ, gsap } from "../lib/motion";

/** AI-painted ritual cards (public/art/) take over from the photos once supplied. */
const ART_FOR: Record<string, string> = { haldi: "haldi", mehendi: "mehendi", sangeet: "sangeet", mandap: "mandap", "saat-phere": "pheras" };

/** "Mon, 23 Nov 2026" in the venue's timezone (noon UTC never crosses a date line for IST). */
function ritualDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: wedding.timezone }).format(
    new Date(Date.UTC(y, m - 1, d, 12)),
  );
}

/**
 * The wedding rituals on one screen: a row of painted cards in gilt arches.
 * Desktop shows all five at once; phones swipe through them.
 */
export function WeddingTraditions() {
  const root = useRef<HTMLElement>(null);
  const row = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.from(q(".rituals__head > *"), { opacity: 0, y: 24, stagger: 0.08, duration: 0.8, ease: EASE.soft, scrollTrigger: { trigger: el, start: "top 75%", once: true } });
      gsap.from(q(".ritual"), { opacity: 0, y: 40, stagger: 0.09, duration: 0.9, ease: EASE.soft, scrollTrigger: { trigger: q(".rituals__row")[0], start: "top 85%", once: true } });
    });
    return () => mm.revert();
  }, []);

  // phones: track which card is centred, for the dots
  const onScroll = () => {
    const r = row.current;
    if (!r) return;
    const card = r.firstElementChild as HTMLElement | null;
    if (!card) return;
    setActive(Math.round(r.scrollLeft / (card.offsetWidth + 16)));
  };
  const goTo = (i: number) => {
    const r = row.current;
    const card = r?.children[i] as HTMLElement | undefined;
    if (r && card) r.scrollTo({ left: card.offsetLeft - (r.clientWidth - card.offsetWidth) / 2, behavior: "smooth" });
  };

  return (
    <section id="traditions" ref={root} className="traditions rituals" aria-labelledby="traditions-title">
      <header className="rituals__head">
        <p className="label eyebrow">Sacred rituals</p>
        <h2 id="traditions-title" className="h2" data-focus-target>
          The Wedding Celebrations
        </h2>
        <p className="rituals__lead">Haldi and Mehendi on 23 November, the wedding on 24 November.</p>
      </header>

      <ul ref={row} className="rituals__row" onScroll={onScroll}>
        {traditions.map((t) => {
          const painted = art(ART_FOR[t.id] ?? "", `${t.name}, painted artwork`);
          const pic = painted ?? photo(t.photoSlot);
          return (
            <li key={t.id} className="ritual">
              <article aria-labelledby={`ritual-${t.id}`}>
                <figure className="ritual__art">
                  {pic ? (
                    <img src={publicUrl(pic.src)} srcSet={pic.srcSet} sizes="(min-width: 1024px) 18vw, 72vw" width={pic.width} height={pic.height} alt={pic.alt} loading="lazy" decoding="async" />
                  ) : (
                    <TraditionArt kind={t.art} />
                  )}
                </figure>
                <div className="ritual__body">
                  {t.date ? (
                    <p className="ritual__date">
                      <time dateTime={t.date}>{ritualDate(t.date)}</time>
                    </p>
                  ) : (
                    <p className="ritual__date ritual__date--tbc">Date to be shared</p>
                  )}
                  <p className="ritual__hindi deva" lang="hi">
                    {t.hindi}
                  </p>
                  <h3 id={`ritual-${t.id}`} className="ritual__name">
                    {t.name}
                  </h3>
                  <p className="ritual__meaning">{t.meaning}</p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <div className="rituals__dots" aria-hidden>
        {traditions.map((t, i) => (
          <button key={t.id} type="button" tabIndex={-1} className={i === active ? "is-active" : ""} onClick={() => goTo(i)} />
        ))}
      </div>
    </section>
  );
}
