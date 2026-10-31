import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { soundState, subscribeSound, toggleSound } from "../lib/sound";
import { useT } from "../lib/i18n";

/** Sound is off until the visitor presses this. Never autoplays. */
export function SoundToggle({ className }: { className?: string }) {
  const state = useSyncExternalStore(subscribeSound, soundState, () => "off" as const);
  const on = state === "on";
  const t = useT();
  const label = on ? t("Mute music", "संगीत बंद करें") : t("Play soothing music", "मधुर संगीत चलाएँ");
  if (state === "unavailable") return null;
  return (
    <button
      type="button"
      className={`icon-btn sound-toggle ${on ? "is-on" : ""} ${className ?? ""}`}
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={() => void toggleSound()}
      disabled={state === "starting"}
    >
      {on ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
      <span className="sound-toggle__bars" aria-hidden>
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}
