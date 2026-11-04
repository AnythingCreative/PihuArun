// Guest photo album checks (npm run album): hidden without a link or before the date,
// ?mode previews, popup open/close, phone tap, A5 print. Uses a test link; public/album.js is untouched.
import { preview } from "vite";
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";
const server = await preview({ preview: { port: 4197, strictPort: true }, logLevel: "warn" });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const URL_ = "http://localhost:4197/";
const TEST = "https://photos.app.goo.gl/AlbumTestLink123";
const OUT = process.env.OUT || ".";
const res = [];
const check = (name, ok, detail = "") => {
  res.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
const fakeNow = (iso) => `{
  const T = new Date(${JSON.stringify(iso)}).getTime(), start = Date.now(), R = Date;
  class D extends R { constructor(...a) { super(...(a.length ? a : [T + (R.now() - start)])); } static now() { return T + (R.now() - start); } }
  window.Date = D;
}`;
async function open({ link = TEST, now = "2026-11-03T12:00:00+05:30", query = "", phone = false, lang } = {}) {
  const ctx = await browser.newContext(phone ? { viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true } : { viewport: { width: 1366, height: 800 } });
  await ctx.addInitScript(fakeNow(now));
  if (lang) await ctx.addInitScript(`localStorage.setItem("invite-lang", "${lang}")`);
  await ctx.route("**/album.js", (r) => r.fulfill({ contentType: "application/javascript", body: `window.GUEST_ALBUM_URL = ${JSON.stringify(link)};` }));
  await ctx.route(TEST + "**", (r) => r.fulfill({ contentType: "text/html", body: "<title>album</title>test album" }));
  const p = await ctx.newPage();
  p.errs = [];
  p.on("pageerror", (e) => p.errs.push("pageerror " + e.message));
  p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && p.errs.push(`${m.type()} ${m.text()}`));
  await p.goto(URL_ + query + "#wishes", { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  return p;
}
const chipCount = (p) => p.locator(".album-chip").count();
const isOpen = (p) => p.evaluate(() => !!document.querySelector("dialog.album-dialog")?.open);

/* when it appears */
for (const [label, opts, want] of [
  ["no link, ?mode=album", { link: "", query: "?mode=album" }, 0],
  ["not a web link, ?mode=album", { link: "javascript:alert(1)", query: "?mode=album" }, 0],
  ["link set, 3 Nov (before the date)", {}, 0],
  ["link set, 3 Nov 23:59 IST", { now: "2026-11-03T23:59:00+05:30" }, 0],
  ["link set, 4 Nov (from today)", { now: "2026-11-04T00:01:00+05:30" }, 1],
  ["link set, 23 Nov (Haldi day)", { now: "2026-11-23T08:00:00+05:30" }, 1],
  ["link set, ?mode=album early", { query: "?mode=album" }, 1],
  ["link set, ?mode=after early", { query: "?mode=after" }, 1],
  ["link set, 30 Nov (after)", { now: "2026-11-30T10:00:00+05:30" }, 1],
]) {
  const p = await open(opts);
  check(`shown: ${label}`, (await chipCount(p)) === want, `chips ${await chipCount(p)}`);
  await p.context().close();
}

/* the small card and the popup, desktop */
{
  const p = await open({ query: "?mode=album" });
  const chip = p.locator(".album-chip");
  await chip.scrollIntoViewIfNeeded();
  await p.waitForTimeout(400);
  const box = await chip.boundingBox();
  check("small card is a button, 140–180px wide", (await chip.evaluate((e) => e.tagName)) === "BUTTON" && box.width >= 140 && box.width <= 180, `${Math.round(box.width)}px`);
  const chipText = await chip.innerText();
  check("small card shows QR, line and hint", (await chip.locator("svg").count()) === 1 && /Share your photos with us/.test(chipText) && /Tap to open/i.test(chipText), chipText.replace(/\n/g, " / "));
  check("cursor is pointer", (await chip.evaluate((e) => getComputedStyle(e).cursor)) === "pointer");
  await chip.hover();
  await p.waitForTimeout(500);
  check("lifts on hover", /matrix\(1, 0, 0, 1, 0, -/.test(await chip.evaluate((e) => getComputedStyle(e).transform)));
  await p.screenshot({ path: `${OUT}/album-chip.png`, clip: { x: box.x - 60, y: box.y - 40, width: box.width + 120, height: box.height + 80 } });

  await chip.click();
  await p.waitForTimeout(600);
  check("click opens the popup", await isOpen(p));
  check("page scroll locked", (await p.evaluate(() => getComputedStyle(document.documentElement).overflow)) === "hidden");
  const card = await p.locator(".album-card").innerText();
  check("full card content", ["GUEST PHOTO ALBUM", "Arun", "Pratima", "24.11.2026", "Share your photos with us", "Open your phone camera", "Tap the link", "Tap + and add", "memory we keep"].every((s) => card.includes(s)), card.replace(/\n/g, " / "));
  const svgs = await p.evaluate(() => [...document.querySelectorAll(".album-chip__qr svg, .album-card__qr svg")].map((s) => s.outerHTML));
  check("same QR drawing on both cards", svgs.length === 2 && svgs[0] === svgs[1] && svgs[0].length > 1000);
  await p.screenshot({ path: `${OUT}/album-popup-desktop.png` });
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  check("Esc closes", !(await isOpen(p)));
  check("focus returns to the small card", await p.evaluate(() => document.activeElement?.classList.contains("album-chip")));
  check("scroll unlocked after closing", (await p.evaluate(() => getComputedStyle(document.documentElement).overflow)) !== "hidden");

  await p.keyboard.press("Enter");
  await p.waitForTimeout(500);
  check("Enter on the small card opens", await isOpen(p));
  await p.locator(".album-dialog__close").click();
  await p.waitForTimeout(400);
  check("× closes", !(await isOpen(p)));

  await chip.click();
  await p.waitForTimeout(500);
  await p.mouse.click(12, 400);
  await p.waitForTimeout(400);
  check("backdrop click closes", !(await isOpen(p)));
  await chip.click();
  await p.waitForTimeout(500);
  await p.locator(".album-card__line").click();
  check("click inside the card keeps it open", await isOpen(p));

  /* print: the card alone, one A5 page */
  await p.emulateMedia({ media: "print" });
  const pdf = await p.pdf({ preferCSSPageSize: true, printBackground: true });
  writeFileSync(`${OUT}/album-print.pdf`, pdf);
  const s = pdf.toString("latin1");
  const pages = (s.match(/\/Type\s*\/Page[^s]/g) || []).length;
  const box5 = s.match(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)/);
  check("print: one page", pages === 1, `${pages} page(s)`);
  check("print: A5 (148 × 210 mm)", box5 && Math.abs(box5[1] - 419.5) < 2 && Math.abs(box5[2] - 595.3) < 2, box5 ? `${box5[1]} × ${box5[2]} pt` : "no MediaBox");
  const visible = await p.evaluate(() => [...document.body.children].filter((e) => getComputedStyle(e).display !== "none").map((e) => e.tagName + "." + e.className));
  check("print: only the card", visible.length === 1 && visible[0].startsWith("DIALOG"), visible.join(", "));
  await p.setViewportSize({ width: 560, height: 794 });
  await p.screenshot({ path: `${OUT}/album-print.png` });
  await p.emulateMedia({ media: "screen" });
  check("desktop: no console errors", !p.errs.length, p.errs.join(" | "));
  await p.context().close();
}

/* phone */
for (const lang of ["en", "hi"]) {
  const p = await open({ query: "?mode=album", phone: true, lang });
  await p.locator(".album-chip").tap();
  await p.waitForTimeout(600);
  const fit = await p.evaluate(() => {
    const d = document.querySelector(".album-dialog");
    const c = document.querySelector(".album-card").getBoundingClientRect();
    return { page: document.documentElement.scrollWidth - innerWidth, dialog: d.scrollWidth - d.clientWidth, left: Math.round(c.left), right: Math.round(innerWidth - c.right), scrolls: d.scrollHeight > d.clientHeight };
  });
  check(`phone ${lang}: card fits the width, no sideways scroll`, fit.page <= 0 && fit.dialog <= 0 && fit.left >= 0 && fit.right >= 0, JSON.stringify(fit));
  await p.screenshot({ path: `${OUT}/album-popup-phone-${lang}.png` });
  if (fit.scrolls) {
    await p.locator(".album-dialog__print").scrollIntoViewIfNeeded();
    check(`phone ${lang}: popup scrolls to reach Print`, await p.locator(".album-dialog__print").isVisible());
  }
  const [tab] = await Promise.all([p.context().waitForEvent("page"), p.locator(".album-card__qr").tap()]);
  await tab.waitForLoadState();
  check(`phone ${lang}: tapping the QR opens the album in a new tab`, tab.url() === TEST, tab.url());
  await tab.close();
  const [tab2] = await Promise.all([p.context().waitForEvent("page"), p.locator(".album-card__open").tap()]);
  check(`phone ${lang}: "Open the album" link opens it`, tab2.url() === TEST);
  await tab2.close();
  if (lang === "hi") check("hindi card text", /अतिथि फ़ोटो एल्बम/.test(await p.locator(".album-card").innerText()));
  check(`phone ${lang}: no console errors`, !p.errs.length, p.errs.join(" | "));
  await p.context().close();
}

/* post-event version */
{
  const p = await open({ query: "?mode=after" });
  await p.locator(".album-chip").click();
  await p.waitForTimeout(500);
  check("?mode=after shows the thank-you", /Thank you for celebrating with us/.test(await p.locator(".album-card").innerText()));
  await p.context().close();
}

await browser.close();
await new Promise((r) => server.httpServer.close(r));
const failed = res.filter((r) => !r).length;
console.log(`\n${res.length - failed}/${res.length} passed`);
process.exit(failed ? 1 : 0);
