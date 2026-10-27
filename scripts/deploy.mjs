// Rebuilds the site for its live address and publishes it to the gh-pages
// branch, which GitHub Pages serves at https://anythingcreative.github.io/PihuArun/.
// Usage: npm run deploy
//
// It clones gh-pages into a temporary folder, swaps in the new build and
// makes a normal (fast-forward) push, so earlier versions stay in history.
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";

const REPO = "https://github.com/AnythingCreative/PihuArun.git";
const BRANCH = "gh-pages";
const SITE_URL = "https://anythingcreative.github.io/PihuArun/";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const git = (args, cwd) => execFileSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, GIT_TERMINAL_PROMPT: "0" } }).trim();

console.log(`Building for ${SITE_URL} …`);
execFileSync("npm run build", { cwd: root, stdio: "inherit", shell: true, env: { ...process.env, SITE_URL } });

const work = mkdtempSync(path.join(tmpdir(), "pihuarun-deploy-"));
try {
  console.log(`Fetching the published branch (${BRANCH}) …`);
  git(["clone", "--quiet", "--depth", "1", "--branch", BRANCH, REPO, work]);

  // replace everything except git's own folder with the fresh build
  for (const entry of readdirSync(work)) if (entry !== ".git") rmSync(path.join(work, entry), { recursive: true, force: true });
  cpSync(path.join(root, "dist"), work, { recursive: true });

  git(["add", "-A"], work);
  if (!git(["status", "--porcelain"], work)) {
    console.log("Nothing changed since the last deploy. The live site is already up to date.");
  } else {
    const name = git(["log", "-1", "--format=%an"], work);
    const email = git(["log", "-1", "--format=%ae"], work);
    const stamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    git(["-c", `user.name=${name}`, "-c", `user.email=${email}`, "commit", "--quiet", "-m", `Deploy ${stamp} IST`], work);
    console.log("Publishing …");
    git(["push", "--quiet", "origin", BRANCH], work);
    console.log(`Done. Live in about a minute at ${SITE_URL}`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
