import { wedding, displayDate } from "../config/wedding";

export type ShareResult = "shared" | "copied" | "whatsapp" | "cancelled" | "failed";

const pageUrl = () => wedding.siteUrl || window.location.href.split("#")[0];

export async function shareInvitation(): Promise<ShareResult> {
  const data = {
    title: `${wedding.groom} & ${wedding.bride} | Wedding Invitation`,
    text: `With love and blessings, you are invited to the wedding of ${wedding.groom} & ${wedding.bride} — ${displayDate()}, ${wedding.city}.`,
    url: pageUrl(),
  };
  const canNativeShare = typeof navigator.share === "function" && (!navigator.canShare || navigator.canShare(data));
  // Phones without native sharing (e.g. any http:// page): WhatsApp is how
  // guests share anyway. Opened before any await so the tap still counts.
  if (!canNativeShare && window.matchMedia("(pointer: coarse)").matches) {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${data.text}
${data.url}`)}`, "_blank", "noopener");
    return "whatsapp";
  }
  if (canNativeShare) {
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
    if (!navigator.clipboard) throw new Error("no clipboard API");
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    // Older browsers / insecure contexts. iOS only copies from an editable,
    // on-screen field with an explicit selection range.
    const field = document.createElement("textarea");
    field.value = url;
    field.contentEditable = "true";
    field.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0.01;font-size:16px";
    document.body.appendChild(field);
    field.focus();
    field.select();
    field.setSelectionRange(0, url.length);
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    field.remove();
    return ok ? "copied" : "failed";
  }
}
