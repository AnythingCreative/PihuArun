import { useEffect, useRef } from "react";

/** Paper sky lanterns drifting upward — one pre-rendered sprite, transform-only, paused off screen. */
const LANTERNS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 41 + (i % 3) * 13) % 100,
  size: 18 + ((i * 7) % 5) * 7,
  dur: 16 + ((i * 11) % 12),
  delay: -((i * 2.3) % 24),
}));

/** How many section skies are on screen; while any is, the page-wide lanterns step aside. */
let skiesInView = 0;

/** The sprite carries its glow, so the drawn lantern is ~40% of the box. */
const GLOW = 2.4;

export function SkyLanterns({ className = "", count = LANTERNS.length, scale = 1 }: { className?: string; count?: number; scale?: number }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const isPage = el.classList.contains("lanterns--page");
    let visible = false;
    const setVisible = (v: boolean) => {
      if (v === visible) return;
      visible = v;
      el.classList.toggle("is-running", v);
      if (isPage) return;
      skiesInView += v ? 1 : -1;
      // two lantern skies stacked on screen overload phones; keep only the section's own
      document.documentElement.classList.toggle("sky-in-view", skiesInView > 0);
    };
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => {
      io.disconnect();
      setVisible(false);
    };
  }, []);

  return (
    <div ref={root} className={`lanterns ${className}`} aria-hidden>
      {LANTERNS.slice(0, count).map((l, i) => (
        <span
          key={i}
          className="lantern"
          style={{
            left: `${l.left}%`,
            width: `${l.size * scale * GLOW}px`,
            height: `${l.size * 1.25 * scale * GLOW}px`,
            animationDuration: `${l.dur}s, ${l.dur / 4}s`,
            animationDelay: `${l.delay}s, ${l.delay / 3}s`,
          }}
        />
      ))}
    </div>
  );
}
