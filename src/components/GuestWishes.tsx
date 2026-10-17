import { useId, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Copy, Mail, PenLine } from "lucide-react";
import { wedding } from "../config/wedding";
import { Lotus, Toran } from "./ornaments/Ornaments";
import { EASE, MQ, gsap } from "../lib/motion";

const MAX_NAME = 60;
const MAX_MESSAGE = 500;

type Status =
  | { kind: "idle" }
  | { kind: "mail-opened" }
  | { kind: "preview"; name: string; message: string; copied?: boolean };

/**
 * Section 10 — blessings and wishes. The form is honest about what happens:
 * with `wishesEmail` configured it opens the guest's own mail app (nothing is
 * sent until they press Send); otherwise it shows a local preview and says
 * plainly that nothing was sent or saved.
 */
export function GuestWishes() {
  const root = useRef<HTMLElement>(null);
  const uid = useId();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; message?: string }>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const mailMode = Boolean(wedding.wishesEmail);

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
    if (!name.trim()) next.name = "Please add your name.";
    if (!message.trim()) next.message = "Please write a short message.";
    setErrors(next);
    if (next.name || next.message) {
      document.getElementById(next.name ? `${uid}-name` : `${uid}-msg`)?.focus();
      return;
    }
    if (mailMode) {
      const subject = `Wishes for ${wedding.groom} & ${wedding.bride}`;
      const body = `${message.trim()}\n\n— ${name.trim()}`;
      window.location.href = `mailto:${wedding.wishesEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus({ kind: "mail-opened" });
    } else {
      setStatus({ kind: "preview", name: name.trim(), message: message.trim() });
    }
  };

  const copyWish = async () => {
    if (status.kind !== "preview") return;
    try {
      await navigator.clipboard.writeText(`${status.message}\n\n— ${status.name}`);
      setStatus({ ...status, copied: true });
    } catch {
      /* clipboard unavailable: the text stays visible to copy by hand */
    }
  };

  return (
    <section id="wishes" ref={root} className="wishes section grain" aria-labelledby="wishes-title">
      <Toran className="wishes__toran" />
      <div className="container wishes__inner">
        <Lotus className="wishes__lotus" aria-hidden />
        <h2 id="wishes-title" className="h2 wishes__reveal">
          Your Presence Is Our Present
        </h2>
        <p className="lead wishes__lead wishes__reveal">
          Your love, blessings, and good wishes will make this celebration even more meaningful.
        </p>

        <form className="wishes__form wishes__reveal" onSubmit={submit} noValidate>
          <p className="wishes__form-title label">
            <PenLine aria-hidden /> Leave a blessing
          </p>
          <div className="field">
            <label htmlFor={`${uid}-name`}>Your name</label>
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
            <label htmlFor={`${uid}-msg`}>Your message</label>
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
          <button type="submit" className="btn">
            {mailMode ? (
              <>
                <Mail aria-hidden /> Send via email
              </>
            ) : (
              <>
                <PenLine aria-hidden /> Preview my wish
              </>
            )}
          </button>
          <p className="wishes__honest">
            {mailMode
              ? "This opens your own email app with the message ready; it is sent only when you press Send there."
              : "Wishes aren't being collected online yet: your message stays on this device and is not sent or saved."}
          </p>

          <div className="wishes__status" aria-live="polite">
            {status.kind === "mail-opened" && (
              <p>Your email app should now be open with your message. If nothing happened, please write to {wedding.wishesEmail}.</p>
            )}
            {status.kind === "preview" && (
              <div className="wish-card">
                <p className="wish-card__label label">Preview — not sent</p>
                <blockquote>
                  <p>{status.message}</p>
                  <footer>— {status.name}</footer>
                </blockquote>
                <button type="button" className="btn btn--ghost" onClick={copyWish}>
                  <Copy aria-hidden /> {status.copied ? "Copied" : "Copy my wish"}
                </button>
                <p className="wishes__honest">You can paste it into a message to the families.</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
