import { useLayoutEffect, useRef, useState } from "react";
import { CalendarPlus, Share2 } from "lucide-react";
import { wedding, dottedDate, fullPlace, weddingDayEndsAt, weddingStartsAt, longDate } from "../config/wedding";
import { useCountdown } from "../hooks/useCountdown";
import { downloadIcs } from "../lib/calendar";
import { shareInvitation, type ShareResult } from "../lib/share";
import { CornerFlourish, Mandala } from "./ornaments/Ornaments";
import { SkyLanterns } from "./v2/SkyLanterns";
import { EASE, MQ, gsap } from "../lib/motion";

const START = weddingStartsAt();
const DAY_END = weddingDayEndsAt();

const UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

const SHARE_MESSAGES: Record<ShareResult, string> = {
  shared: "Thank you for sharing the invitation.",
  copied: "Link copied — paste it anywhere to share.",
  whatsapp: "Opening WhatsApp to share the invitation…",
  cancelled: "",
  failed: `Couldn't copy automatically — share this address: ${typeof window !== "undefined" ? window.location.href.split("#")[0] : ""}`,
};

function CountdownClock() {
  const c = useCountdown(START, DAY_END);
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

  if (c.phase === "today") {
    return (
      <div className="countdown countdown--today" role="status">
        <p className="countdown__celebrate display">Today is the day</p>
        <p className="label">The wedding celebrations have begun · शुभ विवाह</p>
      </div>
    );
  }
  if (c.phase === "after") {
    return (
      <div className="countdown countdown--after" role="status">
        <p className="countdown__celebrate display">Happily married</p>
        <p className="label">Thank you for your love and blessings</p>
      </div>
    );
  }
  return (
    <div className="countdown">
      <p className="visually-hidden">
        {plural(c.days, "day")}, {plural(c.hours, "hour")} and {plural(c.minutes, "minute")} until the wedding.
      </p>
      <ol className="countdown__units" aria-hidden>
        {UNITS.map((u) => (
          <li key={u.key} className="countdown__unit">
            <span className="countdown__value">{String(c[u.key]).padStart(2, "0")}</span>
            <span className="countdown__label label">{u.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Section 07 — the wedding day reveal: a burgundy curtain opens on the date. */
export function WeddingCountdown() {
  const root = useRef<HTMLElement>(null);
  const [shareMsg, setShareMsg] = useState("");

  useLayoutEffect(() => {
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      // a single timed reveal as the section arrives; the sky is always coloured
      const tl = gsap.timeline({ defaults: { ease: EASE.soft }, scrollTrigger: { trigger: el, start: "top 65%", once: true } });
      tl.fromTo(q(".savedate__mandala-wrap"), { scale: 0.55, rotate: -40, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 2.2 }, 0)
        .from(q(".savedate__title"), { opacity: 0, y: 30, scale: 0.9, duration: 1.1 }, 0.2)
        .from(q(".savedate__frame"), { opacity: 0, y: 40, scale: 0.94, duration: 1.1 }, 0.4)
        .fromTo(q(".savedate__frame .savedate__corner path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: EASE.inOut }, 0.7)
        .from(q(".savedate__digit"), { yPercent: 110, opacity: 0, rotateX: -80, stagger: 0.06, duration: 0.8, ease: "back.out(1.7)" }, 0.8)
        .from(q(".savedate__frame p:not(.savedate__date)"), { opacity: 0, y: 14, stagger: 0.12, duration: 0.8 }, 1.4)
        .from(q(".countdown__unit"), { opacity: 0, y: 30, scale: 0.8, stagger: 0.1, duration: 0.9, ease: "back.out(1.6)" }, 1.6)
        .from(q(".savedate__actions > *, .savedate__fineprint"), { opacity: 0, y: 20, stagger: 0.1, duration: 0.8 }, 2);
    });

    return () => mm.revert();
  }, []);

  const onShare = async () => {
    const result = await shareInvitation();
    setShareMsg(SHARE_MESSAGES[result]);
  };

  const date = dottedDate();

  return (
    <section id="wedding-day" ref={root} className="savedate on-dark" aria-labelledby="savedate-title">
      <div className="savedate__stage">
        <div className="savedate__curtain">
          <div className="savedate__brocade" aria-hidden />
          <SkyLanterns />
          <div className="savedate__mandala-wrap" aria-hidden>
            <Mandala className="savedate__mandala" />
          </div>

          <div className="savedate__content">
            <h2 id="savedate-title" className="savedate__title display savedate__reveal" data-focus-target>
              Save the Date
            </h2>

            <div className="savedate__frame savedate__reveal">
              <CornerFlourish className="savedate__corner savedate__corner--tl" />
              <CornerFlourish className="savedate__corner savedate__corner--tr" />
              <CornerFlourish className="savedate__corner savedate__corner--bl" />
              <CornerFlourish className="savedate__corner savedate__corner--br" />
              <p className="savedate__date display">
                <time dateTime={wedding.date}>
                  <span className="visually-hidden">{longDate()}</span>
                  {date.split("").map((ch, i) => (
                    <span key={i} className={`savedate__digit ${ch === "." ? "is-dot" : ""}`} aria-hidden>
                      {ch}
                    </span>
                  ))}
                </time>
              </p>
              <p className="savedate__weds label">
                {wedding.groom.toUpperCase()} <span>weds</span> {wedding.bride.toUpperCase()}
              </p>
              <p className="savedate__place">{fullPlace()}</p>
            </div>

            <div className="savedate__reveal">
              <CountdownClock />
            </div>

            <div className="savedate__actions savedate__reveal">
              <button type="button" className="btn btn--gold" onClick={downloadIcs}>
                <CalendarPlus aria-hidden /> Add to Calendar
              </button>
              <button type="button" className="btn btn--ghost-light" onClick={onShare}>
                <Share2 aria-hidden /> Share Invitation
              </button>
            </div>
            <p className="savedate__fineprint savedate__reveal" aria-live="polite">
              {shareMsg || "Add the wedding day to your calendar."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
