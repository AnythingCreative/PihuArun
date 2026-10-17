import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { soundState, subscribeSound, toggleSound } from "../lib/sound";

/** Sound is off until the visitor presses this. Never autoplays. */
export function SoundToggle({ className }: { className?: string }) {
  const state = useSyncExternalStore(subscribeSound, soundState, () => "off" as const);
  const on = state === "on";
  if (state === "unavailable") return null;
  return (
    <button
      type="button"
      className={`icon-btn sound-toggle ${on ? "is-on" : ""} ${className ?? ""}`}
      aria-pressed={on}
      aria-label={on ? "Mute ambient music" : "Play ambient music"}
      title={on ? "Mute ambient music" : "Play ambient music"}
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
