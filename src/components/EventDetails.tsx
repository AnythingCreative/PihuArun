import { useLayoutEffect, useRef } from "react";
import { Landmark, MapPin, Phone, MessageCircle, Navigation as NavIcon, Car, ParkingCircle, ExternalLink } from "lucide-react";
import { wedding, fullPlace, hasVenue, longDate } from "../config/wedding";
import { DotDivider, LotusDivider } from "./ornaments/Ornaments";
import { EASE, MQ, gsap } from "../lib/motion";
import { SectionBackdrop } from "./v2/SectionBackdrop";
import { useDateFormat, useLang, useT } from "../lib/i18n";

function mapsQuery() {
  if (wedding.venueMapQuery) return wedding.venueMapQuery;
  return [wedding.venueName, wedding.venueAddress, wedding.city, wedding.state, wedding.country].filter(Boolean).join(", ");
}

/**
 * Google's official directions URL. Built from the venue name and address
 * whenever they are known: short maps.app.goo.gl links fail to open in some
 * phone browsers, while this form always opens Maps (or the Maps app).
 */
function directionsUrl() {
  const place = [wedding.venueName, wedding.venueAddress].filter(Boolean).join(", ");
  const q = place || mapsQuery();
  if (/^https?:\/\//.test(q)) return q;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(q)}`;
}

/** Section 08 — ceremony and venue. Unknown details stay honest placeholders. */
export function EventDetails() {
  const t = useT();
  const hindi = useLang() === "hi";
  const fmt = useDateFormat();
  const root = useRef<HTMLElement>(null);
  const venueKnown = hasVenue();
  // the map embed needs a place search, so it uses the venue name and city (the short link is for directions)
  const embedQuery = [wedding.venueName, wedding.venueAddress, wedding.city, wedding.state].filter(Boolean).join(", ");
  const embeddable = venueKnown && wedding.showMapEmbed && Boolean(wedding.venueName || wedding.venueAddress);

  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.from(el.querySelector(".details__inner"), { opacity: 0, y: 60, scale: 0.95, duration: 1.2, ease: EASE.soft, scrollTrigger: { trigger: el, start: "top 75%" } });
      gsap.from(el.querySelectorAll(".details__reveal"), {
        delay: 0.3,
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
      <SectionBackdrop slot="sangam-bg" className="backdrop--details" />
      <div className="container details__inner">
        <p className="label eyebrow details__reveal">{t("The celebration", "शुभ अवसर")}</p>
        <h2 id="details-title" className="details__title label details__reveal" data-focus-target>
          {t("Wedding Ceremony", "विवाह समारोह")}
        </h2>
        <p className="details__date display details__reveal">
          <time dateTime={wedding.date}>{t(longDate(), fmt(wedding.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }))}</time>
        </p>
        <LotusDivider className="details__reveal" />

        <dl className="details__list details__reveal">
          <div className="details__item">
            <dt className="label">
              <Landmark aria-hidden /> {t("Venue", "विवाह स्थल")}
            </dt>
            <dd>
              {wedding.venueName && <strong className="details__venue">{t(wedding.venueName, "शिवाय वाटिका")}</strong>}
              {wedding.venueAddress && <span className="details__address">{wedding.venueAddress}</span>}
              <a className="btn details__directions" href={directionsUrl()} target="_blank" rel="noopener noreferrer">
                <NavIcon aria-hidden /> {t("Get Directions", "रास्ता देखें")}
                <span className="visually-hidden">{t("(opens Google Maps in a new tab)", "(Google Maps नए टैब में खुलेगा)")}</span>
              </a>
            </dd>
          </div>
          <div className="details__item">
            <dt className="label">
              <MapPin aria-hidden /> {t("Place", "शहर")}
            </dt>
            <dd>
              {t(fullPlace(), "प्रयागराज, उत्तर प्रदेश, भारत")}
            </dd>
          </div>
        </dl>

        {venueKnown ? (
          <div className="details__venue-block details__reveal">
            {embeddable && (
              <iframe
                className="details__map"
                title={`Map showing ${wedding.venueName || "the venue"}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(embedQuery)}&output=embed`}
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

        {wedding.contacts.length > 0 && (
          <div className="details__contacts details__reveal">
            <p className="label eyebrow">{t("Need help? Reach us", "सहायता के लिए संपर्क करें")}</p>
            <ul className="contacts">
              {wedding.contacts.map((c) => (
                <li key={c.phone} className="contact">
                  <p className="contact__name">{hindi ? c.nameHi : c.name}</p>
                  <p className="contact__role">{hindi ? c.roleHi : c.role}</p>
                  <p className="contact__number">
                    +91 {c.phone.slice(0, 5)} {c.phone.slice(5)}
                  </p>
                  <div className="contact__actions">
                    <a className="contact__btn contact__btn--call" href={`tel:+91${c.phone}`}>
                      <Phone aria-hidden /> {t("Call", "कॉल करें")}
                      <span className="visually-hidden"> {c.name}</span>
                    </a>
                    <a
                      className="contact__btn contact__btn--wa"
                      href={`https://wa.me/91${c.phone}?text=${encodeURIComponent(hindi ? c.whatsappTextHi : c.whatsappText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle aria-hidden /> WhatsApp
                      <span className="visually-hidden"> {c.name} (opens WhatsApp)</span>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
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
