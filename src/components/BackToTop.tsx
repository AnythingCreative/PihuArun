import { ArrowUp } from "lucide-react";
import { useScrolledPast } from "../hooks/useScrollProgress";
import { scrollToSection } from "../lib/scrollTo";

export function BackToTop() {
  const visible = useScrolledPast(1200);
  return (
    <button
      type="button"
      className={`back-to-top icon-btn ${visible ? "is-visible" : ""}`}
      aria-label="Back to the beginning"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={() => scrollToSection("top")}
    >
      <ArrowUp aria-hidden />
    </button>
  );
}
