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

**Unsplash photos.** `npm run unsplash` downloads the hand-picked Unsplash
photos listed in `scripts/fetch-unsplash.mjs` (places, temples, hands and
objects only, no faces) and merges them into `src/data/photos.json`.
`TITLE="File:x.jpg" npm run photos -- <slot>` swaps in an exact Commons file.

**AI-painted artwork (V2).** Generate the images listed in `AI-ART-PROMPTS.md`,
save them in `art-source/` (kept out of the published site) with the file names given there, and run
`npm run art-in`. Each slot (hero, Ganesh, Shiv-Parvati, palace, couple
portrait, pheras, ritual cards) replaces its hand-drawn or photo fallback.
V1 (the photo-first version) is kept in `../v1-photo-first/`. Stock photos and old placeholders no longer used are kept in `asset-archive/`.

**Link preview.** `npm run og` re-renders `public/og-image.jpg` (the picture WhatsApp shows) from the painted hero. Once the site has a domain, set `siteUrl` and make `og:image` in `index.html` a full https URL.

The site asks search engines not to index it (`robots.txt` and a `noindex` tag) and browsers not to translate it.

**Your own photos.** Drop JPG/PNG/WebP files into `public/couple/` and run
`npm run couple`. A file named with `hero` fills the opening screen; names
containing `arun` / `pratima` / `pihu` become the portraits; the rest become
the story prints and lead the gallery.

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
