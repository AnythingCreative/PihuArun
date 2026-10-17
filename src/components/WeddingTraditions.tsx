import { useLayoutEffect, useRef } from "react";
import { traditions } from "../data/traditions";
import { TraditionArt } from "./scenes/TraditionArt";
import { LotusDivider } from "./ornaments/Ornaments";
import { photo, publicUrl } from "../data/assets";
import { EASE, MQ, gsap } from "../lib/motion";

/**
 * Section 06 — the beauty of Hindu wedding traditions. A pinned horizontal
 * sequence on large screens; a calm vertical sequence everywhere else.
 */
export function WeddingTraditions() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    mm.add(MQ.desktop, () => {
      const track = q(".traditions__track")[0] as HTMLElement;
      const distance = () => track.scrollWidth - window.innerWidth;
      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: EASE.none,
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.7,
          pin: q(".traditions__stage")[0],
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      q(".tradition").forEach((card) => {
        gsap.from(card.querySelectorAll(".tradition__art, .tradition__body > *"), {
          opacity: 0,
          y: 30,
          stagger: 0.06,
          ease: EASE.soft,
          scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 85%", end: "left 45%", scrub: 0.5 },
        });
      });
      gsap.fromTo(q(".traditions__progress span"), { scaleX: 0 }, {
        scaleX: 1,
        ease: EASE.none,
        scrollTrigger: { trigger: el, start: "top top", end: () => `+=${distance()}`, scrub: true },
      });
    });

    mm.add(MQ.mobile, () => {
      q(".tradition, .traditions__intro").forEach((card) => {
        gsap.from(card, { opacity: 0, y: 40, duration: 1, ease: EASE.soft, scrollTrigger: { trigger: card, start: "top 88%" } });
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="traditions" ref={root} className="traditions grain" aria-labelledby="traditions-title">
      <div className="traditions__stage">
        <div className="traditions__track">
          <header className="traditions__intro">
            <p className="label eyebrow">Sacred rituals</p>
            <h2 id="traditions-title" className="h2" data-focus-target>
              The Beauty of Hindu Wedding Traditions
            </h2>
            <LotusDivider />
            <p className="prose">
              A Hindu wedding unfolds as a sequence of rituals, each carrying its own meaning. These are a few of the traditions that give the
              celebration its colour and grace.
            </p>
            <p className="art-note">Illustrative cultural themes — not a schedule of the wedding events.</p>
          </header>

          {traditions.map((t, i) => {
            const pic = photo(t.photoSlot);
            return (
            <article key={t.id} className="tradition" aria-labelledby={`tradition-${t.id}`}>
              {pic ? (
                <figure className="tradition__art tradition__art--photo">
                  <img
                    src={publicUrl(pic.src)}
                    srcSet={pic.srcSet}
                    sizes="(min-width: 1024px) 30vw, 90vw"
                    width={pic.width}
                    height={pic.height}
                    alt={pic.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption className="tradition__credit">{pic.credit}</figcaption>
                </figure>
              ) : (
                <div className="tradition__art" aria-hidden>
                  <TraditionArt kind={t.art} />
                </div>
              )}
              <div className="tradition__body">
                <p className="tradition__num label">{String(i + 1).padStart(2, "0")}</p>
                <p className="tradition__hindi deva" lang="hi">
                  {t.hindi}
                </p>
                <h3 id={`tradition-${t.id}`} className="tradition__name">
                  {t.name}
                </h3>
                <p className="tradition__meaning label">{t.meaning}</p>
                <p className="tradition__desc">{t.description}</p>
              </div>
            </article>
            );
          })}
        </div>
        <div className="traditions__progress" aria-hidden>
          <span />
        </div>
      </div>
    </section>
  );
}
