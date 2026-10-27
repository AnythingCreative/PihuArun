import type { TraditionArtKey } from "../components/scenes/TraditionArt";
import { wedding } from "../config/wedding";

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
  /** Day of the ceremony, YYYY-MM-DD. Leave out until the families confirm it. */
  date?: string;
}

/**
 * The wedding's rituals, in order. A ritual shows its date only once it is
 * confirmed: Haldi and Mehendi on 23 November, Mandap and Pheras on the
 * wedding day. Sangeet's date is not fixed yet.
 */
export const traditions: Tradition[] = [
  {
    id: "haldi",
    name: "Haldi",
    hindi: "हल्दी",
    meaning: "Warmth, joy and auspiciousness",
    description:
      "Family and friends anoint the bride and groom with turmeric paste — a golden blessing of health, radiance and happiness, shared with laughter.",
    art: "haldi",
    photoSlot: "haldi",
    date: "2026-11-23",
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
    date: "2026-11-23",
  },
  {
    id: "sangeet",
    name: "Sangeet",
    hindi: "संगीत",
    meaning: "Music, dance and laughter",
    description:
      "The families meet in song: dholak beats, ghungroo and old wedding geet fill the night as everyone dances together before the big day.",
    art: "haldi",
    photoSlot: "marigold",
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
    date: wedding.date,
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
    date: wedding.date,
  },
];
