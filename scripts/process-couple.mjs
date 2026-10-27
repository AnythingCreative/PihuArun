// Turns the couple's own photographs in public/couple/ into responsive WebP
// files (public/couple/web/) and writes src/data/couple.json for the site.
//
// Usage:  put JPG / PNG / WebP / HEIC-converted files in public/couple/, then
//         npm run couple
// Naming hints (optional): a file name containing "hero" is used full-screen
// at the top; "arun" / "pratima" / "pihu" become the individual portraits.
// Everything else, in file-name order, becomes the story prints and gallery.
import { readdirSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "public", "couple");
const outDir = path.join(srcDir, "web");
const manifestPath = path.join(root, "src", "data", "couple.json");
const WIDTHS = [640, 1280, 1920];

if (!existsSync(srcDir)) {
  mkdirSync(srcDir, { recursive: true });
  console.log("Created public/couple/. Put your photos there and run npm run couple again.");
}
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const files = readdirSync(srcDir)
  .filter((f) => /\.(jpe?g|png|webp|tiff?|avif)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

const manifest = [];
for (const file of files) {
  const name = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "photo";
  const img = sharp(path.join(srcDir, file)).rotate();
  const { width: w0, height: h0, orientation } = await img.metadata();
  // EXIF orientations 5–8 swap width and height once rotated
  const [width, height] = orientation >= 5 ? [h0, w0] : [w0, h0];
  const widths = WIDTHS.filter((w) => w <= width);
  if (!widths.length) widths.push(width);
  for (const w of widths) {
    await img.clone().resize({ width: w }).webp({ quality: 82, effort: 6 }).toFile(path.join(outDir, `${name}-${w}.webp`));
  }
  const largest = widths[widths.length - 1];
  manifest.push({ name, base: `couple/web/${name}`, widths, width: largest, height: Math.round((height * largest) / width) });
  console.log(`✓ ${file} → ${name} (${width}×${height})`);
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${manifest.length} photo(s) written to ${path.relative(root, manifestPath)}.`);
