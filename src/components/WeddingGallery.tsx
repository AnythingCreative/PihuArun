import { lazy, Suspense, useLayoutEffect, useRef, useState } from "react";
import { Expand } from "lucide-react";
import { gallery, srcFor, srcSetFor } from "../data/gallery";
import { EASE, MQ, gsap } from "../lib/motion";

const Lightbox = lazy(() => import("./Lightbox"));

/** Section 09 — a gallery of moments, in an asymmetrical editorial grid. */
export function WeddingGallery() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      el.querySelectorAll<HTMLElement>(".gallery__item").forEach((item, i) => {
        const img = item.querySelector("img");
        gsap
          .timeline({ scrollTrigger: { trigger: item, start: "top 92%", end: "top 50%", scrub: 0.6 } })
          .fromTo(item, { clipPath: i % 2 ? "inset(0% 0% 100% 0%)" : "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: EASE.inOut }, 0)
          .fromTo(img, { scale: 1.2 }, { scale: 1, ease: EASE.soft }, 0);
      });
      gsap.from(el.querySelectorAll(".gallery__head > *"), {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 1,
        ease: EASE.soft,
        scrollTrigger: { trigger: el, start: "top 75%" },
      });
    });
    return () => mm.revert();
  }, []);

  const close = () => {
    const last = open;
    setOpen(null);
    if (last !== null) triggers.current[last]?.focus({ preventScroll: true });
  };

  const hasPlaceholders = gallery.some((g) => g.placeholder);

  return (
    <section id="gallery" ref={root} className="gallery section" aria-labelledby="gallery-title">
      <div className="container">
        <header className="gallery__head center">
          <p className="label eyebrow">Moments</p>
          <h2 id="gallery-title" className="h2" data-focus-target>
            A Gallery of Moments
          </h2>
          {hasPlaceholders && <p className="art-note">Illustrations for now — photographs of the celebration will appear here.</p>}
        </header>

        <ul className="gallery__grid">
          {gallery.map((img, i) => (
            <li key={img.id} className={`gallery__cell gallery__cell--${img.span}`}>
              <button
                ref={(b) => {
                  triggers.current[i] = b;
                }}
                type="button"
                className="gallery__item"
                onClick={() => setOpen(i)}
                aria-label={`Open image ${i + 1} of ${gallery.length}: ${img.caption}`}
                style={{ aspectRatio: `${img.width} / ${img.height}` }}
              >
                <img
                  src={srcFor(img, 1280)}
                  srcSet={srcSetFor(img)}
                  sizes={img.span === "wide" ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
                  width={img.width}
                  height={img.height}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => e.currentTarget.closest(".gallery__item")?.classList.add("is-missing")}
                />
                <span className="gallery__caption label">
                  {img.caption}
                  <Expand aria-hidden />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {open !== null && (
        <Suspense fallback={null}>
          <Lightbox images={gallery} index={open} onIndex={setOpen} onClose={close} />
        </Suspense>
      )}
    </section>
  );
}
