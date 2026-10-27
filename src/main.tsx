import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource/cormorant-garamond/latin-300.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/eb-garamond/latin-400.css";
import "@fontsource/eb-garamond/latin-500.css";
import "@fontsource/eb-garamond/latin-400-italic.css";
import "@fontsource/cinzel-decorative/latin-700.css";
import "@fontsource/cinzel-decorative/latin-900.css";
import "@fontsource/great-vibes/latin-400.css";
import "@fontsource/tiro-devanagari-hindi/devanagari-400.css";
import "@fontsource/tiro-devanagari-hindi/latin-400.css";
import "@fontsource/rozha-one/latin-400.css";
import "@fontsource/rozha-one/devanagari-400.css";
import "@fontsource/yatra-one/devanagari-400.css";
import "@fontsource/yatra-one/latin-400.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/noto-serif-devanagari/devanagari-400.css";
import "@fontsource/noto-serif-devanagari/devanagari-500.css";

import "./styles/globals.css";
import "./styles/sections.css";
import "./styles/animations.css";
import "./styles/v2.css";
import "./styles/v3.css";
import App from "./App";

document.documentElement.classList.add("js");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
