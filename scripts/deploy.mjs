// Rebuilds the site for its live address and publishes it to Cloudflare Pages,
// which serves it at https://arunpratima-invite.pages.dev/.
// Usage: npm run deploy   (first time on a computer: npx wrangler login)
//
// Cloudflare keeps every earlier deploy, so a bad one can be rolled back
// from the dashboard (Workers & Pages → arunpratima-invite → Deployments).
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const PROJECT = "arunpratima-invite";
const SITE_URL = `https://${PROJECT}.pages.dev/`;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, env = process.env) => execFileSync(cmd, { cwd: root, stdio: "inherit", shell: true, env });

console.log(`Building for ${SITE_URL} …`);
run("npm run build", { ...process.env, SITE_URL });

console.log("Publishing …");
// --force keeps this on Pages: without it wrangler 4.15x quietly deploys to a Worker instead
run(`npx wrangler pages deploy dist --project-name ${PROJECT} --branch main --commit-dirty=true --force`);
console.log(`Done. Live at ${SITE_URL}`);
