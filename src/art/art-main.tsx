/**
 * Dev-only page that renders the site's own illustrations as fixed-size
 * plates. scripts/render-art.mjs screenshots them into the WebP placeholders
 * in public/gallery/, the social preview image and the PNG icons.
 * Not part of the production build.
 */
import type React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/cormorant-garamond/latin-300.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/noto-serif-devanagari/devanagari-400.css";
import "../styles/globals.css";
import "../styles/sections.css";
import "./art.css";
import { SangamScene } from "../components/scenes/SangamScene";
import { BrocadeScene, DiyaWaterScene, GhatsScene } from "../components/scenes/BanarasScenes";
import { TraditionArt, type TraditionArtKey } from "../components/scenes/TraditionArt";
import { CornerFlourish, Lotus, Mandala, GaneshMotif } from "../components/ornaments/Ornaments";
import { wedding, displayDate, place } from "../config/wedding";

function TraditionPlate({ kind }: { kind: TraditionArtKey }) {
  return (
    <div className="plate plate--tradition grain">
      <Mandala className="plate__mandala" />
      <div className="plate__art">
        <TraditionArt kind={kind} />
      </div>
      <div className="plate__border" />
    </div>
  );
}

function OgCard() {
  return (
    <div className="og grain">
      <Mandala className="og__mandala" />
      <div className="og__frame">
        {(["tl", "tr", "bl", "br"] as const).map((c) => (
          <CornerFlourish key={c} className={`og__corner og__corner--${c}`} />
        ))}
      </div>
      <div className="og__content">
        <GaneshMotif className="og__ganesh" />
        <p className="og__shloka deva">॥ श्री गणेशाय नमः ॥</p>
        <h1 className="og__names display">
          {wedding.groom.toUpperCase()} <em>&amp;</em> {wedding.bride.toUpperCase()}
        </h1>
        <p className="og__date">{displayDate()}</p>
        <p className="og__place label">{place().toUpperCase()}</p>
      </div>
      <Lotus className="og__lotus" />
    </div>
  );
}

function Icon() {
  return (
    <div className="icon">
      <span>
        {wedding.groom[0]}
        <em>&amp;</em>
        {wedding.bride[0]}
      </span>
    </div>
  );
}

const plates: Record<string, () => React.ReactElement> = {
  sangam: () => <SangamScene />,
  ghats: () => <GhatsScene />,
  diyas: () => <DiyaWaterScene />,
  brocade: () => <BrocadeScene />,
  mandap: () => <TraditionPlate kind="mandap" />,
  haldi: () => <TraditionPlate kind="haldi" />,
  mehendi: () => <TraditionPlate kind="mehendi" />,
  pheras: () => <TraditionPlate kind="pheras" />,
  og: () => <OgCard />,
  icon: () => <Icon />,
};

const params = new URLSearchParams(location.search);
const name = params.get("plate") ?? "sangam";
const w = Number(params.get("w") ?? 1600);
const h = Number(params.get("h") ?? 1000);
const Plate = plates[name] ?? plates.sangam;

createRoot(document.getElementById("root")!).render(
  <div className="stage" style={{ width: w, height: h }}>
    <Plate />
  </div>,
);
document.fonts.ready.then(() => setTimeout(() => document.body.setAttribute("data-ready", "1"), 300));
