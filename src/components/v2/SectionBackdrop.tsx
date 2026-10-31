import { useLayoutEffect, useRef } from "react";
import { art, publicUrl } from "../../data/assets";
import { MQ, gsap } from "../../lib/motion";

/**
 * A painted photograph behind a whole section, under a colour veil so the
 * text on top stays readable. As the guest scrolls past, the painting drifts
 * and slowly zooms out like a camera move: one image, transform only.
 * Renders nothing until that artwork exists.
 */
export function SectionBackdrop({ slot, className = "", focus }: { slot: string; className?: string; focus?: string }) {
  const pic = art(slot, "", focus);
  const img = useRef<HTMLImageElement>(null);

  useLayoutEffect(() => {
    const el = img.current;
    const section = el?.closest("section");
    if (!el || !section) return;
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo(
        el,
        { scale: 1.16, yPercent: -3 },
        { scale: 1, yPercent: 3, ease: "none", scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });
    return () => mm.revert();
  }, []);

  if (!pic) return null;
  return (
    <div className={`backdrop ${className}`} aria-hidden>
      <img
        ref={img}
        className="backdrop__img"
        src={publicUrl(pic.src)}
        srcSet={pic.srcSet}
        sizes="100vw"
        width={pic.width}
        height={pic.height}
        alt=""
        loading="lazy"
        decoding="async"
        style={{ objectPosition: pic.focus }}
      />
      <span className="backdrop__veil" />
    </div>
  );
}
