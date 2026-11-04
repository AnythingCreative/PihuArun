// Music starts when the doors open, on every screen size, by tap or Enter, even where it was once muted (npm run music).
import { preview } from "vite";
import { chromium } from "playwright-core";
const server = await preview({ preview: { port: 4198, strictPort: true }, logLevel: "warn" });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const SCREENS = { "phone 360": [360, 740, true], "iPhone 390": [390, 844, true], "phone landscape": [844, 390, true], "tablet 768": [768, 1024, true], "tablet landscape": [1180, 820, true], "laptop 1366": [1366, 768, false], "desktop 1920": [1920, 1080, false] };
let fails = 0;
for (const [name, [w, h, touch]] of Object.entries(SCREENS))
  for (const how of ["tap", "Enter", "muted before"]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: touch && w < 1000, hasTouch: touch });
    await ctx.addInitScript(() => {
      window.__ctxs = [];
      const A = window.AudioContext;
      window.AudioContext = class extends A { constructor(...a) { super(...a); window.__ctxs.push(this); } };
    });
    if (how === "muted before") await ctx.addInitScript(() => { if (!sessionStorage.getItem("x")) { localStorage.setItem("invite-muted", "1"); sessionStorage.setItem("x", "1"); } });
    const p = await ctx.newPage();
    await p.goto("http://localhost:4198/", { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    if (how === "Enter") await p.keyboard.press("Enter");
    else touch ? await p.locator(".gate__open, .gate button").first().tap() : await p.locator(".gate__open, .gate button").first().click();
    await p.waitForTimeout(2000);
    const r = await p.evaluate(() => ({ n: window.__ctxs.length, state: window.__ctxs[0]?.state, t: Math.round((window.__ctxs[0]?.currentTime ?? 0) * 10) / 10, btn: document.querySelector(".sound-toggle")?.getAttribute("aria-pressed") }));
    const ok = r.state === "running" && r.t > 0.5 && r.btn === "true";
    if (!ok) fails++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name} · ${how} — ${JSON.stringify(r)}`);
    await ctx.close();
  }
await browser.close();
await new Promise((r) => server.httpServer.close(r));
console.log(fails ? `${fails} failed` : "all passed");
