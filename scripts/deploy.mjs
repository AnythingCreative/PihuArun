// Rebuilds the site for its live address and publishes it to Cloudflare
// (static files on a Worker, set up in wrangler.jsonc), which serves it at
// https://arun-pratima.arun-pratima-wedding.workers.dev/.
// Usage: npm run deploy   (first time on a computer: npx wrangler login)
//
// Cloudflare keeps every earlier deploy, so a bad one can be rolled back
// from the Cloudflare dashboard (Workers & Pages → arun-pratima → Deployments).
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SITE_URL = "https://arun-pratima.arun-pratima-wedding.workers.dev/";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, env = process.env) => execFileSync(cmd, { cwd: root, stdio: "inherit", shell: true, env });

console.log(`Building for ${SITE_URL} …`);
run("npm run build", { ...process.env, SITE_URL });

console.log("Publishing …");
run("npx wrangler deploy");
console.log(`Done. Live at ${SITE_URL}`);
