// Break-it sweep, part 1 (npm run sweep): layout. Every size × language × text scale; finds
// text cut off by an overflow-hidden ancestor, sideways page scroll and
// elements poking off-screen.
import { preview } from "vite";
import { chromium } from "playwright-core";
const server = await preview({ preview: { port: 4197, strictPort: true }, logLevel: "warn" });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });

const SIZES = (process.env.SIZES ?? "320x568,360x740,375x667,390x844,414x896,430x932,600x960,768x1024,820x1180,1024x700,1024x1366,1280x720,1366x768,1440x900,1600x900,1920x1080,2560x1440,844x390,740x360,1280x500").split(",");
const LANGS = (process.env.LANGS ?? "en,hi").split(",");
const SCALES = (process.env.SCALES ?? "100,150").split(",").map(Number);

const probe = () => {
  const out = [];
  const vw = innerWidth;
  const name = (el) => (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : el.tagName.toLowerCase());
  const visible = (el) => {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden" || parseFloat(cs.opacity) < 0.05) return false;
      if (e.getAttribute("aria-hidden") === "true") return false;
    }
    return true;
  };
  const leaves = [...document.querySelectorAll("main *, header *, nav *, .gate *")].filter(
    (el) => !el.closest(".visually-hidden") && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()),
  );
  for (const el of leaves) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom < -50 || r.top > innerHeight + 50) continue;
    if (!visible(el)) continue;
    // range rect of the text itself (catches text overflowing its own box)
    // union of this element's own visible text nodes (glyph boxes, not hidden helper text)
    let tr = null;
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      const b = rg.getBoundingClientRect();
      tr = tr ? { left: Math.min(tr.left, b.left), right: Math.max(tr.right, b.right), top: Math.min(tr.top, b.top), bottom: Math.max(tr.bottom, b.bottom) } : b;
    }
    if (!tr) continue;
    if (tr.left < -1 || tr.right > vw + 1) out.push(`${name(el)} off-screen x ${Math.round(tr.left)}..${Math.round(tr.right)} (vw ${vw}) "${el.textContent.trim().slice(0, 24)}"`);
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.overflowX === "visible" && cs.overflowY === "visible" && cs.contain.indexOf("paint") < 0) continue;
      const ar = a.getBoundingClientRect();
      const cutX = tr.left < ar.left - 1 || tr.right > ar.right + 1;
      const cutY = (cs.overflowY !== "visible") && (tr.top < ar.top - 2 || tr.bottom > ar.bottom + 2) && !(a.scrollHeight > a.clientHeight + 2 && /auto|scroll/.test(cs.overflowY));
      if ((cutX && !/auto|scroll/.test(cs.overflowX)) || cutY) {
        if (a.matches(".backdrop, .lanterns, .sky")) break;
        out.push(`${name(el)} cut by ${name(a)} ${cutX ? "sideways" : "vertically"} "${el.textContent.trim().slice(0, 24)}"`);
      }
      break; // nearest clipping ancestor only
    }
  }
  const sw = document.documentElement.scrollWidth - vw;
  if (sw > 0) out.push(`page scrolls sideways by ${sw}px`);
  return out;
};

const findings = new Map();
for (const size of SIZES) {
  const [w, h] = size.split("x").map(Number);
  for (const lang of LANGS)
    for (const scale of SCALES) {
      if (scale !== 100 && w > 1100) continue;
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 700 || h < 450, hasTouch: w < 1100, deviceScaleFactor: 1 });
      await ctx.addInitScript(([lang, scale]) => {
        localStorage.setItem("invite-lang", lang);
        sessionStorage.setItem("invite-muted", "1");
        if (scale !== 100) document.addEventListener("DOMContentLoaded", () => (document.documentElement.style.fontSize = scale + "%"));
      }, [lang, scale]);
      const p = await ctx.newPage();
      const errs = [];
      p.on("pageerror", (e) => errs.push("pageerror " + e.message));
      p.on("console", (m) => m.type() === "error" && errs.push("console " + m.text()));
      await p.goto("http://localhost:4197/", { waitUntil: "networkidle" });
      const tag = `${size} ${lang} ${scale}%`;
      const add = (where, list) => list.forEach((f) => { const k = `${where}: ${f}`; if (!findings.has(k)) findings.set(k, []); findings.get(k).push(tag); });
      await p.waitForTimeout(600);
      add("gate", await p.evaluate(probe));
      await p.keyboard.press("Enter");
      await p.waitForTimeout(3200);
      const total = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += Math.round(h * 0.6)) {
        await p.evaluate((y) => scrollTo(0, y), y);
        await p.waitForTimeout(550);
        const sec = await p.evaluate(() => { const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest("section"); return el?.id || el?.className.split(" ")[0] || "?"; });
        add(sec, await p.evaluate(probe));
      }
      add("errors", errs);
      await ctx.close();
    }
}
const sorted = [...findings].sort((a, b) => b[1].length - a[1].length);
for (const [k, tags] of sorted) console.log(`${k}\n    × ${tags.length}: ${tags.slice(0, 6).join(" | ")}${tags.length > 6 ? " …" : ""}`);
console.log(`\n${sorted.length} distinct findings`);
await browser.close();
server.httpServer.close();
