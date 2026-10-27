// Browser QA against the production build: screenshots through the whole
// scroll story, interaction checks, console/network errors, overflow.
// Usage: npm run build && npm run qa      (screenshots land in .qa/)
import { preview } from "vite";
import { chromium } from "playwright-core";
import { mkdirSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, ".qa");
mkdirSync(outDir, { recursive: true });
const executablePath =
  process.env.CHROMIUM_PATH || ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find((p) => existsSync(p));

const server = await preview({ root, preview: { port: 4199, strictPort: true }, logLevel: "warn" });
const URL_ = "http://localhost:4199/";
const browser = await chromium.launch({ executablePath });
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

async function open(label, ctxOpts) {
  const ctx = await browser.newContext({ ...ctxOpts, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errors.push(`${m.type()}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => errors.push(`requestfailed: ${r.url()}`));
  page.on("response", (r) => r.status() >= 400 && errors.push(`http ${r.status()}: ${r.url()}`));
  await page.goto(URL_, { waitUntil: "networkidle" });
  await page.keyboard.press("Enter"); // open the temple doors
  await page.waitForTimeout(4800); // doors + hero intro
  return { ctx, page, errors, label };
}

async function tour({ page, label }, steps) {
  await page.screenshot({ path: path.join(outDir, `${label}-00-hero.png`) });
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let i = 1; i <= steps; i++) {
    const y = Math.round((total * i) / steps);
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(outDir, `${label}-${String(i).padStart(2, "0")}.png`) });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check(`${label}: no horizontal overflow`, overflow <= 0, `scrollWidth - innerWidth = ${overflow}`);
}

/* ---------------- desktop ---------------- */
{
  const s = await open("desktop", { viewport: { width: 1440, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
  const { page } = s;
  check("title", (await page.title()) === "Arun & Pratima | Wedding Invitation | 24 November 2026");
  const heroText = await page.locator("#top").innerText();
  check("hero copy", ["ARUN", "PRATIMA", "24 NOVEMBER 2026", "PRAYAGRAJ, UTTAR PRADESH", "श्री गणेशाय नमः"].every((t) => heroText.includes(t)));
  const h1 = await page.locator("h1").count();
  check("exactly one h1", h1 === 1, String(h1));

  await tour(s, 34);

  // nav links reach their sections
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  for (const id of ["blessings", "story", "traditions", "wedding-day", "details"]) {
    await page.click(`.site-nav a[href="#${id}"]`);
    await page.waitForTimeout(1600);
    const top = await page.evaluate((id) => {
      const el = document.getElementById(id);
      const t = (el.parentElement.classList.contains("pin-spacer") ? el.parentElement : el).getBoundingClientRect().top;
      return t;
    }, id);
    check(`nav → #${id}`, Math.abs(top) < 90, `section top at ${Math.round(top)}px`);
  }

  // countdown
  const units = await page.locator(".countdown__value").allInnerTexts();
  const expected = await page.evaluate(() => {
    const diff = new Date("2026-11-24T00:00:00+05:30").getTime() - Date.now();
    return Math.floor(diff / 86400000);
  });
  check("countdown days", Number(units[0]) === expected, `shows ${units.join(":")}, expected ${expected} days`);
  const s1 = await page.locator(".countdown__value").nth(3).innerText();
  await page.waitForTimeout(1100);
  const s2 = await page.locator(".countdown__value").nth(3).innerText();
  check("countdown ticks each second", s1 !== s2, `${s1} → ${s2}`);

  // calendar
  await page.click("#wedding-day");
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("text=Add to Calendar")]);
  const icsPath = path.join(outDir, dl.suggestedFilename());
  await dl.saveAs(icsPath);
  const ics = readFileSync(icsPath, "utf8");
  const icsOk =
    ics.startsWith("BEGIN:VCALENDAR\r\n") &&
    ics.includes("DTSTART;VALUE=DATE:20261124") &&
    ics.includes("DTEND;VALUE=DATE:20261125") &&
    ics.includes("SUMMARY:Wedding of Arun & Pratima") &&
    ics.trimEnd().endsWith("END:VCALENDAR") &&
    ics.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75);
  check("calendar .ics valid", icsOk, dl.suggestedFilename());

  // share → copy fallback (no Web Share in desktop Chromium headless)
  await page.click("text=Share Invitation");
  await page.waitForTimeout(400);
  const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => "");
  check("share copies link", clip.startsWith(URL_), clip);

  const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
  check("no broken images (loaded so far)", broken.length === 0, broken.join(", "));

  // wishes form honesty
  await page.locator("#wishes").scrollIntoViewIfNeeded();
  await page.click("text=Preview my wish");
  check("wishes: validation", (await page.locator(".field__error").count()) === 2);
  await page.fill("#wishes input", "Meera");
  await page.fill("#wishes textarea", "Wishing you a lifetime of love and laughter.");
  await page.click("text=Preview my wish");
  const status = await page.locator(".wish-card").innerText();
  check("wishes: honest local preview", status.toLowerCase().includes("preview — not sent") && status.includes("Meera"));
  await page.locator(".wishes__form").screenshot({ path: path.join(outDir, "desktop-wishes.png") });

  // venue: name, directions link and map, and no ceremony time anywhere
  const details = await page.locator("#details").innerText();
  const dirHref = await page.locator(".details__directions").getAttribute("href");
  check("venue, directions and map shown", details.includes("Shivaya Vatika") && dirHref?.startsWith("https://www.google.com/maps/dir/?api=1&destination=Shivaya") && (await page.locator("#details iframe").count()) === 1, dirHref ?? "");
  check("no ceremony time shown", !/to be announced|ceremony time/i.test(await page.evaluate(() => document.body.innerText)));

  // sound toggle
  await page.click(".sound-toggle");
  await page.waitForTimeout(800);
  check("sound toggle turns on", (await page.getAttribute(".sound-toggle", "aria-pressed")) === "true");
  await page.click(".sound-toggle");
  check("sound toggle turns off", (await page.getAttribute(".sound-toggle", "aria-pressed")) === "false");

  // back to top
  await page.click(".back-to-top");
  await page.waitForTimeout(2500);
  check("back to top", (await page.evaluate(() => scrollY)) < 5);

  check("desktop: no console errors / failed requests", s.errors.length === 0, s.errors.join(" | "));
  await s.ctx.close();
}

/* ---------------- mobile ---------------- */
for (const [label, width, height] of [["mobile360", 360, 740], ["mobile390", 390, 844], ["tablet768", 768, 1024], ["laptop1024", 1024, 700]]) {
  const s = await open(label, { viewport: { width, height }, isMobile: width < 700, hasTouch: true, deviceScaleFactor: 2 });
  await tour(s, label.startsWith("mobile390") ? 30 : 12);
  const { page } = s;
  if (width < 1024) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.click(".menu-toggle");
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(outDir, `${label}-menu.png`) });
    await page.click('.mobile-menu a[href="#details"]');
    await page.waitForTimeout(1600);
    const top = await page.evaluate(() => document.getElementById("details").getBoundingClientRect().top);
    check(`${label}: mobile menu → details`, Math.abs(top) < 80 && (await page.locator(".mobile-menu").isHidden()), `top ${Math.round(top)}`);
  }
  const clipped = await page.evaluate(() =>
    [...document.querySelectorAll(".hero__names, .couple__title, .closing__names, .savedate__date")]
      .filter((el) => el.scrollWidth > el.clientWidth + 1)
      .map((el) => el.className),
  );
  check(`${label}: no clipped headings`, clipped.length === 0, clipped.join(", "));
  check(`${label}: no console errors`, s.errors.length === 0, s.errors.join(" | "));
  await s.ctx.close();
}

/* ---------------- reduced motion ---------------- */
{
  const s = await open("reduced", { viewport: { width: 1280, height: 800 }, reducedMotion: "reduce" });
  await tour(s, 12);
  const pins = await s.page.locator(".pin-spacer").count();
  check("reduced motion: no pinned scenes", pins === 0, `${pins} pins`);
  const hidden = await s.page.evaluate(() =>
    [...document.querySelectorAll("h1, h2, h3, .lead, .countdown__value")]
      .filter((el) => parseFloat(getComputedStyle(el).opacity) < 0.99)
      .map((el) => el.textContent?.slice(0, 30)),
  );
  check("reduced motion: all text visible", hidden.length === 0, hidden.join(" | "));
  check("reduced: no console errors", s.errors.length === 0, s.errors.join(" | "));
  await s.ctx.close();
}

await browser.close();
await new Promise((r) => server.httpServer.close(r));
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
