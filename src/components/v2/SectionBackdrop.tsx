import { art, publicUrl } from "../../data/assets";

/**
 * A painted photograph behind a whole section, under a colour veil so the
 * text on top stays readable. Renders nothing until that artwork exists.
 */
export function SectionBackdrop({ slot, className = "", focus }: { slot: string; className?: string; focus?: string }) {
  const pic = art(slot, "", focus);
  if (!pic) return null;
  return (
    <div className={`backdrop ${className}`} aria-hidden>
      <img
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
