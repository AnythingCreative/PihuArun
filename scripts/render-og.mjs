// Renders the link-preview image (public/og-image.jpg, 1200×630) that
// WhatsApp, Facebook and others show when the invitation is shared.
// Uses the painted hero and the site's own fonts.
// Usage: npm run og
import { chromium } from "playwright-core";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// fonts are inlined: a page set from a string may not load local files
const font = (pkg, file) => `data:font/woff2;base64,${readFileSync(path.join(root, "node_modules", "@fontsource", pkg, "files", file)).toString("base64")}`;
const hero = path.join(root, "art-source", "hero-kailash.jpg");
if (!existsSync(hero)) throw new Error("art-source/hero-kailash.jpg is missing");
const heroUrl = `data:image/jpeg;base64,${readFileSync(hero).toString("base64")}`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Cinzel; src: url(${font("cinzel-decorative", "cinzel-decorative-latin-900-normal.woff2")}); font-weight: 900; }
@font-face { font-family: Vibes; src: url(${font("great-vibes", "great-vibes-latin-400-normal.woff2")}); }
@font-face { font-family: Inter; src: url(${font("inter", "inter-latin-500-normal.woff2")}); font-weight: 500; }
html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
.card { position: relative; width: 1200px; height: 630px; background: url(${heroUrl}) 70% 60% / cover; }
.veil { position: absolute; inset: 0; background: linear-gradient(90deg, rgb(40 6 14 / 0.9) 0%, rgb(60 10 22 / 0.72) 42%, rgb(60 10 22 / 0.1) 75%, transparent); }
.frame { position: absolute; inset: 18px; border: 2px solid #e0a526; outline: 1px solid #e0a52688; outline-offset: 6px; }
.text { position: absolute; left: 70px; top: 50%; transform: translateY(-50%); color: #fff3d6; }
.shloka { font-family: Inter; font-size: 20px; letter-spacing: 0.3em; color: #ffd76a; text-transform: uppercase; }
.names { margin: 18px 0 0; font-family: Cinzel; font-weight: 900; font-size: 92px; line-height: 1.02;
  background: linear-gradient(175deg, #fffbe8, #ffe28a 40%, #e0a526 65%, #fff0b8); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 4px 0 rgb(60 20 0 / 0.55)); }
.amp { display: block; font-family: Vibes; font-size: 70px; line-height: 0.9; color: #ffd76a; -webkit-text-fill-color: #ffd76a; }
.date { margin-top: 26px; font-family: Inter; font-size: 30px; letter-spacing: 0.18em; color: #ffe9b0; }
.venue { margin-top: 8px; font-family: Inter; font-size: 22px; letter-spacing: 0.12em; color: #fff3d6; opacity: 0.9; }
</style></head><body><div class="card"><div class="veil"></div><div class="frame"></div>
<div class="text"><div class="shloka">Wedding invitation</div>
<div class="names">ARUN<span class="amp">&amp;</span>PRATIMA</div>
<div class="date">24 NOVEMBER 2026</div><div class="venue">SHIVAYA VATIKA · PRAYAGRAJ</div></div></div></body></html>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: "png" });
await browser.close();
await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(root, "public", "og-image.jpg"));
console.log("Wrote public/og-image.jpg");
