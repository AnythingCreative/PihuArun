import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { wedding } from "../config/wedding";
import { scrollToSection } from "../lib/scrollTo";
import { ScrollProgress } from "./ScrollProgress";
import { SoundToggle } from "./SoundToggle";
import { useScrolledPast } from "../hooks/useScrollProgress";
import { LangToggle } from "./v2/LangToggle";
import { useT } from "../lib/i18n";

export const NAV_LINKS = [
  { id: "blessings", label: "Blessings", hi: "आशीर्वाद" },
  { id: "story", label: "Our Story", hi: "हमारी कहानी" },
  { id: "traditions", label: "Traditions", hi: "रस्में" },
  { id: "wedding-day", label: "Wedding Day", hi: "विवाह दिवस" },
  { id: "details", label: "Details", hi: "स्थान" },
];

export function Navigation() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const scrolled = useScrolledPast(40);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape closes the menu; focus returns to the toggle
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", open);
    if (!open) return;
    // rotating a tablet or widening the window swaps to the full nav: don't leave the page locked
    const wide = window.matchMedia("(min-width: 1024px)");
    const close = () => wide.matches && setOpen(false);
    close();
    wide.addEventListener("change", close);
    return () => wide.removeEventListener("change", close);
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}>
      <ScrollProgress />
      <div className="site-header__bar">
        <a href="#top" className="monogram" onClick={go("top")} aria-label={`${wedding.groom} and ${wedding.bride} — back to the beginning`}>
          <span>{wedding.groom[0]}</span>
          <em>&amp;</em>
          <span>{wedding.bride[0]}</span>
        </a>

        <nav className="site-nav" aria-label={t("Sections", "भाग")}>
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={go(l.id)}>
                  {t(l.label, l.hi)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__tools">
          <LangToggle />
          <SoundToggle />
          <button
            ref={toggleRef}
            type="button"
            className="icon-btn menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("Close menu", "मेनू बंद करें") : t("Open menu", "मेनू खोलें")}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" ref={menuRef} className="mobile-menu" hidden={!open}>
        <nav aria-label={t("Sections (menu)", "भाग (मेनू)")}>
          <ul>
            {[{ id: "top", label: "Beginning", hi: "शुरुआत" }, ...NAV_LINKS].map((l, i) => (
              <li key={l.id} style={{ ["--i" as string]: i }}>
                <a href={`#${l.id}`} onClick={go(l.id)}>
                  {t(l.label, l.hi)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mobile-menu__foot label">
          {wedding.groom} &amp; {wedding.bride}
        </p>
      </div>
    </header>
  );
}
