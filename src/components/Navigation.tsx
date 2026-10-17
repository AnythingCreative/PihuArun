import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { wedding } from "../config/wedding";
import { scrollToSection } from "../lib/scrollTo";
import { ScrollProgress } from "./ScrollProgress";
import { SoundToggle } from "./SoundToggle";
import { useScrolledPast } from "../hooks/useScrollProgress";

export const NAV_LINKS = [
  { id: "story", label: "Our Story" },
  { id: "traditions", label: "Traditions" },
  { id: "wedding-day", label: "Wedding Day" },
  { id: "gallery", label: "Gallery" },
  { id: "details", label: "Details" },
];

export function Navigation() {
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

        <nav className="site-nav" aria-label="Sections">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={go(l.id)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__tools">
          <SoundToggle />
          <button
            ref={toggleRef}
            type="button"
            className="icon-btn menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" ref={menuRef} className="mobile-menu" hidden={!open}>
        <nav aria-label="Sections (menu)">
          <ul>
            {[{ id: "top", label: "Beginning" }, ...NAV_LINKS].map((l, i) => (
              <li key={l.id} style={{ ["--i" as string]: i }}>
                <a href={`#${l.id}`} onClick={go(l.id)}>
                  {l.label}
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
