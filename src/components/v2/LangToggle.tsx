import { setLang, useLang } from "../../lib/i18n";

/** English ⇄ हिंदी switch in the title bar. Shows the language you'd switch to. */
export function LangToggle() {
  const lang = useLang();
  const next = lang === "en" ? "hi" : "en";
  return (
    <button
      type="button"
      className="icon-btn lang-toggle"
      lang={next}
      onClick={() => setLang(next)}
      aria-label={lang === "en" ? "हिंदी में पढ़ें (Read in Hindi)" : "Read in English (अंग्रेज़ी में पढ़ें)"}
      title={lang === "en" ? "हिंदी में पढ़ें" : "Read in English"}
    >
      {lang === "en" ? "हिं" : "EN"}
    </button>
  );
}
