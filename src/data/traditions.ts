import type { TraditionArtKey } from "../components/scenes/TraditionArt";

export interface Tradition {
  id: string;
  name: string;
  /** Hindi / Sanskrit name, shown in Devanagari. */
  hindi: string;
  meaning: string;
  description: string;
  art: TraditionArtKey;
  /** Photo slot from scripts/fetch-photos.mjs; used instead of the illustration once fetched. */
  photoSlot: string;
}

/**
 * Illustrative cultural themes — not the couple's event schedule. Replace,
 * reorder or remove entries to match the families' own traditions.
 */
export const traditions: Tradition[] = [
  {
    id: "ganesh-vandana",
    name: "Ganesh Vandana",
    hindi: "गणेश वंदना",
    meaning: "An auspicious beginning",
    description:
      "Every sacred undertaking begins by remembering Shri Ganesh, the remover of obstacles, and asking his blessing for the path ahead.",
    art: "ganesh",
    photoSlot: "ganesh",
  },
  {
    id: "haldi",
    name: "Haldi",
    hindi: "हल्दी",
    meaning: "Warmth, joy and auspiciousness",
    description:
      "Family and friends anoint the bride and groom with turmeric paste — a golden blessing of health, radiance and happiness, shared with laughter.",
    art: "haldi",
    photoSlot: "haldi",
  },
  {
    id: "mehendi",
    name: "Mehendi",
    hindi: "मेहंदी",
    meaning: "Artistry and celebration",
    description:
      "Intricate henna patterns bloom across the hands, drawn slowly and with care, as songs and music fill the gathering.",
    art: "mehendi",
    photoSlot: "mehendi",
  },
  {
    id: "mandap",
    name: "The Mandap",
    hindi: "मंडप",
    meaning: "The sacred canopy",
    description:
      "Beneath the mandap, before the sacred fire and in the presence of family, the couple make their vows and begin a shared life.",
    art: "mandap",
    photoSlot: "mandap",
  },
  {
    id: "saat-phere",
    name: "The Seven Pheras",
    hindi: "सात फेरे",
    meaning: "Seven vows, one journey",
    description:
      "Tied together, the couple walk around Agni seven times; each circle is a promise to walk through life side by side.",
    art: "pheras",
    photoSlot: "pheras",
  },
];
