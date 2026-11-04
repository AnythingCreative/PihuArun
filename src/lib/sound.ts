/**
 * Ambient sound. Starts with the guest's first tap (opening the doors), as
 * browsers only allow sound after a tap. A guest who mutes it stays muted.
 *
 * If `wedding.musicUrl` points at a licensed audio file it is played on loop.
 * Otherwise (or if the file fails to load) the page plays a slow santoor
 * melody in Raag Yaman, synthesised in the browser: just the santoor, no
 * drone or drums. Original, so there are no copyright questions and no
 * asset that can go missing.
 */
import { wedding } from "../config/wedding";
import { publicUrl } from "../data/assets";

type Listener = () => void;
export type SoundState = "off" | "starting" | "on" | "unavailable";

let state: SoundState = "off";
const listeners = new Set<Listener>();
const set = (s: SoundState) => {
  state = s;
  listeners.forEach((l) => l());
};
export const soundState = () => state;
export const subscribeSound = (l: Listener) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/* ---------------- file playback ---------------- */

let audioEl: HTMLAudioElement | null = null;

async function playFile(): Promise<"ok" | "blocked" | "failed"> {
  try {
    audioEl ??= Object.assign(new Audio(/^https?:/.test(wedding.musicUrl) ? wedding.musicUrl : publicUrl(wedding.musicUrl)), {
      loop: true,
      volume: 0.5,
      preload: "auto",
    });
    await audioEl.play();
    return "ok";
  } catch (e) {
    // blocked until a tap: keep the file and try again then
    if ((e as DOMException)?.name === "NotAllowedError") return "blocked";
    audioEl = null;
    return "failed";
  }
}

/* ---------------- synthesised santoor ---------------- */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let scheduler = 0;
let nextNote = 0;
let noteIndex = 0;

const SA = 293.66; // D4
const BEAT = 0.52;

/**
 * The tune: [semitones from Sa, beats, bass note under it]. Raag Yaman,
 * four slow phrases that come home to Sa. Long notes are held with a soft
 * tremolo, the way santoor players sustain them.
 */
const TUNE: [number | null, number, number?][] = [
  // N R G · R G M P · M G R G R S
  [-1, 1, -12], [2, 1], [4, 2], [2, 1], [4, 1], [6, 1], [7, 3, -5], [6, 1], [4, 1], [2, 1], [4, 1], [2, 1], [0, 3, -12], [null, 1],
  // S G P D N S' · N D P · M G R
  [0, 1, -12], [4, 1], [7, 1], [9, 1], [11, 1], [12, 3, -5], [11, 1], [9, 1], [7, 2], [6, 1], [4, 1], [2, 2, -10], [null, 1],
  // G P D S' D P · M G R G R S · N R S
  [4, 1, -8], [7, 1], [9, 1], [12, 2], [9, 1], [7, 1], [6, 1], [4, 2], [2, 1], [4, 1], [2, 1], [0, 2, -12], [-1, 1], [2, 1], [0, 4, -12], [null, 2],
  // P M G R · G M P D P · M G R S
  [7, 2, -5], [6, 1], [4, 1], [2, 2], [4, 1], [6, 1], [7, 1], [9, 1], [7, 3, -5], [6, 1], [4, 1], [2, 1], [0, 4, -12], [null, 3],
];

function impulse(c: AudioContext, seconds: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return buf;
}

let hammerNoise: AudioBuffer | null = null;

/** One hammer stroke on a santoor course: three slightly detuned strings, a soft overtone and the tap of the hammer. */
function strike(c: AudioContext, out: AudioNode, freq: number, t: number, velocity = 1) {
  const ring = Math.min(3.2, 900 / freq); // low strings ring longer
  for (const det of [-5, 0, 5]) {
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.value = freq;
    o.detune.value = det + (Math.random() - 0.5) * 2;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.1 * velocity, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ring);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + ring + 0.05);
  }
  const over = c.createOscillator();
  over.frequency.value = freq * 2;
  const og = c.createGain();
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(0.04 * velocity, t + 0.003);
  og.gain.exponentialRampToValueAtTime(0.0001, t + ring * 0.3);
  over.connect(og).connect(out);
  over.start(t);
  over.stop(t + ring * 0.3 + 0.05);
  if (!hammerNoise) {
    hammerNoise = c.createBuffer(1, Math.floor(c.sampleRate * 0.03), c.sampleRate);
    const d = hammerNoise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 4);
  }
  const tap = c.createBufferSource();
  tap.buffer = hammerNoise;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = Math.min(freq * 6, 5000);
  bp.Q.value = 2;
  const tg = c.createGain();
  tg.gain.value = 0.05 * velocity;
  tap.connect(bp).connect(tg).connect(out);
  tap.start(t);
}

const note = (semitones: number) => SA * Math.pow(2, semitones / 12);

function schedule() {
  if (!ctx || !master) return;
  while (nextNote < ctx.currentTime + 0.6) {
    const [s, beats, bass] = TUNE[noteIndex % TUNE.length];
    const t = nextNote;
    if (s !== null) {
      strike(ctx, master, note(s), t);
      // hold long notes with a quiet tremolo that fades away
      if (beats >= 2) for (let k = 2, n = beats * 4 - 2; k < n; k++) strike(ctx, master, note(s), t + (k * BEAT) / 4, 0.32 * (1 - k / n) + 0.08);
    }
    if (bass !== undefined) strike(ctx, master, note(bass), t, 0.7);
    noteIndex++;
    nextNote += beats * BEAT;
  }
}

function playSynth(): boolean {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return false;
  try {
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      const tone = ctx.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.value = 2800;
      const verb = ctx.createConvolver();
      verb.buffer = impulse(ctx, 4.5);
      const wet = ctx.createGain();
      wet.gain.value = 0.55;
      master.connect(tone);
      tone.connect(ctx.destination);
      tone.connect(verb).connect(wet).connect(ctx.destination);
      ctx.onstatechange = () => {
        if (ctx?.state === "running" && wanted && !usingFile) {
          stopWaiting();
          set("on");
        }
      };
    }
    // Phones only allow this inside a real tap. Without one the promise can
    // stay pending forever, so never wait on it: statechange reports success.
    ctx.resume().catch(() => {});
    nextNote = ctx.currentTime + 0.1;
    noteIndex = 0;
    master!.gain.cancelScheduledValues(ctx.currentTime);
    master!.gain.setValueAtTime(master!.gain.value, ctx.currentTime);
    master!.gain.linearRampToValueAtTime(0.13, ctx.currentTime + 3);
    schedule();
    window.clearInterval(scheduler);
    scheduler = window.setInterval(schedule, 200);
    return true;
  } catch {
    return false;
  }
}

function stopSynth() {
  window.clearInterval(scheduler);
  scheduler = 0;
  if (!ctx || !master) return;
  const c = ctx;
  master.gain.cancelScheduledValues(c.currentTime);
  master.gain.setValueAtTime(master.gain.value, c.currentTime);
  master.gain.linearRampToValueAtTime(0, c.currentTime + 0.6);
  window.setTimeout(() => {
    if (state !== "on" && state !== "starting") void c.suspend();
  }, 700);
}

/* ---------------- public API ---------------- */

let usingFile = false;
let fileFailed = false;
/** The guest wants music (not muted), even while the browser still holds it back. */
let wanted = false;

/**
 * iPhones treat web audio like a game sound and silence it when the ringer
 * switch is off. Ask for "playback" (like a video) so the music is heard.
 */
function preferPlayback() {
  const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
  try {
    if (session) session.type = "playback";
  } catch {
    /* older browsers */
  }
}

const MUTED_KEY = "invite-muted";
const remember = (muted: boolean) => {
  try {
    localStorage.setItem(MUTED_KEY, muted ? "1" : "0");
  } catch {
    /* not remembered */
  }
};
const wasMuted = () => {
  try {
    return localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
};

function startSynth() {
  usingFile = false;
  if (!playSynth()) return set("unavailable");
  if (ctx?.state === "running" || tapIsActive()) {
    stopWaiting();
    set("on");
  } else {
    set("off");
    waitForTap();
  }
}

/** False only when the browser can tell this is not inside a tap (so a start would be refused). */
const userActivation = () => (navigator as unknown as { userActivation?: { isActive: boolean } }).userActivation;
const tapAllowsSound = () => !userActivation() || userActivation()!.isActive || ctx?.state === "running";
/** Known to be inside a tap right now (so resume() will succeed). */
const tapIsActive = () => userActivation()?.isActive === true;

export function startSound() {
  remember(false);
  wanted = true;
  if (state === "on") return;
  if (!tapAllowsSound()) {
    set("off");
    return waitForTap();
  }
  preferPlayback();
  if (!wedding.musicUrl || fileFailed) return startSynth();
  set("starting");
  void playFile().then((r) => {
    if (r === "ok" && wanted) {
      usingFile = true;
      stopWaiting();
      set("on");
    } else if (r === "ok") audioEl?.pause();
    else if (r === "blocked") {
      set("off");
      waitForTap();
    } else {
      fileFailed = true;
      startSynth();
    }
  });
}

/* Browsers allow sound only after a real tap or key press (not a swipe, and
   on phones not the moment a finger lands). Until one happens, every tap
   anywhere tries again. */
const TAP_EVENTS = ["pointerup", "touchend", "click", "keydown"];
let waiting = false;
const onTap = () => {
  if (!wanted || wasMuted()) return stopWaiting();
  startSound();
};
function waitForTap() {
  if (waiting) return;
  waiting = true;
  TAP_EVENTS.forEach((e) => window.addEventListener(e, onTap, true));
}
function stopWaiting() {
  waiting = false;
  TAP_EVENTS.forEach((e) => window.removeEventListener(e, onTap, true));
}

/**
 * Music on by default: starts now if the browser allows it, otherwise on the
 * guest's first tap anywhere. Skipped for guests who muted it before.
 */
export function autoStartSound() {
  if (wasMuted() || state === "on") return;
  startSound();
}

export function stopSound() {
  remember(true);
  wanted = false;
  stopWaiting();
  if (usingFile) audioEl?.pause();
  else stopSynth();
  set("off");
}

export function toggleSound() {
  return state === "on" ? stopSound() : startSound();
}

// Pause while the tab is hidden; resume only if it was playing.
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (state !== "on") return;
    if (document.visibilityState === "hidden") {
      if (usingFile) audioEl?.pause();
      else void ctx?.suspend();
    } else if (usingFile) void audioEl?.play();
    else void ctx?.resume();
  });
}
