import { useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, PenLine } from "lucide-react";
import { wedding } from "../config/wedding";
import { Lotus, Toran } from "./ornaments/Ornaments";
import { EASE, MQ, gsap } from "../lib/motion";
import { useNames, useT } from "../lib/i18n";
import { GuestAlbum } from "./GuestAlbum";

const MAX_NAME = 60;
const MAX_MESSAGE = 500;

/** Blessings go to the first contact (Arun) on WhatsApp. */
const RECIPIENT = wedding.contacts[0];

type Status = { kind: "idle" } | { kind: "sent"; name: string; message: string; href: string };

/**
 * Section 10 — blessings and wishes. Writing a blessing opens WhatsApp with it
 * already typed to Arun; it is sent when the guest presses Send there.
 * Nothing is stored on the site.
 */
export function GuestWishes() {
  const root = useRef<HTMLElement>(null);
  const uid = useId();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const t = useT();
  const names = useNames();
  const recipientName = t(RECIPIENT.name, RECIPIENT.nameHi);

  useLayoutEffect(() => {
    const el = root.current!;
    const mm = gsap.matchMedia();
    mm.add(MQ.motion, () => {
      gsap.fromTo(el.querySelectorAll(".wishes__lotus path"), { strokeDashoffset: 1 }, {
        strokeDashoffset: 0,
        duration: 2.4,
        ease: EASE.inOut,
        stagger: 0.04,
        scrollTrigger: { trigger: el, start: "top 70%" },
      });
      gsap.from(el.querySelectorAll(".wishes__reveal"), {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 1,
        ease: EASE.soft,
        scrollTrigger: { trigger: el, start: "top 65%" },
      });
    });
    return () => mm.revert();
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = t("Please add your name.", "कृपया अपना नाम लिखें।");
    if (!message.trim()) next.message = t("Please write a short message.", "कृपया एक छोटा-सा संदेश लिखें।");
    setErrors(next);
    if (next.name || next.message) {
      document.getElementById(next.name ? `${uid}-name` : `${uid}-msg`)?.focus();
      return;
    }
    const text = t(
      `🙏 Blessings for ${wedding.groom} & ${wedding.bride}\n\n${message.trim()}\n\n— ${name.trim()}`,
      `🙏 ${names.groom} और ${names.bride} के लिए शुभकामनाएँ\n\n${message.trim()}\n\n— ${name.trim()}`,
    );
    const href = `https://wa.me/91${RECIPIENT.phone}?text=${encodeURIComponent(text)}`;
    window.open(href, "_blank", "noopener");
    setStatus({ kind: "sent", name: name.trim(), message: message.trim(), href });
  };

  return (
    <section id="wishes" ref={root} className="wishes section grain" aria-labelledby="wishes-title">
      <Toran className="wishes__toran" />
      <div className="container wishes__inner">
        <Lotus className="wishes__lotus" aria-hidden />
        <h2 id="wishes-title" className="h2 wishes__reveal">
          {t("Your Presence Is Our Present", "आपकी उपस्थिति ही हमारा उपहार है")}
        </h2>
        <p className="lead wishes__lead wishes__reveal">
          {t(
            "Your love, blessings, and good wishes will make this celebration even more meaningful.",
            "आपका स्नेह, आशीर्वाद और शुभकामनाएँ इस उत्सव को और भी सार्थक बना देंगी।",
          )}
        </p>

        <form className="wishes__form wishes__reveal" onSubmit={submit} noValidate>
          <p className="wishes__form-title label">
            <PenLine aria-hidden /> {t("Leave a blessing", "आशीर्वाद भेजें")}
          </p>
          <div className="field">
            <label htmlFor={`${uid}-name`}>{t("Your name", "आपका नाम")}</label>
            <input
              id={`${uid}-name`}
              name="name"
              autoComplete="name"
              maxLength={MAX_NAME}
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${uid}-name-err` : undefined}
            />
            {errors.name && (
              <p id={`${uid}-name-err`} className="field__error">
                {errors.name}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor={`${uid}-msg`}>{t("Your blessing", "आपका आशीर्वाद")}</label>
            <textarea
              id={`${uid}-msg`}
              name="message"
              rows={4}
              maxLength={MAX_MESSAGE}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={`${uid}-msg-count${errors.message ? ` ${uid}-msg-err` : ""}`}
            />
            <p id={`${uid}-msg-count`} className="field__count">
              {message.length} / {MAX_MESSAGE}
            </p>
            {errors.message && (
              <p id={`${uid}-msg-err`} className="field__error">
                {errors.message}
              </p>
            )}
          </div>
          <button type="submit" className="btn wishes__send">
            <MessageCircle aria-hidden /> {t(`Send to ${recipientName} on WhatsApp`, `WhatsApp पर ${recipientName} को भेजें`)}
          </button>
          <p className="wishes__honest">
            {t(
              "This opens WhatsApp with your blessing ready; it is sent when you press Send there.",
              "इससे WhatsApp में आपका संदेश तैयार खुलेगा; वहाँ Send दबाने पर ही भेजा जाएगा।",
            )}
          </p>

          <div className="wishes__status" aria-live="polite">
            {status.kind === "sent" && (
              <div className="wish-card">
                <p className="wish-card__label label">{t("Opening WhatsApp", "WhatsApp खुल रहा है")}</p>
                <blockquote>
                  <p>{status.message}</p>
                  <footer>— {status.name}</footer>
                </blockquote>
                <p className="wishes__honest">
                  {t("If WhatsApp didn't open, ", "अगर WhatsApp नहीं खुला, तो ")}
                  <a href={status.href} target="_blank" rel="noopener noreferrer">
                    {t("tap here to send it", "भेजने के लिए यहाँ छूएँ")}
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        </form>

        <GuestAlbum />
      </div>
    </section>
  );
}
