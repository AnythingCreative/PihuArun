import { useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { InvitationHero } from "./components/InvitationHero";
import { TempleGate } from "./components/v2/TempleGate";
import { Blessings } from "./components/v2/Blessings";
import { PalaceCouple } from "./components/v2/PalaceCouple";
import { SkyLanterns } from "./components/v2/SkyLanterns";
import { CelebrationsByDay } from "./components/v2/CelebrationsByDay";
import { CelebrationsDeck } from "./components/v2/CelebrationsDeck";

/** Which celebrations layout to show: "deck" (fanned cards), "byDay" (two day panels) or "row" (swipeable cards). */
const CELEBRATIONS_LAYOUT = "byDay" as "deck" | "byDay" | "row";
import { WeddingTraditions } from "./components/WeddingTraditions";
import { WeddingCountdown } from "./components/WeddingCountdown";
import { EventDetails } from "./components/EventDetails";
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
    // Honour a deep link such as /#details once pins exist.
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
      <TempleGate />
      <Navigation />
      <main>
        <InvitationHero />
        <Blessings />
        <PalaceCouple />
        {CELEBRATIONS_LAYOUT === "deck" ? <CelebrationsDeck /> : CELEBRATIONS_LAYOUT === "byDay" ? <CelebrationsByDay /> : <WeddingTraditions />}
        <WeddingCountdown />
        <EventDetails />
        <GuestWishes />
        <ClosingScene />
      </main>
      <SkyLanterns className="lanterns--page" count={typeof window !== "undefined" && window.matchMedia("(max-width: 720px)").matches ? 5 : 7} scale={0.7} />
      <BackToTop />
    </>
  );
}
