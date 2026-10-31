/**
 * Optional ambient sound. Off by default and only started by a click.
 *
 * If `wedding.musicUrl` points at a licensed audio file it is played on loop.
 * Otherwise (or if the file fails to load) the page synthesises a calm
 * ambience in the browser: a warm Sa–Pa pad that slowly breathes, a gentle
 * tanpura under it and a distant temple bell every so often. Original, so
 * there are no copyright questions and no asset that can go missing.
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

async function playFile(): Promise<boolean> {
  if (!wedding.musicUrl) return false;
  try {
    audioEl ??= Object.assign(new Audio(/^https?:/.test(wedding.musicUrl) ? wedding.musicUrl : publicUrl(wedding.musicUrl)), {
      loop: true,
      volume: 0.5,
      preload: "auto",
    });
    await audioEl.play();
    return true;
  } catch {
    audioEl = null;
    return false;
  }
}

/* ---------------- synthesised tanpura ---------------- */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let scheduler = 0;
let nextPluck = 0;
let pluckIndex = 0;

const SA = 146.83; // D3
// The classic tuning: Pa, Sa', Sa', Sa (low)
const STRINGS = [SA * 0.75, SA, SA, SA / 2];
const GAP = 1.6;
const CYCLE_PAUSE = 1.4;

function impulse(c: AudioContext, seconds: number) {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return buf;
}

function pluck(c: AudioContext, out: AudioNode, freq: number, t: number) {
  const osc = c.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = freq;
  osc.detune.value = (Math.random() - 0.5) * 6;
  // the "jawari" shimmer: a resonant band sweeping down through the harmonics
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 6;
  bp.frequency.setValueAtTime(freq * 8, t);
  bp.frequency.exponentialRampToValueAtTime(freq * 2.5, t + 4.5);
  const body = c.createBiquadFilter();
  body.type = "lowpass";
  body.frequency.value = freq * 4;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.32, t + 0.12);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 6);
  osc.connect(bp).connect(g);
  osc.connect(body).connect(g);
  g.connect(out);
  osc.start(t);
  osc.stop(t + 6.1);
}

/** A warm, slowly breathing Sa–Pa–Sa' pad that sits under everything. */
function startPad(c: AudioContext, out: AudioNode) {
  const pad = c.createGain();
  pad.gain.value = 0.22;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  pad.connect(lp).connect(out);
  // breathing: a very slow swell in and out
  const lfo = c.createOscillator();
  const depth = c.createGain();
  lfo.frequency.value = 0.07;
  depth.gain.value = 0.08;
  lfo.connect(depth).connect(pad.gain);
  lfo.start();
  for (const [f, level] of [[SA / 2, 0.5], [SA * 0.75, 0.25], [SA, 0.3], [SA * 1.5, 0.08]] as const) {
    for (const det of [-4, 4]) {
      const o = c.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      o.detune.value = det;
      const g = c.createGain();
      g.gain.value = level;
      o.connect(g).connect(pad);
      o.start();
    }
  }
}

/** A small temple bell far away: inharmonic partials with a long, soft decay. */
function bell(c: AudioContext, out: AudioNode, t: number) {
  const base = SA * 4;
  for (const [ratio, level, decay] of [[1, 0.09, 7], [2.76, 0.04, 4], [5.4, 0.02, 2.5], [8.93, 0.01, 1.5]] as const) {
    const o = c.createOscillator();
    o.type = "sine";
    o.frequency.value = base * ratio;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + decay + 0.1);
  }
}

let nextBell = 0;
let padStarted = false;

function schedule() {
  if (!ctx || !master) return;
  while (nextPluck < ctx.currentTime + 0.6) {
    pluck(ctx, master, STRINGS[pluckIndex % 4], nextPluck);
    pluckIndex++;
    nextPluck += pluckIndex % 4 === 0 ? GAP + CYCLE_PAUSE : GAP;
  }
  if (nextBell < ctx.currentTime + 0.6) {
    bell(ctx, master, Math.max(nextBell, ctx.currentTime + 0.05));
    nextBell = ctx.currentTime + 11 + Math.random() * 8;
  }
}

async function playSynth(): Promise<boolean> {
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
    }
    await ctx.resume();
    nextPluck = ctx.currentTime + 0.1;
    nextBell = ctx.currentTime + 3;
    if (!padStarted) {
      startPad(ctx, master!);
      padStarted = true;
    }
    master!.gain.cancelScheduledValues(ctx.currentTime);
    master!.gain.setValueAtTime(master!.gain.value, ctx.currentTime);
    master!.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 4);
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

export async function startSound() {
  if (state === "on" || state === "starting") return;
  set("starting");
  usingFile = await playFile();
  const ok = usingFile || (await playSynth());
  set(ok ? "on" : "unavailable");
}

export function stopSound() {
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
