import { useLayoutEffect, useRef } from "react";
import { SangamScene } from "./scenes/SangamScene";
import { assets, publicUrl } from "../data/assets";
import { EASE, MQ, gsap } from "../lib/motion";

/**
 * Section 03 — the sacred land of Prayagraj. A pinned scene: the Sangam is
 * revealed through a widening mask, its layers drift at different speeds,
 * the headline settles and a fine gold line traces the confluence.
 */
export function PrayagrajStory() {
  const root = useRef<HTMLElement>(null);
  const photo = assets.prayagraj;

  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    mm.add({ desktop: "(min-width: 1024px)", motion: MQ.motion }, (ctx) => {
      if (!ctx.conditions?.motion) return;
      const desktop = ctx.conditions.desktop;
      const tl = gsap.timeline({
        defaults: { ease: EASE.none },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: desktop ? "+=180%" : "+=120%",
          scrub: 0.6,
          pin: q(".sangam__stage")[0],
          anticipatePin: 1,
        },
      });
      tl.fromTo(
        q(".sangam__mask"),
        { clipPath: desktop ? "inset(16% 24% 16% 24% round 220px 220px 24px 24px)" : "inset(14% 10% 22% 10% round 160px 160px 18px 18px)" },
        { clipPath: "inset(0% 0% 0% 0% round 0px 0px 0px 0px)", duration: 0.45, ease: EASE.inOut },
        0,
      )
        .fromTo(q(".sangam__mask .scene"), { scale: 1.18 }, { scale: 1, duration: 0.6, ease: EASE.soft }, 0);

      q(".scene__layer").forEach((layer) => {
        const depth = Number((layer as HTMLElement).dataset.depth ?? 0);
        tl.fromTo(layer, { yPercent: depth * 4 }, { yPercent: -depth * (desktop ? 7 : 4), duration: 1 }, 0);
      });

      tl.fromTo(q(".sangam__trace path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, ease: EASE.inOut }, 0.35)
        .from(q(".sangam__eyebrow, .sangam__title, .sangam__copy"), { opacity: 0, y: 40, stagger: 0.06, duration: 0.25, ease: EASE.soft }, 0.32)
        .from(q(".sangam__fleck"), { opacity: 0, duration: 0.2, stagger: 0.01 }, 0.4)
        .to(q(".sangam__dusk"), { opacity: 1, duration: 0.18 }, 0.82);
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="story" ref={root} className="sangam" aria-labelledby="sangam-title">
      <div className="sangam__stage">
        <div className="sangam__mask">
          {photo ? (
            <img
              className="sangam__photo"
              src={publicUrl(photo.src)}
              srcSet={photo.srcSet}
              sizes="100vw"
              width={photo.width}
              height={photo.height}
              alt={photo.alt}
              style={{ objectPosition: photo.focus }}
            />
          ) : (
            <SangamScene />
          )}
          <svg className="sangam__trace" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" aria-hidden focusable="false">
            <path pathLength={1} d="M-20 560 C260 610 520 600 700 620 C620 720 540 840 380 1010" />
          </svg>
          <div className="sangam__veil" aria-hidden />
          <div className="sangam__flecks" aria-hidden>
            {Array.from({ length: 14 }, (_, i) => (
              <span
                key={i}
                className="sangam__fleck"
                style={{ left: `${(i * 37) % 100}%`, top: `${20 + ((i * 53) % 60)}%`, animationDelay: `${-i * 1.7}s` }}
              />
            ))}
          </div>
        </div>

        <div className="sangam__text">
          <p className="sangam__eyebrow label eyebrow">Prayagraj · Triveni Sangam</p>
          <h2 id="sangam-title" className="sangam__title h2" data-focus-target>
            Where Sacred Rivers Meet
          </h2>
          <p className="sangam__copy lead">
            Rooted in tradition, blessed by sacred waters, and surrounded by the love of family, two lives come together to begin a journey of
            their own.
          </p>
        </div>

        <p className="sangam__note art-note">
          {photo?.credit ?? "Illustration · the Triveni Sangam at Prayagraj, where the Ganga meets the Yamuna"}
        </p>
        <div className="sangam__dusk" aria-hidden />
      </div>
    </section>
  );
}
