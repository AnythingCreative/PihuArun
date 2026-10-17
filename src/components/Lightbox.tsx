import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { srcFor, srcSetFor, type GalleryImage } from "../data/gallery";

interface Props {
  images: GalleryImage[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}

/** Full-screen, keyboard- and touch-friendly image viewer with a focus trap. */
export default function Lightbox({ images, index, onIndex, onClose }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const img = images[index];
  const n = images.length;
  const prev = () => onIndex((index - 1 + n) % n);
  const next = () => onIndex((index + 1) % n);

  // Lock page scroll without moving it (avoids layout shift / lost position).
  useEffect(() => {
    const html = document.documentElement;
    const gap = window.innerWidth - html.clientWidth;
    html.classList.add("is-locked");
    html.style.setProperty("--scrollbar-gap", `${gap}px`);
    closeBtn.current?.focus();
    return () => {
      html.classList.remove("is-locked");
      html.style.removeProperty("--scrollbar-gap");
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "Home") {
        onIndex(0);
      } else if (e.key === "End") {
        onIndex(n - 1);
      } else if (e.key === "Tab") {
        // focus trap
        const nodes = dialog.current?.querySelectorAll<HTMLElement>("button");
        if (!nodes?.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  // Preload neighbours so next/previous feel instant.
  useEffect(() => {
    [images[(index + 1) % n], images[(index - 1 + n) % n]].forEach((im) => {
      const pre = new Image();
      pre.srcset = srcSetFor(im);
      pre.sizes = "100vw";
    });
  }, [index, images, n]);

  return createPortal(
    <div
      ref={dialog}
      className="lightbox on-dark"
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${index + 1} of ${n}: ${img.caption}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }}
      onTouchEnd={(e) => {
        const start = touch.current;
        touch.current = null;
        if (!start) return;
        const dx = e.changedTouches[0].clientX - start.x;
        const dy = e.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) (dx < 0 ? next : prev)();
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) onClose();
      }}
    >
      <button ref={closeBtn} type="button" className="icon-btn lightbox__close" onClick={onClose} aria-label="Close gallery (Escape)">
        <X aria-hidden />
      </button>
      <button type="button" className="icon-btn lightbox__nav lightbox__nav--prev" onClick={prev} aria-label="Previous image">
        <ChevronLeft aria-hidden />
      </button>

      <figure className="lightbox__figure" key={img.id}>
        <img
          src={srcFor(img, 1920)}
          srcSet={srcSetFor(img)}
          sizes="(min-width: 1024px) 85vw, 100vw"
          width={img.width}
          height={img.height}
          alt={img.alt}
        />
        <figcaption>
          <span className="label">{img.caption}</span>
          {img.credit && <span className="lightbox__credit">{img.credit}</span>}
          <span className="lightbox__count label" aria-hidden>
            {index + 1} / {n}
          </span>
        </figcaption>
      </figure>

      <button type="button" className="icon-btn lightbox__nav lightbox__nav--next" onClick={next} aria-label="Next image">
        <ChevronRight aria-hidden />
      </button>
      <p className="visually-hidden" aria-live="polite">
        {img.caption}, image {index + 1} of {n}
      </p>
    </div>,
    document.body,
  );
}
