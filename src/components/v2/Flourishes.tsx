/**
 * Small ambient decorations shared by several sections. Every one is a
 * static shape moved only by transform/opacity keyframes, so they stay on
 * the GPU and never make scrolling choppy.
 */

import { useEffect, useRef } from "react";

const PETAL_COLOURS = ["#f4a21c", "#ff7a1a", "#d6246e", "#f6c34a", "#e2551f"];

/** Marigold and rose petals drifting down. */
export function FallingPetals({ count = 12, className = "" }: { count?: number; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  // petals only fall while their section is on screen
  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-running", e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={root} className={`petals ${className}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${(i * 37 + 11) % 100}%`,
            width: `${9 + (i % 4) * 3}px`,
            height: `${13 + (i % 4) * 4}px`,
            background: `radial-gradient(circle at 35% 30%, #fff3c4 0 12%, ${PETAL_COLOURS[i % PETAL_COLOURS.length]} 60%)`,
            animationDuration: `${11 + (i % 6) * 2.3}s, ${3 + (i % 3)}s`,
            animationDelay: `${-((i * 1.9) % 14)}s, ${-(i % 4)}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Four-point gold sparkles twinkling around a focal point. */
export function Sparkles({ count = 14, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`sparkles ${className}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + i;
        const r = 30 + ((i * 17) % 22);
        return (
          <span
            key={i}
            className="sparkle"
            style={{
              left: `${50 + Math.cos(a) * r}%`,
              top: `${50 + Math.sin(a) * r * 0.8}%`,
              width: `${8 + (i % 3) * 6}px`,
              height: `${8 + (i % 3) * 6}px`,
              animationDelay: `${-((i * 0.53) % 3.2)}s`,
              animationDuration: `${2.4 + (i % 4) * 0.6}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/** Soft rays of light turning slowly behind a heading. */
export function LightRays({ className = "" }: { className?: string }) {
  return <div className={`rays ${className}`} aria-hidden />;
}
