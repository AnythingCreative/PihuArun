// Downloads hand-picked Unsplash photographs (Unsplash licence: free to use,
// credit given anyway), resizes them to WebP and merges them into
// src/data/photos.json alongside the Wikimedia Commons photos.
//
// Picked to show places, temples, hands and objects only — no faces.
// Usage: npm run unsplash            all slots
//        npm run unsplash -- aarti   one slot
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "photos");
mkdirSync(outDir, { recursive: true });
const WIDTHS = [640, 1280, 1920, 2560];

/** slot: [Unsplash photo id, CDN image key, photographer, alt text, optional vertical crop [top, bottom] as fractions] */
const SLOTS = {
  prayagraj: ["aZdnWO0LFZc", "1674358596018-5b768ca9cfd1", "Shubhanshu Prajapati", "Boats on the meeting waters of the Triveni Sangam, Prayagraj"],
  bridge: ["gCAqJBnmeRo", "1645344273898-7fd1e33803c2", "Faisal Qureshi", "Boats on the Yamuna beneath the New Yamuna Bridge at Naini, Prayagraj"],
  kumbh: ["TPmtXNJdBkY", "1742316963892-2b6fee25dfc5", "Gautam Krishnan", "Pontoon bridges across the river at the Kumbh in Prayagraj"],
  anand: ["tLIogBDhF3M", "1720755433896-d7fee36cd607", "Anubhav Maurya", "Anand Bhawan, the white-domed heritage house in Prayagraj"],
  ghats: ["wloNuC7qKf8", "1706186839147-0d708602587b", "Martijn Vonk", "Morning light on the ghats of Varanasi, boats on the Ganga"],
  ghats2: ["nXQ3vq4gAY4", "1699630923504-9a24dbaab37c", "Kishor Kumar C K", "Boats moored along the Varanasi riverfront"],
  temple: ["2FeleiOUQqM", "1661771402987-9dc9db2cbb63", "Awanish kumar", "The tall shikhara of a Vishwanath temple in Varanasi"],
  ghatPalace: ["lS7UhDWPqwU", "1708706995659-58010684bc7c", "Janardan Mahto", "Stone steps rising to Ganga Mahal Ghat, Varanasi"],
  aarti: ["jX_Ly_lI0YY", "1681797849099-0053b1567d95", "Vikas Rohilla", "A tiered brass aarti lamp blazing against the night", [0.22, 0.66]], // trims a sign above and the priest's face below
  riverfront: ["_ZQE8Ep-ceY", "1706186829065-ede677efe384", "Martijn Vonk", "The Varanasi skyline across the still Ganga"],
  hands: ["SUwPo4ErQCc", "1621801306185-8c0ccf9c8eb8", "Love Arya", "Henna-patterned hands of a bride held in the groom's hand"],
  pheras: ["bWQ6-0c_ZcM", "1597157639073-69284dc0fdaf", "Jayesh Jalodara", "The couple's hands joined during the wedding rituals"],
  mehendi: ["jirG1ekYsnY", "1730003727902-3643640a3d43", "anik das", "Mehendi being drawn in fine lines along an arm"],
};

const manifestPath = path.join(root, "src", "data", "photos.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const only = process.argv.slice(2);

for (const [slot, [id, key, author, alt, crop]] of Object.entries(SLOTS)) {
  if (only.length && !only.includes(slot)) continue;
  try {
    const res = await fetch(`https://images.unsplash.com/photo-${key}?w=2560&q=85&fm=jpg`);
    if (!res.ok) throw new Error(`${res.status}`);
    let img = sharp(Buffer.from(await res.arrayBuffer())).rotate();
    if (crop) {
      const m = await img.metadata();
      const top = Math.round(m.height * crop[0]);
      img = sharp(await img.extract({ left: 0, top, width: m.width, height: Math.round(m.height * crop[1]) - top }).toBuffer());
    }
    const { width, height } = await img.metadata();
    const widths = WIDTHS.filter((w) => w <= width);
    for (const w of widths) {
      await img.clone().resize({ width: w }).webp({ quality: 82, effort: 6 }).toFile(path.join(outDir, `${slot}-${w}.webp`));
    }
    const largest = widths[widths.length - 1];
    manifest[slot] = {
      base: `photos/${slot}`,
      widths,
      width: largest,
      height: Math.round((height * largest) / width),
      alt,
      credit: `${author} · Unsplash`,
      source: `https://unsplash.com/photos/${id}`,
    };
    console.log(`✓ ${slot}: ${id} (${width}×${height}) by ${author}`);
  } catch (err) {
    console.error(`✗ ${slot}: ${err.message}`);
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
