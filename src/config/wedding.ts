/**
 * Single source of truth for the wedding.
 *
 * Empty strings mean "not known yet". The site never invents a value for
 * them: it shows an honest placeholder instead (e.g. "Venue details to
 * follow") and the calendar file falls back to an all-day event.
 *
 * To finish the invitation, fill in the fields marked TO FILL below.
 */

export interface WeddingConfig {
  groom: string;
  bride: string;
  /** Wedding date, YYYY-MM-DD, in the wedding's own timezone. */
  date: string;
  /** IANA timezone of the venue. India has no daylight saving: UTC+05:30. */
  timezone: string;
  /** Offset of `timezone` from UTC, used for exact countdown maths. */
  utcOffset: string;
  city: string;
  state: string;
  country: string;

  /** TO FILL: e.g. "Shri Ram Vatika". Leave empty until confirmed. */
  venueName: string;
  /** TO FILL: full postal address. */
  venueAddress: string;
  /** Optional: a Google Maps link or "lat,lng". Built from the address if empty. */
  venueMapQuery: string;
  /** Optional: show an embedded map once the venue is known. */
  showMapEmbed: boolean;
  /** Optional travel and parking notes, shown once supplied. */
  transportNotes: string;
  parkingNotes: string;

  /** TO FILL: ceremony start, 24h "HH:MM" local time (e.g. "19:30"). */
  ceremonyStart: string;
  /** TO FILL: ceremony end, 24h "HH:MM" local time. May be after midnight (e.g. "02:00"). */
  ceremonyEnd: string;

  /** Optional RSVP form link (Google Form, etc.). Button hidden when empty. */
  rsvpUrl: string;
  /** Optional e-mail address that receives guest wishes via the guest's own mail app. */
  wishesEmail: string;

  /** Optional licensed music file (e.g. "music/shehnai.mp3" in /public). */
  musicUrl: string;

  /** Public URL of the site. Filled in automatically at build time on Netlify, Vercel, Cloudflare Pages and GitHub Pages (see vite.config.ts); set SITE_URL to override. */
  siteUrl: string;
}

export const wedding: WeddingConfig = {
  groom: "Arun",
  bride: "Pratima",
  date: "2026-11-24",
  timezone: "Asia/Kolkata",
  utcOffset: "+05:30",
  city: "Prayagraj",
  state: "Uttar Pradesh",
  country: "India",

  venueName: "",
  venueAddress: "",
  venueMapQuery: "",
  showMapEmbed: false,
  transportNotes: "",
  parkingNotes: "",

  ceremonyStart: "",
  ceremonyEnd: "",

  rsvpUrl: "",
  wishesEmail: "",

  musicUrl: "",

  siteUrl: import.meta.env.VITE_SITE_URL ?? "",
};

/** Fields that should be completed before the invitation is shared widely. */
export function missingDetails(c: WeddingConfig = wedding): string[] {
  const missing: string[] = [];
  if (!c.venueName) missing.push("venueName");
  if (!c.venueAddress) missing.push("venueAddress");
  if (!c.ceremonyStart) missing.push("ceremonyStart");
  if (!c.ceremonyEnd) missing.push("ceremonyEnd");
  return missing;
}

export const hasVenue = () => Boolean(wedding.venueName || wedding.venueAddress);
export const hasCeremonyTime = () => /^\d{2}:\d{2}$/.test(wedding.ceremonyStart);

/** Exact instant the ceremony (or, if the time is unknown, the day) begins. */
export function weddingStartsAt(c: WeddingConfig = wedding): Date {
  const time = /^\d{2}:\d{2}$/.test(c.ceremonyStart) ? c.ceremonyStart : "00:00";
  return new Date(`${c.date}T${time}:00${c.utcOffset}`);
}

/** Instant the wedding day ends in the venue's timezone. */
export function weddingDayEndsAt(c: WeddingConfig = wedding): Date {
  const start = new Date(`${c.date}T00:00:00${c.utcOffset}`);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

const dateParts = () => {
  const [y, m, d] = wedding.date.split("-").map(Number);
  return { y, m, d };
};

/** "Tuesday, 24 November 2026" — formatted in the venue's timezone. */
export function longDate(): string {
  const { y, m, d } = dateParts();
  // Noon UTC can never cross a date line for +05:30.
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: wedding.timezone,
  }).format(dt);
}

/** "24 NOVEMBER 2026" */
export function displayDate(): string {
  const { y, m, d } = dateParts();
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: wedding.timezone,
  })
    .format(dt)
    .toUpperCase();
}

/** "24.11.2026" */
export function dottedDate(): string {
  const { y, m, d } = dateParts();
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
}

export const place = () => `${wedding.city}, ${wedding.state}`;
export const fullPlace = () => `${wedding.city}, ${wedding.state}, ${wedding.country}`;

/** Formats "19:30" as "7:30 pm". */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}
