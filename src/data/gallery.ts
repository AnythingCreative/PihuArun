import { publicUrl } from "./assets";
import photos from "./photos.json";

/**
 * Gallery content. Each entry is an image file in /public plus its intrinsic
 * size (so the layout never shifts while images load).
 *
 * The current entries are illustrated placeholders rendered from the site's
 * own artwork (see scripts/render-art.mjs). To use real photographs, drop
 * resized files into public/gallery/ and replace the entries below — keep
 * `width`/`height` accurate and write a real description in `alt`.
 */

export interface GalleryImage {
  id: string;
  /** Path relative to /public, without size suffix or extension. */
  base: string;
  /** Widths available as `${base}-${w}.webp`. */
  widths: number[];
  width: number;
  height: number;
  alt: string;
  caption: string;
  /** Layout hint for the editorial grid. */
  span: "wide" | "tall" | "regular";
  placeholder: boolean;
  /** Photographer and licence, shown in the lightbox. */
  credit?: string;
}

const W = [640, 1280, 1920];

const illustrations: GalleryImage[] = [
  {
    id: "sangam",
    base: "gallery/sangam",
    widths: W,
    width: 1920,
    height: 1080,
    alt: "Illustration: sunrise over the Triveni Sangam in Prayagraj, with pilgrim boats on the meeting waters of the Ganga and Yamuna.",
    caption: "Sunrise at the Sangam",
    span: "wide",
    placeholder: true,
  },
  {
    id: "mandap",
    base: "gallery/mandap",
    widths: W,
    width: 1280,
    height: 1600,
    alt: "Illustration: a wedding mandap with marigold strings and the sacred fire.",
    caption: "The mandap",
    span: "tall",
    placeholder: true,
  },
  {
    id: "diyas",
    base: "gallery/diyas",
    widths: W,
    width: 1600,
    height: 1600,
    alt: "Illustration: leaf-bowl diyas with marigolds floating on the river at night.",
    caption: "Lamps on the river",
    span: "regular",
    placeholder: true,
  },
  {
    id: "brocade",
    base: "gallery/brocade",
    widths: W,
    width: 1600,
    height: 1600,
    alt: "Illustration: crimson Banarasi brocade, a brass kalash and marigold garlands.",
    caption: "Brocade & brass",
    span: "regular",
    placeholder: true,
  },
  {
    id: "ghats",
    base: "gallery/ghats",
    widths: W,
    width: 1920,
    height: 1080,
    alt: "Illustration: the ghats of Banaras at dusk, lamps glowing on the stone steps.",
    caption: "Evening on the ghats",
    span: "wide",
    placeholder: true,
  },
  {
    id: "haldi",
    base: "gallery/haldi",
    widths: W,
    width: 1280,
    height: 1600,
    alt: "Illustration: a brass bowl of turmeric paste with mango leaves and marigolds.",
    caption: "Haldi",
    span: "tall",
    placeholder: true,
  },
  {
    id: "mehendi",
    base: "gallery/mehendi",
    widths: W,
    width: 1600,
    height: 1600,
    alt: "Illustration: a circular mehendi pattern and a henna cone.",
    caption: "Mehendi",
    span: "regular",
    placeholder: true,
  },
  {
    id: "pheras",
    base: "gallery/pheras",
    widths: W,
    width: 1600,
    height: 1600,
    alt: "Illustration: seven steps around the sacred fire, and the knotted cloth that ties the couple.",
    caption: "Seven steps",
    span: "regular",
    placeholder: true,
  },
];

/** Photo slots shown in the gallery, in order, once fetched (see scripts/fetch-photos.mjs). */
const PHOTO_GALLERY: { slot: string; caption: string; span: GalleryImage["span"] }[] = [
  { slot: "prayagraj", caption: "The Sangam, Prayagraj", span: "wide" },
  { slot: "marigold", caption: "Marigolds", span: "tall" },
  { slot: "temple", caption: "Temple, Varanasi", span: "regular" },
  { slot: "aarti", caption: "Ganga aarti", span: "regular" },
  { slot: "ghats", caption: "The ghats of Banaras", span: "wide" },
  { slot: "ganesh", caption: "Shri Ganesh", span: "tall" },
  { slot: "diyas", caption: "Diyas", span: "regular" },
  { slot: "mehendi", caption: "Mehendi", span: "regular" },
];

type Fetched = { base: string; widths: number[]; width: number; height: number; alt: string; credit: string };
const fetched = photos as Record<string, Fetched>;

const photoGallery: GalleryImage[] = PHOTO_GALLERY.filter((p) => fetched[p.slot]?.widths.length).map((p) => {
  const f = fetched[p.slot];
  return {
    id: p.slot,
    base: f.base,
    widths: f.widths,
    width: f.width,
    height: f.height,
    alt: f.alt,
    caption: p.caption,
    credit: f.credit,
    span: p.span,
    placeholder: false,
  };
});

/** Photographs when at least six are available; otherwise the illustrated set. */
export const gallery: GalleryImage[] = photoGallery.length >= 6 ? photoGallery : illustrations;

export const srcFor = (img: GalleryImage, w: number) => publicUrl(`${img.base}-${w}.webp`);
export const srcSetFor = (img: GalleryImage) => img.widths.map((w) => `${srcFor(img, w)} ${w}w`).join(", ");
