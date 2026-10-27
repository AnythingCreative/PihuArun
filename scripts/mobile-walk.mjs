// Phone walkthrough: opens the doors like a guest, then scrolls the whole
// page in small wheel steps (so pinned scenes play as they really do),
// saving a frame every step to .qa/walk/<device>-NNN.png.
// Usage: npm run build && node scripts/mobile-walk.mjs [stepFraction]
import { preview } from "vite";
import { chromium, devices } from "playwright-core";
import { mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".qa", "walk");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const step = Number(process.argv[2] ?? 0.5);

const server = await preview({ root, preview: { port: 4198, strictPort: true }, logLevel: "warn" });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });

for (const [label, device] of [["iphone13", devices["iPhone 13"]], ["pixel5", devices["Pixel 5"]]]) {
  const ctx = await browser.newContext({ ...device, defaultBrowserType: undefined });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:4198/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, `${label}-000-gate.png`) });
  await page.tap(".gate__open");
  await page.waitForTimeout(3600);
  const vh = await page.evaluate(() => innerHeight);
  let i = 1;
  for (;;) {
    await page.screenshot({ path: path.join(outDir, `${label}-${String(i).padStart(3, "0")}.png`) });
    const done = await page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2);
    if (done || i > 140) break;
    await page.mouse.wheel(0, Math.round(vh * step));
    await page.waitForTimeout(700);
    i++;
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`${label}: ${i} frames, overflow ${overflow}px, ${errors.length} console issues${errors.length ? ": " + [...new Set(errors)].slice(0, 5).join(" | ") : ""}`);
  await ctx.close();
}

await browser.close();
server.httpServer.close();
