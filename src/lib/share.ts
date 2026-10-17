import { wedding, displayDate } from "../config/wedding";

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

const pageUrl = () => wedding.siteUrl || window.location.href.split("#")[0];

export async function shareInvitation(): Promise<ShareResult> {
  const data = {
    title: `${wedding.groom} & ${wedding.bride} | Wedding Invitation`,
    text: `With love and blessings, you are invited to the wedding of ${wedding.groom} & ${wedding.bride} — ${displayDate()}, ${wedding.city}.`,
    url: pageUrl(),
  };
  if (typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(data))) {
    try {
      await navigator.share(data);
      return "shared";
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return "cancelled";
      // fall through to copying
    }
  }
  return copyLink();
}

export async function copyLink(): Promise<ShareResult> {
  const url = pageUrl();
  try {
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    // Older browsers / insecure contexts
    const field = document.createElement("textarea");
    field.value = url;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok ? "copied" : "failed";
  }
}
