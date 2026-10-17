/**
 * Asset manifest. Every photograph the page can show is listed here, so
 * images can be replaced without touching layout or animation code.
 *
 * `null` means "no photograph supplied": the page then uses its own
 * illustration or an elegant empty frame — it never invents a photo.
 * Paths are relative to /public.
 */

export interface Photo {
  src: string;
  /** Optional responsive sources, e.g. "couple/arun-800.webp 800w, couple/arun-1600.webp 1600w". */
  srcSet?: string;
  width: number;
  height: number;
  alt: string;
  /** CSS object-position, e.g. "50% 30%" to keep a face in frame. */
  focus?: string;
  credit?: string;
}

import photos from "./photos.json";

/** Resolves a /public path against Vite's base so the build works from any sub-path. */
export const publicUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

/** Openly licensed photographs fetched by scripts/fetch-photos.mjs (empty until it has run). */
interface FetchedPhoto { base: string; widths: number[]; width: number; height: number; alt: string; credit: string; source: string }
const fetched = photos as Record<string, FetchedPhoto>;

/** Turns a fetched photo slot into a Photo, or null if that slot hasn't been fetched. */
export function photo(slot: string, focus?: string): Photo | null {
  const f = fetched[slot];
  if (!f || !f.widths.length) return null;
  const largest = f.widths[f.widths.length - 1];
  return {
    src: `${f.base}-${f.widths.includes(1920) ? 1920 : largest}.webp`,
    srcSet: f.widths.map((w) => `${publicUrl(`${f.base}-${w}.webp`)} ${w}w`).join(", "),
    width: f.width,
    height: f.height,
    alt: f.alt,
    focus,
    credit: `Photo: ${f.credit}`,
  };
}

export const assets: {
  /** Replaces the illustrated Sangam scene. Use a genuine Prayagraj photograph. */
  prayagraj: Photo | null;
  /** Replace any of the three Banaras frames (ghats, diyas, brocade). */
  banaras: [Photo | null, Photo | null, Photo | null];
  arunPortrait: Photo | null;
  pratimaPortrait: Photo | null;
  couplePortrait: Photo | null;
} = {
  prayagraj: photo("prayagraj"),
  banaras: [photo("ghats"), photo("aarti"), photo("brocade")],
  arunPortrait: null,
  pratimaPortrait: null,
  couplePortrait: null,
};
