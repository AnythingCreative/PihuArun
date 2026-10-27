import { useLayoutEffect, useRef } from "react";
import { wedding } from "../config/wedding";
import { assets, publicUrl, type Photo } from "../data/assets";
import { DotDivider, Lotus, TempleArch } from "./ornaments/Ornaments";
import { EASE, MQ, gsap } from "../lib/motion";

function Portrait({ photo, initials, label, className }: { photo: Photo | null; initials: string; label: string; className: string }) {
  return (
    <figure className={`portrait ${className}`}>
      <div className="portrait__mask">
        {photo ? (
          <img
            className="portrait__img"
            src={publicUrl(photo.src)}
            srcSet={photo.srcSet}
            sizes="(min-width: 1024px) 30vw, 90vw"
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            style={{ objectPosition: photo.focus }}
          />
        ) : (
          <div className="portrait__placeholder grain" role="img" aria-label={`${label} — photograph to be added`}>
            <Lotus className="portrait__lotus" aria-hidden />
            <span className="portrait__initials display">{initials}</span>
            <span className="portrait__hint label">Photograph to come</span>
          </div>
        )}
      </div>
      <TempleArch className="portrait__arch" />
      <figcaption className="label">{label}</figcaption>
    </figure>
  );
}

/** Section 05 — two names, one story. Editorial type and arched portrait frames. */
export function CoupleStory() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      // the two names drift towards each other as the section passes
      const st = { trigger: el, start: "top bottom", end: "center center", scrub: 0.6 };
      gsap.fromTo(q(".couple__word--groom"), { xPercent: -14 }, { xPercent: 0, ease: EASE.none, scrollTrigger: st });
      gsap.fromTo(q(".couple__word--bride"), { xPercent: 14 }, { xPercent: 0, ease: EASE.none, scrollTrigger: st });
      gsap.fromTo(q(".couple__amp"), { opacity: 0, scale: 0.6, rotate: -12 }, { opacity: 1, scale: 1, rotate: 0, ease: EASE.none, scrollTrigger: st });

      q(".portrait").forEach((fig, i) => {
        const mask = fig.querySelector(".portrait__mask");
        const inner = fig.querySelector(".portrait__img, .portrait__placeholder");
        const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: "top 85%", end: "top 35%", scrub: 0.6 } });
        tl.fromTo(mask, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: EASE.inOut }, 0)
          .fromTo(inner, { scale: 1.25 }, { scale: 1, ease: EASE.soft }, 0)
          .fromTo(fig.querySelectorAll(".portrait__arch path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: EASE.inOut }, 0.1 * i);
      });

      if (q(".print").length) gsap.from(q(".print"), {
        opacity: 0,
        y: 60,
        rotate: 0,
        stagger: 0.12,
        duration: 1.1,
        ease: EASE.soft,
        scrollTrigger: { trigger: q(".prints")[0], start: "top 85%" },
      });

      gsap.from(q(".couple__sub, .couple__divider"), {
        opacity: 0,
        y: 20,
        stagger: 0.12,
        duration: 1,
        ease: EASE.soft,
        scrollTrigger: { trigger: q(".couple__sub")[0], start: "top 85%" },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="couple" ref={root} className="couple section grain" aria-labelledby="couple-title">
      <div className="container">
        <h2 id="couple-title" className="couple__title display">
          <span className="couple__word couple__word--groom">{wedding.groom}</span>
          <span className="couple__amp" aria-label="and">
            &amp;
          </span>
          <span className="couple__word couple__word--bride">{wedding.bride}</span>
        </h2>
        <DotDivider className="couple__divider" />
        <p className="couple__sub lead">Two journeys. One beautiful beginning.</p>

        <div className="couple__portraits">
          <Portrait className="portrait--groom" photo={assets.arunPortrait} initials={wedding.groom[0]} label={wedding.groom} />
          <Portrait
            className="portrait--couple"
            photo={assets.couplePortrait}
            initials={`${wedding.groom[0]} & ${wedding.bride[0]}`}
            label={`${wedding.groom} & ${wedding.bride}`}
          />
          <Portrait className="portrait--bride" photo={assets.pratimaPortrait} initials={wedding.bride[0]} label={wedding.bride} />
        </div>

        {assets.storyPrints.length > 0 && (
          <div className="prints">
            {assets.storyPrints.map((p, i) => (
              <figure key={p.src} className="print" style={{ ["--tilt" as string]: `${[-4, 3, -2, 5, -3][i % 5]}deg` }}>
                <img
                  src={publicUrl(p.src)}
                  srcSet={p.srcSet}
                  sizes="(min-width: 1024px) 15rem, 40vw"
                  width={p.width}
                  height={p.height}
                  alt={p.alt}
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: p.focus }}
                />
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
