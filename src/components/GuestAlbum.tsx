import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import qrcode from "qrcode-generator";
import { Printer, X } from "lucide-react";
import { dottedDate, wedding, weddingDayEndsAt } from "../config/wedding";
import { useNames, useT } from "../lib/i18n";

/** The album card is on the page from 4 Nov 2026 (shown early at the couple’s request)… */
const ALBUM_FROM = new Date(`2026-11-04T00:00:00${wedding.utcOffset}`);
/** …and turns into a thank-you once the wedding day is over. */
const AFTER_DATE = weddingDayEndsAt();

type Phase = "hidden" | "during" | "after";

/** The link lives in public/album.js, so it can be changed without a rebuild. Only web links count. */
function albumUrl(): string {
  const raw = (window as unknown as { GUEST_ALBUM_URL?: unknown }).GUEST_ALBUM_URL;
  const url = typeof raw === "string" ? raw.trim() : "";
  return /^https?:\/\//i.test(url) ? url : "";
}

/** ?mode=album previews the card early, ?mode=after the post-wedding version. */
function phaseNow(): Phase {
  const mode = new URLSearchParams(window.location.search).get("mode");
  const now = Date.now();
  if (mode === "after" || now >= AFTER_DATE.getTime()) return "after";
  if (mode === "album" || now >= ALBUM_FROM.getTime()) return "during";
  return "hidden";
}

function usePhase(): Phase {
  const [phase, setPhase] = useState(phaseNow);
  useEffect(() => {
    if (phase === "after") return;
    // the page may stay open across midnight on the day itself
    const id = window.setInterval(() => setPhase(phaseNow()), 60_000);
    return () => window.clearInterval(id);
  }, [phase]);
  return phase;
}

/** One QR drawing (ivory quiet zone, dark modules), shared by the small card and the popup. */
function qrSvg(url: string): string {
  const qr = qrcode(0, "M");
  qr.addData(url);
  qr.make();
  return qr.createSvgTag({ scalable: true });
}

/**
 * Guest photo album: a small QR card in the wishes section that guests can
 * scan straight off a laptop screen, and that opens the full table card
 * (the same one that is printed at A5 for the venue tables).
 * Hidden before ALBUM_FROM, or when no album link is set.
 */
export function GuestAlbum() {
  const t = useT();
  const names = useNames();
  const phase = usePhase();
  const url = useMemo(albumUrl, []);
  const svg = useMemo(() => (url ? qrSvg(url) : ""), [url]);
  const [open, setOpen] = useState(false);
  const chip = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!open || !d) return;
    document.documentElement.classList.add("album-open");
    // A5 paper only while the card is up, so printing the page itself stays as it was
    const paper = document.createElement("style");
    paper.textContent = "@page { size: A5; margin: 0; }";
    document.head.append(paper);
    if (!d.open) d.showModal();
    d.querySelector<HTMLElement>(".album-dialog__close")?.focus();
    return () => {
      document.documentElement.classList.remove("album-open");
      paper.remove();
      if (d.open) d.close();
      chip.current?.focus();
    };
  }, [open]);

  if (!url || phase === "hidden") return null;

  const after = phase === "after";
  const line = t("Share your photos with us", "अपनी तस्वीरें हमारे साथ साझा करें");
  const opensNewTab = t("(opens in a new tab)", "(नए टैब में खुलेगा)");
  // a click on the dark area around the card (the dialog itself) closes it
  const onBackdrop = (e: MouseEvent<HTMLDialogElement>) => e.target === e.currentTarget && setOpen(false);

  return (
    <div className="album-spot">
      <button ref={chip} type="button" className="album-chip" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className="album-chip__qr" aria-hidden dangerouslySetInnerHTML={{ __html: svg }} />
        <span className="album-chip__line">{after ? t("Thank you! Share your photos with us", "धन्यवाद! अपनी तस्वीरें हमारे साथ साझा करें") : line}</span>
        <span className="album-chip__hint">{t("Tap to open", "खोलने के लिए छूएँ")}</span>
      </button>

      {open &&
        createPortal(
          <dialog
            ref={dialog}
            className="album-dialog"
            aria-labelledby="album-title"
            onClose={() => setOpen(false)}
            onClick={onBackdrop}
          >
            <div className="album-sheet">
              <button type="button" className="album-dialog__close" onClick={() => setOpen(false)} aria-label={t("Close", "बंद करें")}>
                <X aria-hidden />
              </button>

              <article className="album-card">
                <div className="album-card__frame">
                  <p className="album-card__blessing" lang="sa">॥ शुभ विवाह ॥</p>
                  <h2 id="album-title" className="album-card__title">{t("Guest Photo Album", "अतिथि फ़ोटो एल्बम")}</h2>
                  <p className="album-card__names">
                    {names.groom} <em>&amp;</em> {names.bride}
                  </p>
                  <p className="album-card__date">{dottedDate()}</p>
                  <p className="album-card__line">{line}</p>
                  <a className="album-card__qr" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${t("Open the album", "एल्बम खोलें")} ${opensNewTab}`}>
                    <span aria-hidden dangerouslySetInnerHTML={{ __html: svg }} />
                  </a>
                  <a className="album-card__open" href={url} target="_blank" rel="noopener noreferrer">
                    {t("Open the album", "एल्बम खोलें")}
                    <span className="visually-hidden"> {opensNewTab}</span>
                  </a>
                  <ol className="album-card__steps">
                    <li>{t("Open your phone camera and point it at the code", "अपने फ़ोन का कैमरा खोलें और उसे इस कोड की ओर करें")}</li>
                    <li>{t("Tap the link to open our shared album", "लिंक छूकर हमारा साझा एल्बम खोलें")}</li>
                    <li>{t("Tap + and add your photos and videos", "+ छूएँ और अपनी तस्वीरें व वीडियो जोड़ें")}</li>
                  </ol>
                  <p className="album-card__tagline">
                    {after
                      ? t("Thank you for celebrating with us.", "हमारे साथ उत्सव मनाने के लिए हृदय से धन्यवाद।")
                      : t("Every moment you capture becomes a memory we keep.", "आपकी खींची हर तस्वीर हमारी अनमोल याद बनेगी।")}
                  </p>
                </div>
              </article>

              <button type="button" className="album-dialog__print" onClick={() => window.print()}>
                <Printer aria-hidden /> {t("Print", "प्रिंट करें")}
              </button>
            </div>
          </dialog>,
          document.body,
        )}
    </div>
  );
}
