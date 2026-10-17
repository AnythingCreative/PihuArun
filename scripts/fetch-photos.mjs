// Fetches openly licensed, high-resolution photographs from Wikimedia Commons
// for every image slot on the page, resizes them to WebP and writes
// src/data/photos.ts (with author + licence credits) for the site to use.
//
// Needs network access to commons.wikimedia.org and upload.wikimedia.org.
// Usage:  npm run photos            fetch every slot
//         npm run photos -- haldi   fetch one slot
// Review public/photos/_review.jpg afterwards and re-run a slot (with
// PICK=<n> to choose another candidate) if a photo isn't right.
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "photos");
const rawDir = path.join(root, ".qa", "photos-raw");
mkdirSync(outDir, { recursive: true });
mkdirSync(rawDir, { recursive: true });

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "ArunPratimaWeddingSite/1.0 (personal wedding invitation; photo credits shown on page)";
const OK_LICENSE = /^(CC0|CC BY(-SA)? [0-9.]+|Public domain|PD)/i;

/**
 * Each slot: search terms, a filter that must match the file title or
 * description (so a Varanasi photo can never be labelled Prayagraj), and the
 * minimum width wanted.
 */
const SLOTS = {
  prayagraj: { q: "Triveni Sangam Prayagraj", must: /sangam|prayagraj|allahabad/i, landscape: true },
  ghats: { q: "Varanasi ghats evening", must: /ghat|varanasi|banaras|benares/i, landscape: true },
  aarti: { q: "Ganga aarti Varanasi diyas", must: /aarti|arti|diya|deepawali|lamp/i, landscape: true },
  brocade: { q: "Banarasi silk saree brocade", must: /banaras|benaras|saree|sari|brocade|silk/i },
  ganesh: { q: "Ganesha idol temple", must: /ganesh|ganapati|vinayak/i },
  haldi: { q: "Haldi ceremony wedding", must: /haldi|turmeric/i },
  mehendi: { q: "Mehndi bridal hands", must: /mehndi|mehendi|henna/i },
  mandap: { q: "Hindu wedding mandap", must: /mandap|wedding|vivah/i },
  pheras: { q: "Hindu wedding pheras sacred fire", must: /phera|saptapadi|wedding|agni/i },
  marigold: { q: "Marigold garlands flower market India", must: /marigold|tagetes|garland|genda/i },
  temple: { q: "Kashi Vishwanath temple Varanasi", must: /temple|mandir|vishwanath/i, landscape: true },
  diyas: { q: "Diwali diyas oil lamps", must: /diya|deepam|lamp|diwali/i },
};

const WIDTHS = [640, 1280, 1920, 2560];

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: "json", origin: "*", ...params })}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const strip = (html = "") => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function candidates(slot) {
  const { q, must, landscape } = SLOTS[slot];
  const data = await api({
    action: "query",
    generator: "search",
    gsrsearch: `${q} filetype:bitmap`,
    gsrnamespace: "6",
    gsrlimit: "50",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "2560",
  });
  return Object.values(data.query?.pages ?? {})
    .map((p) => ({ title: p.title, ...p.imageinfo?.[0] }))
    .filter((f) => f.mime === "image/jpeg" && f.width >= 2400)
    .filter((f) => !landscape || f.width > f.height * 1.25)
    .filter((f) => OK_LICENSE.test(f.extmetadata?.LicenseShortName?.value ?? ""))
    .filter((f) => must.test(`${f.title} ${strip(f.extmetadata?.ImageDescription?.value)}`))
    .sort((a, b) => b.width * b.height - a.width * a.height);
}

function resize(src, base) {
  execFileSync("python3", ["-I", "-c", `
import sys
from PIL import Image, ImageOps
src, base = sys.argv[1], sys.argv[2]
im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
for w in [${WIDTHS.join(",")}]:
    if w > im.width: continue
    h = round(im.height * w / im.width)
    im.resize((w, h), Image.LANCZOS).save(f"{base}-{w}.webp", "WEBP", quality=82, method=6)
print(im.width, im.height)
`, src, base]);
}

const manifestPath = path.join(root, "src", "data", "photos.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
const only = process.argv.slice(2);
const pick = Number(process.env.PICK ?? 0);

for (const slot of Object.keys(SLOTS)) {
  if (only.length && !only.includes(slot)) continue;
  try {
    const list = await candidates(slot);
    const f = list[pick];
    if (!f) {
      console.warn(`- ${slot}: no suitable openly licensed photo found`);
      continue;
    }
    const raw = path.join(rawDir, `${slot}.jpg`);
    const res = await fetch(f.thumburl ?? f.url, { headers: { "User-Agent": UA } });
    writeFileSync(raw, Buffer.from(await res.arrayBuffer()));
    resize(raw, path.join(outDir, slot));
    const tw = Math.min(f.thumbwidth ?? f.width, f.width);
    const th = Math.round((f.height * tw) / f.width);
    const meta = f.extmetadata ?? {};
    manifest[slot] = {
      base: `photos/${slot}`,
      widths: WIDTHS.filter((w) => w <= tw),
      width: tw,
      height: th,
      alt: strip(meta.ImageDescription?.value).slice(0, 200) || f.title.replace(/^File:|\.\w+$/g, ""),
      credit: `${strip(meta.Artist?.value) || "Unknown author"} · ${meta.LicenseShortName?.value} · Wikimedia Commons`,
      source: f.descriptionurl,
    };
    console.log(`✓ ${slot}: ${f.title} (${f.width}×${f.height}, ${meta.LicenseShortName?.value}) — ${list.length} candidates`);
  } catch (err) {
    console.error(`✗ ${slot}: ${err.message}`);
  }
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

// contact sheet for a human check
const shots = Object.keys(manifest).map((s) => path.join(outDir, `${s}-640.webp`)).filter(existsSync);
if (shots.length) {
  execFileSync("python3", ["-I", "-c", `
import sys
from PIL import Image
files = sys.argv[2:]
cols = 4; cw, ch = 480, 320
rows = (len(files) + cols - 1) // cols
sheet = Image.new("RGB", (cols * cw, rows * ch), "white")
for i, f in enumerate(files):
    im = Image.open(f).convert("RGB"); im.thumbnail((cw, ch))
    sheet.paste(im, ((i % cols) * cw, (i // cols) * ch))
sheet.save(sys.argv[1], quality=85)
`, path.join(outDir, "_review.jpg"), ...shots]);
}
console.log(`\nWrote ${path.relative(root, manifestPath)}. Review public/photos/_review.jpg, then npm run build.`);
