import { useLayoutEffect, useRef } from "react";
import { BrocadeScene, DiyaWaterScene, GhatsScene } from "./scenes/BanarasScenes";
import { assets, publicUrl } from "../data/assets";
import { EASE, MQ, gsap } from "../lib/motion";

const FRAMES = [
  { key: "ghats", caption: "The ghats at dusk", Scene: GhatsScene },
  { key: "diyas", caption: "Lamps upon the river", Scene: DiyaWaterScene },
  { key: "silk", caption: "Banarasi silk & brass", Scene: BrocadeScene },
];

/**
 * Section 04 — a journey through Banaras. Three cinematic frames wipe across
 * each other with scroll progress (never abrupt slides), each with a slow
 * push-in and layered parallax. Banaras is the visual inspiration only.
 */
export function BanarasStory() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    mm.add({ desktop: "(min-width: 1024px)", motion: MQ.motion }, (ctx) => {
      if (!ctx.conditions?.motion) return;
      const desktop = ctx.conditions.desktop;
      const frames = q(".banaras__frame");
      const captions = q(".banaras__caption");
      const ticks = q(".banaras__tick");
      gsap.set(frames.slice(1), { clipPath: "inset(0% 0% 0% 100%)" });
      gsap.set(captions.slice(1), { opacity: 0, y: 12 });

      const tl = gsap.timeline({
        defaults: { ease: EASE.none },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: desktop ? "+=260%" : "+=180%",
          scrub: 0.7,
          pin: q(".banaras__stage")[0],
          anticipatePin: 1,
        },
      });

      frames.forEach((frame, i) => {
        const start = i * 1;
        const scene = frame.querySelector(".scene, .banaras__photo");
        tl.fromTo(scene, { scale: 1.12 }, { scale: 1, duration: 1.6, ease: EASE.soft }, Math.max(0, start - 0.4));
        frame.querySelectorAll<HTMLElement>(".scene__layer").forEach((layer) => {
          const depth = Number(layer.dataset.depth ?? 0);
          tl.fromTo(layer, { xPercent: depth * 3 }, { xPercent: -depth * 4, duration: 1.6 }, Math.max(0, start - 0.4));
        });
        if (i > 0) {
          tl.to(frame, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: EASE.inOut }, start - 0.4)
            .to(captions[i - 1], { opacity: 0, y: -12, duration: 0.25 }, start - 0.35)
            .to(captions[i], { opacity: 1, y: 0, duration: 0.3 }, start - 0.1)
            .to(ticks[i], { scaleX: 1, duration: 0.6, ease: EASE.inOut }, start - 0.4);
        }
      });
      tl.from(q(".banaras__title, .banaras__copy"), { opacity: 0, y: 36, stagger: 0.1, duration: 0.4, ease: EASE.soft }, 0);
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="banaras" ref={root} className="banaras on-dark" aria-labelledby="banaras-title">
      <div className="banaras__stage">
        <div className="banaras__frames">
          {FRAMES.map(({ key, Scene }, i) => {
            const photo = assets.banaras[i];
            return (
              <div key={key} className="banaras__frame">
                {photo ? (
                  <img
                    className="banaras__photo"
                    src={publicUrl(photo.src)}
                    srcSet={photo.srcSet}
                    sizes="100vw"
                    width={photo.width}
                    height={photo.height}
                    alt={photo.alt}
                    loading="lazy"
                    style={{ objectPosition: photo.focus }}
                  />
                ) : (
                  <Scene />
                )}
              </div>
            );
          })}
          <div className="banaras__shade" aria-hidden />
        </div>

        <div className="banaras__text">
          <p className="label eyebrow banaras__eyebrow">Inspired by Banaras</p>
          <h2 id="banaras-title" className="banaras__title h2">
            An Eternal Kind of Love
          </h2>
          <p className="banaras__copy lead">
            From the timeless beauty of our traditions to the promise of a shared future, every moment carries the warmth of blessings, family,
            and togetherness.
          </p>
        </div>

        <div className="banaras__meta" aria-hidden>
          <div className="banaras__captions">
            {FRAMES.map((f) => (
              <p key={f.key} className="banaras__caption label">
                {f.caption}
              </p>
            ))}
          </div>
          <div className="banaras__ticks">
            {FRAMES.map((f) => (
              <span key={f.key} className="banaras__tick-wrap">
                <span className="banaras__tick" />
              </span>
            ))}
          </div>
        </div>
        <p className="banaras__note art-note">
          {assets.banaras.some(Boolean)
            ? `Photographs from Varanasi · ${assets.banaras.filter(Boolean).map((p) => p!.credit?.replace(/^Photo: /, "")).join(" · ")}`
            : "Illustrations inspired by Varanasi"}{" "}
          · the wedding takes place in Prayagraj
        </p>
      </div>
    </section>
  );
}
