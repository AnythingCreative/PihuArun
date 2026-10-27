import { useLayoutEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { traditions, type Tradition } from "../../data/traditions";
import { TraditionArt } from "../scenes/TraditionArt";
import { art, photo, publicUrl } from "../../data/assets";
import { wedding } from "../../config/wedding";
import { EASE, MQ, gsap } from "../../lib/motion";

/** AI-painted ritual cards (public/art/) take over from the photos once supplied. */
const ART_FOR: Record<string, string> = { haldi: "haldi", mehendi: "mehendi", sangeet: "sangeet", mandap: "mandap", "saat-phere": "pheras" };

/** "Mon, 23 Nov" in the venue's timezone (noon UTC never crosses a date line for IST). */
function shortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: wedding.timezone }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

function Picture({ t }: { t: Tradition }) {
  const pic = art(ART_FOR[t.id] ?? "", `${t.name}, painted artwork`) ?? photo(t.photoSlot);
  return pic ? (
    <img src={publicUrl(pic.src)} srcSet={pic.srcSet} sizes="(min-width: 768px) 300px, 62vw" width={pic.width} height={pic.height} alt="" draggable={false} decoding="async" />
  ) : (
    <TraditionArt kind={t.art} />
  );
}

/**
 * The celebrations as a fanned hand of invitation cards. The chosen card
 * stands tall in the middle; the others fan out behind it. Tap a card,
 * swipe, or use the arrows to bring the next one forward. Only transforms
 * and opacity animate, so it stays smooth on phones.
 */
export function CelebrationsDeck() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const touchX = useRef<number | null>(null);
  const n = traditions.length;
  const go = (i: number) => setActive(((i % n) + n) % n);
  const current = traditions[active];

  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      const once = { trigger: el, start: "top 70%", once: true };
      gsap.from(q(".deck__head > *"), { opacity: 0, y: 24, stagger: 0.08, duration: 0.8, ease: EASE.soft, scrollTrigger: once });
      // the hand is dealt: cards rise from a single stack into their fan
      gsap.from(q(".deck__card-inner"), { y: 120, rotate: 0, opacity: 0, stagger: 0.09, duration: 1, ease: EASE.soft, scrollTrigger: once });
    });
    return () => mm.revert();
  }, []);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") go(active + 1);
    if (e.key === "ArrowLeft") go(active - 1);
  };
  const onTouchStart = (e: TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
  };

  return (
    <section id="traditions" ref={root} className="traditions deck" aria-labelledby="traditions-title">
      <header className="deck__head">
        <p className="label eyebrow">Sacred rituals</p>
        <h2 id="traditions-title" className="h2" data-focus-target>
          The Wedding Celebrations
        </h2>
      </header>

      <div className="deck__stage" role="group" aria-roledescription="carousel" aria-label="Wedding rituals" tabIndex={0} onKeyDown={onKey} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {traditions.map((t, i) => {
          // signed distance from the active card, wrapped so the fan is always balanced
          let off = i - active;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          const abs = Math.abs(off);
          return (
            <button
              key={t.id}
              type="button"
              className={`deck__card ${off === 0 ? "is-active" : ""}`}
              style={{
                transform: `translateX(${off * 38}%) translateY(${abs * abs * 4}%) rotate(${off * 9}deg) scale(${1 - abs * 0.1})`,
                zIndex: 10 - abs,
                opacity: abs > 2 ? 0 : 1,
              }}
              aria-label={`${t.name}${t.date ? `, ${shortDate(t.date)}` : ""}`}
              aria-current={off === 0}
              tabIndex={-1}
              onClick={() => go(i)}
            >
              <span className="deck__card-inner">
                <span className="deck__art">
                  <Picture t={t} />
                </span>
                <span className={`deck__date ${t.date ? "" : "deck__date--tbc"}`}>{t.date ? shortDate(t.date) : "Date to be shared"}</span>
                <span className="deck__name">{t.name}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="deck__detail" aria-live="polite">
        <p className="deck__hindi deva" lang="hi">
          {current.hindi}
        </p>
        <h3 className="deck__title">{current.name}</h3>
        <p className="deck__meaning">{current.meaning}</p>
        <p className="deck__desc">{current.description}</p>
      </div>

      <div className="deck__nav">
        <button type="button" className="deck__arrow" onClick={() => go(active - 1)} aria-label="Previous ritual">
          <ChevronLeft aria-hidden />
        </button>
        <div className="deck__dots" aria-hidden>
          {traditions.map((t, i) => (
            <button key={t.id} type="button" tabIndex={-1} className={i === active ? "is-active" : ""} onClick={() => go(i)} />
          ))}
        </div>
        <button type="button" className="deck__arrow" onClick={() => go(active + 1)} aria-label="Next ritual">
          <ChevronRight aria-hidden />
        </button>
      </div>
    </section>
  );
}
