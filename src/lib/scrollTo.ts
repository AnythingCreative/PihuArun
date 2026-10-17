/** Scrolls to a section, accounting for the fixed header and GSAP pin spacers. */
export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = (el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el) as HTMLElement;
  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const top = id === "top" ? 0 : target.getBoundingClientRect().top + window.scrollY - (el.dataset.flush ? 0 : header);
  window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  history.replaceState(null, "", id === "top" ? window.location.pathname + window.location.search : `#${id}`);
  // move keyboard focus to the section without a second jump
  const focusTarget = el.querySelector<HTMLElement>("[data-focus-target]") ?? el;
  if (!focusTarget.hasAttribute("tabindex")) focusTarget.setAttribute("tabindex", "-1");
  focusTarget.focus({ preventScroll: true });
}
