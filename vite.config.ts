import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * The site's public address, picked up automatically on common hosts:
 * SITE_URL (set it yourself, or GitHub Actions sets it), Netlify's URL,
 * Vercel's production URL or Cloudflare Pages' CF_PAGES_URL.
 */
function siteUrl() {
  const raw =
    process.env.SITE_URL ||
    process.env.URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    process.env.CF_PAGES_URL ||
    "";
  return raw ? raw.replace(/\/?$/, "/") : "";
}

/** Social previews (WhatsApp, Facebook, X) need absolute URLs; add them when the address is known. */
function absoluteMeta(url: string): Plugin {
  return {
    name: "absolute-meta",
    transformIndexHtml(html) {
      if (!url) return html.replace("    <!-- canonical -->\n", "");
      return html
        .replace(/content="og-image\.jpg"/g, `content="${url}og-image.jpg"`)
        .replace("<!-- canonical -->", `<link rel="canonical" href="${url}" />\n    <meta property="og:url" content="${url}" />`);
    },
  };
}

const url = siteUrl();

// `base: "./"` keeps the build portable: it works from a domain root,
// a sub-path (e.g. GitHub Pages) or a plain static folder.
export default defineConfig({
  base: "./",
  plugins: [react(), absoluteMeta(url)],
  define: {
    "import.meta.env.VITE_SITE_URL": JSON.stringify(url),
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/gsap")) return "gsap";
          if (id.includes("node_modules/react")) return "react";
        },
      },
    },
  },
});
