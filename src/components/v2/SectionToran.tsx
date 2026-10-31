import { useEffect, useRef } from "react";
import { Toran } from "../ornaments/Ornaments";

/**
 * A marigold and mango-leaf toran hung across the top of a section. It drops
 * into place, with a little bounce, the first time the section comes into
 * view, like a garland over each doorway as the guest walks through the
 * invitation.
 */
export function SectionToran() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("is-in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} className="section-toran" aria-hidden>
      <Toran height={56} />
    </div>
  );
}
