# Arun & Pratima — Wedding Invitation

A single-page, scroll-told Hindu wedding invitation for **Arun & Pratima**,
**24 November 2026**, **Prayagraj, Uttar Pradesh**.

React 19 + TypeScript + Vite, GSAP ScrollTrigger for the scroll scenes, plain
CSS with design tokens, self-hosted fonts (Cormorant Garamond, EB Garamond,
Inter, Noto Serif Devanagari). No backend.

## Run

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ locally
npm run qa         # browser QA against the build (screenshots in .qa/)
```

`dist/` is a static folder and can go on any static host (Netlify, Vercel,
GitHub Pages, Cloudflare Pages, S3). `base: "./"` makes it work from a
sub-path too.

## Fill in the wedding details

Everything lives in **`src/config/wedding.ts`**. Empty fields are shown
honestly ("Venue details to follow", "Ceremony time to be announced"); nothing
is invented.

| Field | Effect once filled |
|---|---|
| `venueName`, `venueAddress` | Venue shown, "Get Directions" (Google Maps) appears, calendar location updated |
| `venueMapQuery` | Optional exact Maps query or link |
| `showMapEmbed` | `true` adds an embedded map |
| `transportNotes`, `parkingNotes` | Shown under the venue |
| `ceremonyStart`, `ceremonyEnd` | `"HH:MM"` IST. Countdown targets the ceremony; the .ics becomes a timed event instead of all-day |
| `rsvpUrl` | Adds an RSVP button |
| `wishesEmail` | Wishes form opens the guest's mail app addressed to this e-mail (otherwise: local preview, clearly marked "not sent") |
| `musicUrl` | Plays this licensed file; without it the sound toggle plays a soft tanpura drone synthesised in the browser |
| `siteUrl` | Used for sharing; also add a canonical link and absolute OG URLs in `index.html` |

## Photographs

The page ships with original illustrations (no photos are faked). Photos replace
them section by section, without touching layout or animation code.

**Openly licensed photos (Wikimedia Commons).** `npm run photos` searches
Commons for each slot (Sangam, ghats, Ganga aarti, Banarasi brocade, Ganesh,
haldi, mehendi, mandap, pheras, marigolds, temple, diyas), keeps only CC0 /
CC BY / CC BY-SA / public-domain JPEGs at least 2400 px wide, writes WebP
sizes to `public/photos/`, and records author and licence in
`src/data/photos.json`. Credits are displayed on the page. The Prayagraj slot
only accepts files whose title or description says Sangam / Prayagraj /
Allahabad. Review `public/photos/_review.jpg`; to swap one, run e.g.
`PICK=1 npm run photos -- haldi`. Requires network access to
`commons.wikimedia.org` and `upload.wikimedia.org`.

**Your own photos.** Put files in `public/` and edit `src/data/assets.ts`
(portraits of Arun, Pratima, the couple, or any scene) and
`src/data/gallery.ts` (gallery list, with real `width`/`height` and `alt`).

`npm run art` re-renders the illustrated gallery placeholders, the social
preview image (`public/og-image.jpg`) and the PNG icons from the site's own
artwork.

## Structure

```
src/
  config/wedding.ts        single source of truth
  data/                    assets manifest, gallery, traditions, fetched photos
  components/              one component per section + navigation, lightbox
  components/ornaments/    lotus, mandala, marigold, diya, toran, arch, Ganesh motif
  components/scenes/       illustrated Sangam, ghats, diyas, brocade, ritual art
  hooks/                   countdown, reduced motion, scroll progress, in-view
  lib/                     motion tokens, calendar (.ics), share, sound, scroll
  styles/                  globals (tokens), sections, animations
scripts/                   render-art, fetch-photos, qa
```

Motion respects `prefers-reduced-motion`: no pinned scenes, nothing hidden.
