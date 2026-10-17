import { useLayoutEffect, useRef } from "react";
import { wedding, displayDate, place } from "../config/wedding";
import { CornerFlourish, GaneshMotif, Mandala, MarigoldPetal } from "./ornaments/Ornaments";
import { DUR, EASE, MQ, gsap } from "../lib/motion";
import { scrollToSection } from "../lib/scrollTo";

const PETALS = [
  { left: "12%", delay: 0, dur: 19, size: 16, rot: 20 },
  { left: "27%", delay: 7, dur: 23, size: 12, rot: -30 },
  { left: "71%", delay: 3, dur: 21, size: 15, rot: 50 },
  { left: "86%", delay: 11, dur: 25, size: 11, rot: -10 },
  { left: "55%", delay: 15, dur: 24, size: 13, rot: 80 },
];

export function InvitationHero() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      const q = gsap.utils.selector(el);
      const tl = gsap.timeline({ defaults: { ease: EASE.out } });
      tl.from(q(".hero__paper"), { opacity: 0, duration: DUR.base })
        .from(q(".hero__line--h"), { scaleX: 0, duration: DUR.slow, ease: EASE.inOut, stagger: 0.1 }, 0.2)
        .from(q(".hero__line--v"), { scaleY: 0, duration: DUR.slow, ease: EASE.inOut, stagger: 0.1 }, 0.2)
        .fromTo(q(".hero__corner path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: DUR.slow, ease: EASE.inOut }, 0.5)
        .from(q(".hero__mandala"), { opacity: 0, scale: 0.94, duration: 2.4 }, 0.6)
        .fromTo(q(".hero__ganesh path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: EASE.inOut, stagger: 0.03 }, 0.9)
        .from(q(".hero__shloka, .hero__families"), { opacity: 0, y: 10, duration: DUR.base, stagger: 0.15 }, 1.3)
        .from(q(".hero__name--groom .hero__name-inner"), { yPercent: 105, duration: 1.3 }, 1.7)
        .from(q(".hero__amp"), { opacity: 0, scale: 0.7, duration: 1.1 }, 2.15)
        .from(q(".hero__name--bride .hero__name-inner"), { yPercent: 105, duration: 1.3 }, 2.35)
        .from(q(".hero__invite, .hero__date, .hero__place"), { opacity: 0, y: 12, duration: DUR.base, stagger: 0.14 }, 3.0)
        .from(q(".hero__scroll"), { opacity: 0, duration: DUR.base }, 3.7);

      // As the guest begins to scroll, the composition recedes softly.
      gsap.to(q(".hero__content"), {
        yPercent: -8,
        opacity: 0.2,
        ease: EASE.none,
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(q(".hero__mandala"), {
        rotate: 25,
        ease: EASE.none,
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
      });
    });

    mm.add(MQ.reduce, () => {
      gsap.from(el.querySelector(".hero__content"), { opacity: 0, duration: 0.6 });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="top" ref={root} className="hero" aria-labelledby="hero-title" data-flush>
      <div className="hero__paper grain" aria-hidden>
        <div className="hero__glow" />
      </div>

      <div className="hero__frame" aria-hidden>
        <span className="hero__line hero__line--h hero__line--top" />
        <span className="hero__line hero__line--h hero__line--bottom" />
        <span className="hero__line hero__line--v hero__line--left" />
        <span className="hero__line hero__line--v hero__line--right" />
        <CornerFlourish className="hero__corner hero__corner--tl" />
        <CornerFlourish className="hero__corner hero__corner--tr" />
        <CornerFlourish className="hero__corner hero__corner--bl" />
        <CornerFlourish className="hero__corner hero__corner--br" />
      </div>

      <Mandala className="hero__mandala" aria-hidden />

      <div className="hero__petals" aria-hidden>
        {PETALS.map((p, i) => (
          <MarigoldPetal
            key={i}
            className="hero__petal"
            width={p.size}
            height={p.size * 1.4}
            style={{
              left: p.left,
              animationDelay: `${-p.delay}s`,
              animationDuration: `${p.dur}s`,
              ["--rot" as string]: `${p.rot}deg`,
            }}
          />
        ))}
      </div>

      <div className="hero__content">
        <GaneshMotif className="hero__ganesh" title="Shri Ganesh" />
        <p className="hero__shloka deva" lang="sa">
          ॥ श्री गणेशाय नमः ॥
        </p>
        <p className="hero__families">Together with our families</p>

        <h1 id="hero-title" className="hero__names display">
          <span className="hero__name hero__name--groom">
            <span className="hero__name-inner">{wedding.groom.toUpperCase()}</span>
          </span>
          <span className="hero__amp" aria-label="and">
            &amp;
          </span>
          <span className="hero__name hero__name--bride">
            <span className="hero__name-inner">{wedding.bride.toUpperCase()}</span>
          </span>
        </h1>

        <p className="hero__invite label">Invite you to celebrate their wedding</p>
        <p className="hero__date">
          <time dateTime={wedding.date}>{displayDate()}</time>
        </p>
        <p className="hero__place label">{place().toUpperCase()}</p>
      </div>

      <a
        href="#invitation"
        className="hero__scroll label"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection("invitation");
        }}
      >
        <span>Scroll to begin</span>
        <span className="hero__scroll-line" aria-hidden />
      </a>
    </section>
  );
}
