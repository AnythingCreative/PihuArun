import { useLayoutEffect, useRef } from "react";
import { EASE, MQ, gsap } from "../../lib/motion";
import { art, publicUrl, type Photo } from "../../data/assets";
import { GoldFrame } from "./GoldFrame";
import { SectionBackdrop } from "./SectionBackdrop";

const ganesh = art("ganesh", "Shri Ganesh on a golden lotus throne, painted artwork");
const shivParvati = art("shiv-parvati", "The divine wedding of Shiv and Parvati around the sacred fire, painted artwork");

function Painting({ pic }: { pic: Photo | null }) {
  if (!pic) return null;
  return (
    <figure className="painting">
      <GoldFrame>
        <img src={publicUrl(pic.src)} srcSet={pic.srcSet} sizes="(min-width: 1024px) 34vw, 86vw" width={pic.width} height={pic.height} alt={pic.alt} loading="lazy" decoding="async" />
      </GoldFrame>
    </figure>
  );
}
import { LotusDivider } from "../ornaments/Ornaments";

/**
 * Blessings — Ganesh vandana, then Shiv and Parvati, whose wedding at
 * Triyuginarayan is the inspiration for this invitation. Told on a maroon
 * palace wall; artwork slots will hold the AI-painted scenes.
 */
export function Blessings() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.from(q(".blessings__shloka span"), {
        opacity: 0,
        y: 24,
        filter: "blur(6px)",
        stagger: 0.12,
        duration: 1,
        ease: EASE.soft,
        scrollTrigger: { trigger: q(".blessings__shloka")[0], start: "top 85%" },
      });
      q(".painting").forEach((fig, i) => {
        const wide = window.matchMedia("(min-width: 1024px)").matches;
        gsap.from(fig, { ...(wide ? { rotateY: i % 2 ? -28 : 28 } : {}), y: wide ? 80 : 40, opacity: 0, duration: wide ? 1.4 : 0.9, ease: EASE.soft, scrollTrigger: { trigger: fig, start: "top 88%", once: true } });
        gsap.fromTo(fig.querySelector(".goldframe__shine"), { xPercent: -150 }, { xPercent: 450, duration: 1.8, ease: EASE.inOut, scrollTrigger: { trigger: fig, start: "top 70%" } });
      });
      gsap.from(q(".blessings__story > *"), { opacity: 0, y: 30, stagger: 0.12, duration: 1, ease: EASE.soft, scrollTrigger: { trigger: q(".blessings__story")[0], start: "top 85%" } });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="blessings" ref={root} className="blessings" aria-labelledby="blessings-title">
      <div className="blessings__wall" aria-hidden />
      <SectionBackdrop slot="ghats-bg" className="backdrop--blessings" focus="30% 50%" />
      <div className="container blessings__inner">
        <p className="label eyebrow blessings__eyebrow">With the blessings of</p>
        <h2 id="blessings-title" className="blessings__title">
          Shri Ganesh <span>&amp;</span> Shiv Parvati
        </h2>
        <p className="blessings__shloka deva" lang="sa">
          <span>वक्रतुण्ड महाकाय</span> <span>सूर्यकोटि समप्रभ ।</span> <span>निर्विघ्नं कुरु मे देव</span> <span>सर्वकार्येषु सर्वदा ॥</span>
        </p>
        <LotusDivider className="blessings__divider" />

        <div className={`blessings__paintings ${ganesh || shivParvati ? "has-art" : ""}`}>
          <Painting pic={ganesh} />
          <div className="blessings__story">
            <h3>A flame that has burned since their wedding</h3>
            <p>
              High in the Himalayas, at the temple of Triyuginarayan, Shiv and Parvati are said to have married before a sacred fire, with
              Vishnu giving the bride away. That fire, the akhand dhuni, is kept burning to this day.
            </p>
            <p>With their blessings, and with Ganesh ji to clear the path, we begin our own journey around the sacred fire.</p>
          </div>
          <Painting pic={shivParvati} />
        </div>
      </div>
    </section>
  );
}
