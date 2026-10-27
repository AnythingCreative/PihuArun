// Turns the AI-painted originals in art-source/ (see AI-ART-PROMPTS.md) into
// responsive WebP files in public/art/web/ and writes src/data/art.json.
// Each file's name (without extension) is its slot, e.g. hero-kailash.jpg.
//
// Usage: npm run art-in
import { readdirSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// originals stay out of public/ so the full-size files are never published
const srcDir = path.join(root, "art-source");
const outDir = path.join(root, "public", "art", "web");
const manifestPath = path.join(root, "src", "data", "art.json");
const WIDTHS = [640, 1280, 1920, 2560];

mkdirSync(srcDir, { recursive: true });
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const manifest = {};
for (const file of readdirSync(srcDir).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)).sort()) {
  const slot = path.parse(file).name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const img = sharp(path.join(srcDir, file)).rotate();
  const { width, height } = await img.metadata();
  const widths = WIDTHS.filter((w) => w <= width);
  if (!widths.length) widths.push(width);
  for (const w of widths) {
    await img.clone().resize({ width: w }).webp({ quality: 84, effort: 6 }).toFile(path.join(outDir, `${slot}-${w}.webp`));
  }
  const largest = widths[widths.length - 1];
  manifest[slot] = { base: `art/web/${slot}`, widths, width: largest, height: Math.round((height * largest) / width) };
  console.log(`✓ ${file} → ${slot} (${width}×${height})`);
}

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${Object.keys(manifest).length} artwork(s) written to ${path.relative(root, manifestPath)}.`);
