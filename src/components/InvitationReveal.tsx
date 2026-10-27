import { useLayoutEffect, useRef } from "react";
import { wedding } from "../config/wedding";
import { Lotus, LotusDivider } from "./ornaments/Ornaments";
import { EASE, MQ, gsap } from "../lib/motion";

/**
 * Section 02 — the invitation opens. Two paper flaps sealed with a kumkum
 * seal swing open as the guest scrolls, revealing the inner card. Built from
 * layered transforms and light perspective rather than a fragile 3D fold.
 */
export function InvitationReveal() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    mm.add({ desktop: "(min-width: 768px)", motion: MQ.motion }, (ctx) => {
      if (!ctx.conditions?.motion) return;
      if (!ctx.conditions.desktop) {
        // phones: no pin, the card simply settles into view
        gsap.from(q(".invite__card"), { opacity: 0, y: 40, scale: 0.96, duration: 1.2, ease: EASE.soft, scrollTrigger: { trigger: el, start: "top 75%" } });
        gsap.from(q(".invite__reveal"), { opacity: 0, y: 20, stagger: 0.12, duration: 1, ease: EASE.soft, scrollTrigger: { trigger: el, start: "top 60%" } });
        return;
      }
      const tl = gsap.timeline({
        defaults: { ease: EASE.none },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: ctx.conditions.desktop ? "+=70%" : "+=55%",
          scrub: 0.3,
          pin: q(".invite__stage")[0],
          anticipatePin: 1,
        },
      });
      tl.to(q(".invite__seal"), { scale: 0.6, opacity: 0, duration: 0.18, ease: EASE.inOut }, 0)
        .to(q(".invite__flap--left"), { rotateY: -78, xPercent: -62, duration: 0.55, ease: EASE.inOut }, 0.12)
        .to(q(".invite__flap--right"), { rotateY: 78, xPercent: 62, duration: 0.55, ease: EASE.inOut }, 0.12)
        .to(q(".invite__flap"), { opacity: 0, duration: 0.2 }, 0.5)
        .fromTo(q(".invite__card"), { scale: 0.9, opacity: 0.4 }, { scale: 1, opacity: 1, duration: 0.5, ease: EASE.soft }, 0.2)
        .fromTo(q(".invite__border"), { clipPath: "inset(50% 50% 50% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.4, ease: EASE.inOut }, 0.35)
        .from(q(".invite__reveal"), { opacity: 0, y: 24, stagger: 0.07, duration: 0.25, ease: EASE.soft }, 0.5)
        .to(el, { backgroundColor: "#4e1219", duration: 1 }, 0);
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="invitation" ref={root} className="invite" aria-labelledby="invite-title">
      <div className="invite__stage">
        <div className="invite__card grain">
          <div className="invite__border" aria-hidden>
            <span />
          </div>
          <div className="invite__inner">
            <Lotus className="invite__lotus invite__reveal" aria-hidden />
            <h2 id="invite-title" className="invite__hindi deva invite__reveal" lang="hi">
              शुभ विवाह <span className="visually-hidden" lang="en">(an auspicious wedding)</span>
            </h2>
            <LotusDivider className="invite__reveal" />
            <p className="invite__copy lead invite__reveal">
              With the blessings of the Almighty and the love of our families, we invite you to join us as{" "}
              <strong>{wedding.groom}</strong> and <strong>{wedding.bride}</strong> begin a beautiful new chapter together.
            </p>
          </div>
        </div>

        <div className="invite__flaps" aria-hidden>
          <div className="invite__flap invite__flap--left grain">
            <span className="invite__flap-edge" />
          </div>
          <div className="invite__flap invite__flap--right grain">
            <span className="invite__flap-edge" />
          </div>
          <div className="invite__seal">
            <span>
              {wedding.groom[0]}
              <em>&amp;</em>
              {wedding.bride[0]}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
