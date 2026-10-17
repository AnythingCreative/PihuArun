// Renders the site's illustrations into placeholder images:
//   public/gallery/<name>-{640,1280,1920}.webp, public/og-image.jpg, PNG icons.
// Usage: npm run art   (needs Chromium; set CHROMIUM_PATH if it isn't found)
import { createServer } from "vite";
import { chromium } from "playwright-core";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public");
const tmp = path.join(root, ".qa", "art");
mkdirSync(path.join(out, "gallery"), { recursive: true });
mkdirSync(tmp, { recursive: true });

const executablePath =
  process.env.CHROMIUM_PATH ||
  ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find((p) => existsSync(p));

const GALLERY = [
  ["sangam", 1920, 1080],
  ["ghats", 1920, 1080],
  ["diyas", 1600, 1600],
  ["brocade", 1600, 1600],
  ["mandap", 1280, 1600],
  ["haldi", 1280, 1600],
  ["mehendi", 1600, 1600],
  ["pheras", 1600, 1600],
];
const WIDTHS = [640, 1280, 1920];

const server = await createServer({ root, server: { port: 5199, strictPort: true }, logLevel: "warn" });
await server.listen();
const browser = await chromium.launch({ executablePath });

async function shot(plate, w, h, scale, file) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  await page.goto(`http://localhost:5199/art.html?plate=${plate}&w=${w}&h=${h}`);
  await page.waitForSelector("body[data-ready]");
  await page.screenshot({ path: file, type: "png" });
  await page.close();
}

// Python + Pillow does the resizing and WebP encoding.
const convert = (src, dst, width, quality = 82) =>
  execFileSync("python3", ["-I", "-c", `
import sys
from PIL import Image
src, dst, w, q = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
im = Image.open(src).convert("RGB")
h = round(im.height * w / im.width)
im = im.resize((w, h), Image.LANCZOS)
if dst.endswith(".webp"): im.save(dst, "WEBP", quality=q, method=6)
elif dst.endswith(".jpg"): im.save(dst, "JPEG", quality=q, optimize=True, progressive=True)
else: im.save(dst, "PNG", optimize=True)
`, src, dst, String(width), String(quality)]);

try {
  for (const [name, w, h] of GALLERY) {
    // render at CSS size w×h, scaled so the largest output is native resolution
    const cssW = Math.round(w / 1.25), cssH = Math.round(h / 1.25);
    const png = path.join(tmp, `${name}.png`);
    await shot(name, cssW, cssH, 1920 / cssW, png);
    for (const width of WIDTHS) convert(png, path.join(out, "gallery", `${name}-${width}.webp`), width);
    console.log("gallery", name);
  }
  const og = path.join(tmp, "og.png");
  await shot("og", 1200, 630, 1, og);
  convert(og, path.join(out, "og-image.jpg"), 1200, 86);
  const icon = path.join(tmp, "icon.png");
  await shot("icon", 512, 512, 1, icon);
  convert(icon, path.join(out, "icon-512.png"), 512);
  convert(icon, path.join(out, "apple-touch-icon.png"), 180);
  convert(icon, path.join(out, "favicon-32.png"), 32);
  console.log("og + icons");
} finally {
  await browser.close();
  await server.close();
}
