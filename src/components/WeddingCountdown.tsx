import { useLayoutEffect, useRef, useState } from "react";
import { CalendarPlus, Share2 } from "lucide-react";
import { wedding, dottedDate, fullPlace, hasCeremonyTime, weddingDayEndsAt, weddingStartsAt, formatTime, longDate } from "../config/wedding";
import { useCountdown } from "../hooks/useCountdown";
import { downloadIcs } from "../lib/calendar";
import { shareInvitation, type ShareResult } from "../lib/share";
import { CornerFlourish, Mandala } from "./ornaments/Ornaments";
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
  cancelled: "",
  failed: "Couldn't copy automatically — please copy the address from your browser.",
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

    mm.add({ desktop: "(min-width: 768px)", motion: MQ.motion }, (ctx) => {
      if (!ctx.conditions?.motion) return;
      if (!ctx.conditions.desktop) {
        // phones: the burgundy curtain opens as the section scrolls in, without pinning
        gsap.fromTo(q(".savedate__curtain"), { clipPath: "circle(12% at 50% 30%)" }, {
          clipPath: "circle(150% at 50% 30%)",
          ease: EASE.none,
          scrollTrigger: { trigger: el, start: "top 90%", end: "top 15%", scrub: 0.5 },
        });
        gsap.from(q(".savedate__reveal"), { opacity: 0, y: 24, stagger: 0.1, duration: 1, ease: EASE.soft, scrollTrigger: { trigger: el, start: "top 45%" } });
        return;
      }
      const tl = gsap.timeline({
        defaults: { ease: EASE.none },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: ctx.conditions.desktop ? "+=110%" : "+=70%",
          scrub: 0.6,
          pin: q(".savedate__stage")[0],
          anticipatePin: 1,
        },
      });
      tl.fromTo(q(".savedate__curtain"), { clipPath: "circle(6% at 50% 50%)" }, { clipPath: "circle(75% at 50% 50%)", duration: 0.5, ease: EASE.inOut }, 0)
        .fromTo(q(".savedate__mandala"), { rotate: -30, scale: 0.7, opacity: 0 }, { rotate: 0, scale: 1, opacity: 1, duration: 0.7, ease: EASE.soft }, 0.1)
        .fromTo(q(".savedate__frame .savedate__corner path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.35, ease: EASE.inOut }, 0.35)
        .from(q(".savedate__reveal"), { opacity: 0, y: 30, stagger: 0.05, duration: 0.2, ease: EASE.soft }, 0.4)
        .from(q(".savedate__digit"), { yPercent: 100, opacity: 0, stagger: 0.025, duration: 0.2, ease: EASE.soft }, 0.45);
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
          <Mandala className="savedate__mandala" aria-hidden />

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
              <p className="savedate__time label">
                {hasCeremonyTime() ? `Ceremony at ${formatTime(wedding.ceremonyStart)} IST` : "Ceremony time to be announced"}
              </p>
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
              {shareMsg ||
                (hasCeremonyTime()
                  ? "The calendar file includes the ceremony time in India Standard Time."
                  : "Until the ceremony time is confirmed, the calendar adds an all-day event.")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
