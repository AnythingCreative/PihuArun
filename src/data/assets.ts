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
import couple from "./couple.json";
import artwork from "./art.json";

/** Resolves a /public path against Vite's base so the build works from any sub-path. */
export const publicUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

/** Openly licensed photographs fetched by scripts/fetch-photos.mjs (empty until it has run). */
interface FetchedPhoto { base: string; widths: number[]; width: number; height: number; alt: string; credit: string; source: string }
const fetched = photos as Record<string, FetchedPhoto>;

/** Turns a fetched photo slot into a Photo, or null if that slot hasn't been fetched. */
/** Crops that keep the subject in frame (e.g. trim a passer-by at the mandap edge). */
const FOCUS: Record<string, string> = { aarti: "30% 50%", temple: "40% 30%" };

export function photo(slot: string, focus = FOCUS[slot]): Photo | null {
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

/** The couple's own photographs, processed by scripts/process-couple.mjs (empty until it has run). */
interface CouplePhoto { name: string; base: string; widths: number[]; width: number; height: number }
const own = couple as CouplePhoto[];

function ownPhoto(c: CouplePhoto, alt: string, focus = "50% 30%"): Photo {
  return {
    src: `${c.base}-${c.widths[c.widths.length - 1]}.webp`,
    srcSet: c.widths.map((w) => `${publicUrl(`${c.base}-${w}.webp`)} ${w}w`).join(", "),
    width: c.width,
    height: c.height,
    alt,
    focus,
  };
}

const pick = (test: RegExp) => own.find((c) => test.test(c.name));
const heroFile = pick(/hero/) ?? own.find((c) => c.height > c.width) ?? own[0];
const arunFile = pick(/arun/);
const pratimaFile = pick(/pratima|pihu/);
const used = new Set([heroFile, arunFile, pratimaFile]);
const rest = own.filter((c) => !used.has(c));

export const coupleAlt = "Arun and Pratima";

export const assets: {
  /** Full-screen photograph behind the names. The couple's own if supplied, else a stock photo. */
  hero: Photo | null;
  /** True when `hero` is one of the couple's own photographs. */
  heroIsCouple: boolean;
  /** Replaces the illustrated Sangam scene. Use a genuine Prayagraj photograph. */
  prayagraj: Photo | null;
  /** Replace any of the three Banaras frames (ghats, diyas, brocade). */
  banaras: [Photo | null, Photo | null, Photo | null];
  arunPortrait: Photo | null;
  pratimaPortrait: Photo | null;
  couplePortrait: Photo | null;
  /** Further couple photographs, shown as overlapping prints in "our story". */
  storyPrints: Photo[];
} = {
  hero: heroFile ? ownPhoto(heroFile, coupleAlt) : photo("aarti"),
  heroIsCouple: Boolean(heroFile),
  prayagraj: photo("prayagraj"),
  banaras: [photo("ghats"), photo("temple"), photo("riverfront")],
  arunPortrait: arunFile ? ownPhoto(arunFile, "Arun") : null,
  pratimaPortrait: pratimaFile ? ownPhoto(pratimaFile, "Pratima") : null,
  couplePortrait: rest[0] ? ownPhoto(rest[0], coupleAlt) : heroFile ? ownPhoto(heroFile, coupleAlt) : null,
  storyPrints: rest.slice(1).map((c) => ownPhoto(c, coupleAlt)),
};

/** All of the couple's own photographs (public/couple/). */
export const ownPhotos = own;

/** AI-painted artwork from public/art/ (scripts/process-art.mjs); null until that slot is supplied. */
interface ArtFile { base: string; widths: number[]; width: number; height: number }
const artFiles = artwork as Record<string, ArtFile>;

export function art(slot: string, alt: string, focus?: string): Photo | null {
  const a = artFiles[slot];
  if (!a) return null;
  return {
    src: `${a.base}-${a.widths.includes(1920) ? 1920 : a.widths[a.widths.length - 1]}.webp`,
    srcSet: a.widths.map((w) => `${publicUrl(`${a.base}-${w}.webp`)} ${w}w`).join(", "),
    width: a.width,
    height: a.height,
    alt,
    focus,
  };
}
