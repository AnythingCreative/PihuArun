import { useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { InvitationHero } from "./components/InvitationHero";
import { InvitationReveal } from "./components/InvitationReveal";
import { PrayagrajStory } from "./components/PrayagrajStory";
import { BanarasStory } from "./components/BanarasStory";
import { CoupleStory } from "./components/CoupleStory";
import { WeddingTraditions } from "./components/WeddingTraditions";
import { WeddingCountdown } from "./components/WeddingCountdown";
import { EventDetails } from "./components/EventDetails";
import { WeddingGallery } from "./components/WeddingGallery";
import { GuestWishes } from "./components/GuestWishes";
import { ClosingScene } from "./components/ClosingScene";
import { BackToTop } from "./components/BackToTop";
import { ScrollTrigger } from "./lib/motion";
import { missingDetails } from "./config/wedding";
import { scrollToSection } from "./lib/scrollTo";

export default function App() {
  useEffect(() => {
    // Mobile browsers resize the viewport as the URL bar shows/hides; don't re-layout pins for that.
    ScrollTrigger.config({ ignoreMobileResize: true });
    // Pins are measured with fallback fonts first; re-measure once the real fonts arrive.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    // Honour a deep link such as /#gallery once pins exist.
    const id = window.location.hash.slice(1);
    const t = id ? window.setTimeout(() => scrollToSection(id), 300) : 0;

    if (import.meta.env.DEV) {
      const missing = missingDetails();
      if (missing.length) console.info(`[wedding config] still to fill in src/config/wedding.ts: ${missing.join(", ")}`);
    }
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#wedding-day" onClick={(e) => { e.preventDefault(); scrollToSection("wedding-day"); }}>
        Skip to the wedding date
      </a>
      <Navigation />
      <main>
        <InvitationHero />
        <InvitationReveal />
        <PrayagrajStory />
        <BanarasStory />
        <CoupleStory />
        <WeddingTraditions />
        <WeddingCountdown />
        <EventDetails />
        <WeddingGallery />
        <GuestWishes />
        <ClosingScene />
      </main>
      <BackToTop />
    </>
  );
}
