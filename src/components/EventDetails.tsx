import { useLayoutEffect, useRef } from "react";
import { Clock, MapPin, Navigation as NavIcon, Car, ParkingCircle, ExternalLink } from "lucide-react";
import { wedding, fullPlace, hasCeremonyTime, hasVenue, longDate, formatTime } from "../config/wedding";
import { DotDivider, LotusDivider } from "./ornaments/Ornaments";
import { EASE, MQ, gsap } from "../lib/motion";

function mapsQuery() {
  if (wedding.venueMapQuery) return wedding.venueMapQuery;
  return [wedding.venueName, wedding.venueAddress, wedding.city, wedding.state, wedding.country].filter(Boolean).join(", ");
}

function directionsUrl() {
  const q = mapsQuery();
  if (/^https?:\/\//.test(q)) return q;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
}

/** Section 08 — ceremony and venue. Unknown details stay honest placeholders. */
export function EventDetails() {
  const root = useRef<HTMLElement>(null);
  const venueKnown = hasVenue();
  const embeddable = venueKnown && wedding.showMapEmbed && !/^https?:\/\//.test(mapsQuery());

  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.from(el.querySelectorAll(".details__reveal"), {
        opacity: 0,
        y: 28,
        stagger: 0.1,
        duration: 1,
        ease: EASE.soft,
        scrollTrigger: { trigger: el, start: "top 75%" },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section id="details" ref={root} className="details section grain" aria-labelledby="details-title">
      <div className="container details__inner">
        <p className="label eyebrow details__reveal">The celebration</p>
        <h2 id="details-title" className="details__title label details__reveal" data-focus-target>
          Wedding Ceremony
        </h2>
        <p className="details__date display details__reveal">
          <time dateTime={wedding.date}>{longDate()}</time>
        </p>
        <LotusDivider className="details__reveal" />

        <dl className="details__list details__reveal">
          <div className="details__item">
            <dt className="label">
              <Clock aria-hidden /> Time
            </dt>
            <dd>
              {hasCeremonyTime() ? (
                <>
                  {formatTime(wedding.ceremonyStart)}
                  {wedding.ceremonyEnd && <> – {formatTime(wedding.ceremonyEnd)}</>} <span className="details__muted">IST</span>
                </>
              ) : (
                <span className="details__muted">To be announced</span>
              )}
            </dd>
          </div>
          <div className="details__item">
            <dt className="label">
              <MapPin aria-hidden /> Place
            </dt>
            <dd>
              {venueKnown ? (
                <>
                  {wedding.venueName && <strong className="details__venue">{wedding.venueName}</strong>}
                  {wedding.venueAddress && <span className="details__address">{wedding.venueAddress}</span>}
                </>
              ) : (
                <>
                  {fullPlace()}
                  <span className="details__muted details__address">Venue details to follow</span>
                </>
              )}
            </dd>
          </div>
        </dl>

        {venueKnown ? (
          <div className="details__venue-block details__reveal">
            <a className="btn" href={directionsUrl()} target="_blank" rel="noopener noreferrer">
              <NavIcon aria-hidden /> Get Directions
              <span className="visually-hidden">(opens Google Maps in a new tab)</span>
            </a>
            {embeddable && (
              <iframe
                className="details__map"
                title={`Map showing ${wedding.venueName || "the venue"}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(mapsQuery())}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
            {(wedding.transportNotes || wedding.parkingNotes) && (
              <div className="details__notes">
                {wedding.transportNotes && (
                  <p>
                    <Car aria-hidden /> {wedding.transportNotes}
                  </p>
                )}
                {wedding.parkingNotes && (
                  <p>
                    <ParkingCircle aria-hidden /> {wedding.parkingNotes}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="details__placeholder details__reveal">
            <DotDivider />
            <p className="lead">Celebration venue details will be shared soon.</p>
          </div>
        )}

        {wedding.rsvpUrl && (
          <a className="btn btn--ghost details__reveal" href={wedding.rsvpUrl} target="_blank" rel="noopener noreferrer">
            RSVP <ExternalLink aria-hidden />
            <span className="visually-hidden">(opens in a new tab)</span>
          </a>
        )}
      </div>
    </section>
  );
}
