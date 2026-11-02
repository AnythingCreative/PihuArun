// Break-it sweep, part 2 (npm run break): behaviour. Odd dates and time zones, deep links,
// storage blocked, images blocked, hostile form input, rapid tapping,
// rotation, keyboard-only use.
import { preview } from "vite";
import { chromium } from "playwright-core";
const server = await preview({ preview: { port: 4196, strictPort: true }, logLevel: "warn" });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const URL_ = "http://localhost:4196/";
const res = [];
const check = (name, ok, detail = "") => {
  res.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
async function page(opts = {}, init) {
  const ctx = await browser.newContext({ ...PHONE, ...opts });
  if (init) await ctx.addInitScript(init);
  const p = await ctx.newPage();
  p.errs = [];
  p.on("pageerror", (e) => p.errs.push("pageerror " + e.message));
  p.on("console", (m) => (m.type() === "error" || m.type() === "warning") && p.errs.push(`${m.type()} ${m.text()}`));
  return p;
}
const enter = async (p, hash = "") => {
  await p.goto(URL_ + hash, { waitUntil: "networkidle" });
  if (!hash) await p.keyboard.press("Enter");
  await p.waitForTimeout(3000);
};
const fakeNow = (iso) => `{
  const T = new Date(${JSON.stringify(iso)}).getTime(), start = Date.now(), R = Date;
  class D extends R { constructor(...a) { super(...(a.length ? a : [T + (R.now() - start)])); } static now() { return T + (R.now() - start); } }
  window.Date = D;
}`;
const text = (p, sel) => p.locator(sel).first().innerText().catch(() => "");

/* 1. countdown phases and time zones */
for (const [label, iso, want] of [
  ["a minute before (IST)", "2026-11-23T23:59:00+05:30", /00\s*DAYS/i],
  ["wedding day morning", "2026-11-24T10:00:00+05:30", /Today is the day/i],
  ["day after", "2026-11-25T09:00:00+05:30", /Happily married/i],
  ["a year later", "2027-11-24T09:00:00+05:30", /Happily married/i],
]) {
  const p = await page({}, fakeNow(iso));
  await enter(p, "#wedding-day");
  await p.waitForTimeout(800);
  const t = await text(p, "#wedding-day .countdown");
  check(`countdown: ${label}`, want.test(t.replace(/\n/g, " ")), t.replace(/\n/g, " ").slice(0, 60));
  if (p.errs.length) check(`countdown ${label}: no errors`, false, p.errs.join(" | "));
  await p.context().close();
}
for (const tz of ["America/Los_Angeles", "Pacific/Kiritimati", "Asia/Kolkata"]) {
  const p = await page({ timezoneId: tz, locale: "en-US" });
  await enter(p, "#traditions");
  const trad = await text(p, "#traditions");
  const date = await text(p, ".savedate__date");
  const det = await text(p, "#details");
  check(`time zone ${tz}: Haldi/Mehendi on 23 Nov, wedding 24 Nov`, /23/.test(trad) && /24/.test(trad) && /24\.11\.2026/.test(date.replace(/\s/g, "")) && /24/.test(det), `${trad.match(/\d+ \w+ 2026|\w+ \d+, 2026/g)?.join(", ")} | ${date.replace(/\s/g, "")}`);
  await p.context().close();
}

/* 2. deep links, junk hashes */
for (const h of ["#blessings", "#story", "#traditions", "#wedding-day", "#details", "#wishes", "#blessing", "#nope", "#top", "#%3Cimg%3E"]) {
  const p = await page();
  await p.goto(URL_ + h, { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const gate = await p.locator(".gate").count();
  const top = await p.evaluate((id) => document.getElementById(id)?.getBoundingClientRect().top ?? null, h.slice(1));
  const known = ["blessings", "story", "traditions", "wedding-day", "details", "wishes", "blessing"].includes(h.slice(1));
  const ok = known ? gate === 0 && top !== null && Math.abs(top) < 120 : gate === 1;
  check(`deep link ${h}`, ok && !p.errs.length, `gate ${gate}, section top ${top === null ? "-" : Math.round(top)} ${p.errs.join(" | ")}`);
  await p.context().close();
}

/* 3. storage blocked (Safari private / strict settings) */
{
  const p = await page({}, () => {
    Object.defineProperty(window, "localStorage", { get() { throw new DOMException("denied", "SecurityError"); } });
  });
  await enter(p);
  await p.click(".lang-toggle").catch(() => {});
  await p.waitForTimeout(300);
  check("storage blocked: page works, language still switches", !p.errs.length && (await p.evaluate(() => document.documentElement.lang)) === "hi", p.errs.join(" | "));
  await p.context().close();
}

/* 4. art images fail to load */
{
  const ctx = await browser.newContext(PHONE);
  await ctx.route(/\/art\//, (r) => r.abort());
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message));
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.keyboard.press("Enter");
  await p.waitForTimeout(3000);
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 500) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(120); }
  await p.waitForTimeout(800);
  const broken = await p.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && getComputedStyle(i).visibility !== "hidden" && i.getBoundingClientRect().width > 0).map((i) => i.alt || i.src.split("/").pop()));
  check("images blocked: no JS errors", !errs.length, errs.join(" | "));
  check("images blocked: broken-image icons shown", broken.length === 0, `${broken.length}: ${broken.slice(0, 6).join(", ")}`);
  await ctx.close();
}

/* 5. hostile wishes input */
{
  const p = await page();
  await enter(p, "#wishes");
  await p.fill("#wishes input", "   ");
  await p.fill("#wishes textarea", "   ");
  await p.click(".wishes__send");
  check("wishes: spaces only are rejected", (await p.locator(".field__error").count()) === 2);
  const name = `Ana & "Bob" <b>#1</b> 100% ?x=1 🙏🏽 अनु`;
  const msg = "Line one\nLine two & more #hashtag 😊 " + "x".repeat(3000);
  await p.fill("#wishes input", name);
  await p.fill("#wishes textarea", msg);
  const typed = await p.inputValue("#wishes textarea");
  const [pop] = await Promise.all([p.waitForEvent("popup", { timeout: 3000 }).catch(() => null), p.click(".wishes__send")]);
  await pop?.close().catch(() => {});
  const href = (await p.locator(".wish-card a").getAttribute("href").catch(() => "")) ?? "";
  const decoded = decodeURIComponent(href.split("text=")[1] ?? "");
  check("wishes: special characters reach WhatsApp intact", decoded.includes(name) && decoded.includes("Line one\nLine two & more #hashtag 😊"), decoded.slice(0, 80));
  check("wishes: very long message capped", typed.length <= 1000, `textarea holds ${typed.length} chars, link ${href.length} chars`);
  const card = await p.locator(".wish-card").innerHTML().catch(() => "");
  check("wishes: name shown as text, not HTML", !card.includes("<b>#1</b>"));
  check("wishes: no errors", !p.errs.length, p.errs.join(" | "));
  await p.context().close();
}

/* 6. hammering controls */
{
  const p = await page();
  await enter(p);
  for (let i = 0; i < 15; i++) await p.click(".lang-toggle");
  check("lang toggle ×15 ends in Hindi", (await p.evaluate(() => document.documentElement.lang)) === "hi");
  await p.reload({ waitUntil: "networkidle" });
  check("language remembered after reload", (await p.evaluate(() => document.documentElement.lang)) === "hi");
  await p.keyboard.press("Enter");
  await p.waitForTimeout(3000);
  for (let i = 0; i < 12; i++) await p.locator(".sound-toggle").first().click();
  await p.waitForTimeout(1500);
  check("sound toggle ×12 ends on (even count from on)", (await p.locator(".sound-toggle").first().getAttribute("aria-pressed")) === "true");
  await p.locator(".painting__switch").scrollIntoViewIfNeeded();
  for (let i = 0; i < 9; i++) await p.click(".painting__switch");
  const shown = await p.locator(".painting__stack img.is-shown").count();
  check("painting tapped ×9: exactly one shown", shown === 1, String(shown));
  check("hammering: no errors", !p.errs.length, p.errs.join(" | "));
  await p.context().close();
}

/* 7. gate: double tap, scroll during opening, rotation mid-page */
{
  const p = await page();
  await p.goto(URL_, { waitUntil: "networkidle" });
  await p.touchscreen.tap(195, 500);
  await p.touchscreen.tap(195, 500);
  await p.mouse.wheel(0, 900);
  await p.waitForTimeout(3200);
  check("gate double tap + scroll: gate gone, page scrollable", (await p.locator(".gate").count()) === 0 && (await p.evaluate(() => !document.documentElement.classList.contains("gate-locked"))));
  await p.evaluate(() => document.getElementById("traditions").scrollIntoView());
  await p.waitForTimeout(800);
  await p.setViewportSize({ width: 844, height: 390 });
  await p.waitForTimeout(1500);
  const ovf = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(1500);
  const ovf2 = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check("rotate phone mid-page: no sideways scroll", ovf <= 0 && ovf2 <= 0, `${ovf} / ${ovf2}`);
  check("rotation: no errors", !p.errs.length, p.errs.join(" | "));
  await p.context().close();
}

/* 8. mobile menu edge cases */
{
  const p = await page({ viewport: { width: 700, height: 900 }, isMobile: false });
  await enter(p);
  await p.click(".menu-toggle");
  await p.waitForTimeout(300);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(300);
  check("menu closes with Escape", await p.locator(".mobile-menu").isHidden());
  await p.click(".menu-toggle");
  await p.waitForTimeout(300);
  await p.setViewportSize({ width: 1300, height: 900 });
  await p.waitForTimeout(600);
  const locked = await p.evaluate(() => getComputedStyle(document.body).overflow === "hidden" || getComputedStyle(document.documentElement).overflow === "hidden");
  const menuVisible = await p.locator(".mobile-menu").isVisible();
  check("menu open then window widened: page not stuck", !locked && !menuVisible, `scroll locked ${locked}, menu visible ${menuVisible}`);
  await p.context().close();
}

/* 9. keyboard only */
{
  const p = await page({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });
  await enter(p);
  const seen = [];
  for (let i = 0; i < 60; i++) {
    await p.keyboard.press("Tab");
    await p.waitForTimeout(250);
    const f = await p.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return null;
      const r = a.getBoundingClientRect();
      const cs = getComputedStyle(a);
      const ring = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== "none";
      const onScreen = r.bottom > 0 && r.top < innerHeight && r.width > 0;
      return { label: (a.getAttribute("aria-label") || a.textContent || a.tagName).trim().slice(0, 20), ring, onScreen };
    });
    if (f) seen.push(f);
  }
  const bad = seen.filter((f) => f.label !== "IFRAME" && (!f.ring || !f.onScreen)); // the map draws its own focus rings inside
  check("keyboard: every focused control visible with a focus ring", bad.length === 0, bad.slice(0, 6).map((b) => `${b.label}${b.ring ? "" : " (no ring)"}${b.onScreen ? "" : " (off-screen)"}`).join(", "));
  await p.context().close();
}

/* 10. Hindi everywhere: leftover English */
{
  const p = await page({}, () => localStorage.setItem("invite-lang", "hi"));
  await enter(p);
  const left = await p.evaluate(() => {
    const ok = /^(ARUN|PRATIMA|Arun|Pratima|Shivaya Vatika|WhatsApp|EN|A|P|&|Prayagraj.*|128A.*|\+?91.*|[\d\s.:,+-]*)$/;
    const out = new Set();
    const w = document.createTreeWalker(document.querySelector("main"), NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode()); ) {
      const s = n.textContent.trim();
      if (!s || !/[A-Za-z]{3,}/.test(s.replace(/WhatsApp|Google Maps|Send/g, "")) || ok.test(s)) continue;
      const el = n.parentElement;
      if (el.closest("[aria-hidden=true], script, style, .visually-hidden, iframe")) continue;
      out.add(s.slice(0, 50));
    }
    return [...out];
  });
  check("Hindi mode: no stray English text", left.length === 0, left.slice(0, 12).join(" | "));
  const hiddenEn = await p.evaluate(() => [...document.querySelectorAll(".visually-hidden, [aria-label]")].map((e) => e.getAttribute("aria-label") || e.textContent).filter((s) => /[A-Za-z]{4,}/.test(s ?? "") && !/WhatsApp|Arun|Pratima|Shivaya|Read in English|Google Maps/.test(s)).slice(0, 8));
  check("Hindi mode: screen-reader labels translated", hiddenEn.length === 0, hiddenEn.join(" | "));
  await p.context().close();
}

console.log(`\n${res.filter(Boolean).length}/${res.length} passed`);
await browser.close();
server.httpServer.close();
