/**
 * Three illustrated frames for the Banaras sequence:
 *  1. the ghats at dusk — stone steps, temple shikharas, bamboo umbrellas, lamps;
 *  2. floating diyas and their reflections on the dark river;
 *  3. a still life of Banarasi brocade, a brass kalash and marigold garlands.
 * Banaras is visual inspiration only; the wedding is in Prayagraj.
 */
import { LayerSvg, SceneLayers, type SceneLayer } from "./SceneLayers";
import { rng, range } from "../../lib/random";

const RIVER = 790;
const STEP_TOP = 545;

/* ------------------------------------------------------------ 1 · Ghats */

function DuskSky() {
  return (
    <LayerSvg>
      <defs>
        <linearGradient id="gh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f141b" />
          <stop offset="0.3" stopColor="#3d1a24" />
          <stop offset="0.52" stopColor="#7a3027" />
          <stop offset="0.6" stopColor="#b4612f" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#gh-sky)" />
      <circle cx="1320" cy="140" r="2.2" fill="#f7e7c2" />
      <circle cx="380" cy="90" r="1.4" fill="#f7e7c2" opacity="0.7" />
    </LayerSvg>
  );
}

function shikhara(cx: number, base: number, w: number, h: number) {
  return `M${cx - w / 2} ${base} C${cx - w / 2} ${base - h * 0.62} ${cx - w * 0.2} ${base - h * 0.93} ${cx} ${base - h} C${cx + w * 0.2} ${base - h * 0.93} ${cx + w / 2} ${base - h * 0.62} ${cx + w / 2} ${base}Z`;
}

function Ghats() {
  const r = rng(41);
  const buildings: { x: number; w: number; h: number; tone: string }[] = [];
  for (let x = -20; x < 1620; ) {
    const w = range(r, 50, 130);
    buildings.push({ x, w, h: range(r, 90, 250), tone: ["#2b1a1d", "#33201f", "#3b2522", "#28171b"][Math.floor(r() * 4)] });
    x += w - 2;
  }
  const temples = [
    { cx: 300, w: 90, h: 330 },
    { cx: 860, w: 120, h: 400 },
    { cx: 1260, w: 80, h: 300 },
  ];
  const windows: { x: number; y: number; lit: boolean }[] = [];
  buildings.forEach((b) => {
    for (let y = STEP_TOP - b.h + 24; y < STEP_TOP - 24; y += 34) {
      for (let x = b.x + 12; x < b.x + b.w - 16; x += 26) {
        if (r() < 0.75) windows.push({ x, y, lit: r() < 0.3 });
      }
    }
  });
  const steps = Array.from({ length: 22 }, (_, i) => {
    const y = STEP_TOP + (i * (RIVER - STEP_TOP)) / 22;
    return { y, h: (RIVER - STEP_TOP) / 22, tone: i % 2 ? "#5a3a2c" : "#6b4733" };
  });
  const umbrellas = [140, 420, 640, 1030, 1180, 1440].map((x, i) => ({ x, y: 690 + (i % 2) * 26, s: 0.9 + (i % 3) * 0.12 }));
  const lamps = [520, 760, 980];

  // reflected lights are computed here so they stay aligned with their sources
  const reflections = [
    ...windows.filter((w) => w.lit && r() < 0.5).map((w) => ({ x: w.x + 5, o: 0.25 })),
    ...lamps.map((x) => ({ x, o: 0.7 })),
  ];

  return (
    <LayerSvg>
      <defs>
        <linearGradient id="gh-river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a2026" />
          <stop offset="1" stopColor="#150d10" />
        </linearGradient>
        <radialGradient id="gh-lamp">
          <stop offset="0" stopColor="#ffe3a0" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#f2a541" stopOpacity="0.45" />
          <stop offset="1" stopColor="#f2a541" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gh-streak" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6b85a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f6b85a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {temples.map((t, i) => (
        <g key={i} fill="#24161a">
          <path d={shikhara(t.cx, STEP_TOP - 120, t.w, t.h - 120)} />
          <ellipse cx={t.cx} cy={STEP_TOP - t.h + 4} rx={t.w * 0.16} ry={6} />
          <line x1={t.cx} y1={STEP_TOP - t.h} x2={t.cx} y2={STEP_TOP - t.h - 26} stroke="#c8a45d" strokeWidth="2" />
          <path d={`M${t.cx} ${STEP_TOP - t.h - 26} l16 6 l-16 6z`} fill="#b64032" />
        </g>
      ))}

      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={STEP_TOP - b.h} width={b.w} height={b.h} fill={b.tone} />
          {i % 4 === 1 && (
            <path d={`M${b.x + b.w / 2 - 22} ${STEP_TOP - b.h} a22 22 0 0 1 44 0Z`} fill={b.tone} />
          )}
          <rect x={b.x} y={STEP_TOP - b.h} width={b.w} height="3" fill="#c9773d" opacity="0.35" />
        </g>
      ))}
      {windows.map((w, i) => (
        <rect key={i} x={w.x} y={w.y} width="10" height="15" rx="5" ry="5" fill={w.lit ? "#f4b45a" : "#1a1013"} opacity={w.lit ? 0.92 : 0.7} />
      ))}

      {steps.map((s, i) => (
        <rect key={i} x="0" y={s.y} width="1600" height={s.h + 0.5} fill={s.tone} />
      ))}
      <rect x="0" y={STEP_TOP} width="1600" height={RIVER - STEP_TOP} fill="#1b0e10" opacity="0.38" />

      {umbrellas.map((u, i) => (
        <g key={i} transform={`translate(${u.x} ${u.y}) scale(${u.s})`}>
          <line x1="0" y1="-56" x2="0" y2="22" stroke="#2a1a14" strokeWidth="3" />
          <path d="M-58 -46 Q0 -86 58 -46 Q0 -56 -58 -46Z" fill="#8a3b2c" />
          <path d="M-58 -46 Q0 -56 58 -46" stroke="#c8a45d" strokeWidth="1.2" fill="none" opacity="0.6" />
          <rect x="-40" y="16" width="80" height="10" fill="#4a2f22" />
        </g>
      ))}

      {lamps.map((x) => (
        <g key={x}>
          <circle cx={x} cy={705} r="90" fill="url(#gh-lamp)" className="flicker" />
          <rect x={x - 3} y={715} width="6" height="60" fill="#8d6a2c" />
          <path d={`M${x - 16} 712 h32 l-6 8 h-20z`} fill="#c8a45d" />
          <path d={`M${x} 684 C${x + 8} 696 ${x + 7} 708 ${x} 712 C${x - 7} 708 ${x - 8} 696 ${x} 684Z`} fill="#ffd27a" />
        </g>
      ))}

      <rect x="0" y={RIVER} width="1600" height={1000 - RIVER} fill="url(#gh-river)" />
      {reflections.map((f, i) => (
        <g key={i} opacity={f.o}>
          {Array.from({ length: 9 }, (_, k) => (
            <rect key={k} x={f.x - 3 - k * 0.8 + ((k * 7) % 5)} y={RIVER + 8 + k * 22} width={6 + k * 1.6} height="3" rx="1.5" fill="url(#gh-streak)" opacity={1 - k / 9} />
          ))}
        </g>
      ))}
    </LayerSvg>
  );
}

function FloatingLamps() {
  const r = rng(77);
  const lamps = Array.from({ length: 24 }, () => {
    const t = r();
    return { x: range(r, 0, 1600), y: RIVER + 20 + t * t * 180, s: 0.4 + t * 0.9 };
  });
  return (
    <LayerSvg>
      <defs>
        <radialGradient id="gh-dot">
          <stop offset="0" stopColor="#ffe7a8" />
          <stop offset="0.25" stopColor="#f6a943" stopOpacity="0.6" />
          <stop offset="1" stopColor="#f6a943" stopOpacity="0" />
        </radialGradient>
      </defs>
      {lamps.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) scale(${l.s})`}>
          <circle r="30" fill="url(#gh-dot)" />
          <path d="M-12 2 Q0 10 12 2 L9 -1 Q0 3 -9 -1Z" fill="#6b4a2a" />
          <ellipse cy="14" rx="10" ry="2" fill="#f6b85a" opacity="0.4" />
        </g>
      ))}
    </LayerSvg>
  );
}

function BoatForeground() {
  return (
    <LayerSvg>
      <path d="M-40 1000 V930 Q240 900 520 905 Q620 906 700 880 L690 925 Q560 990 380 1000Z" fill="#120b0c" />
      <path d="M-40 932 Q240 902 520 907 Q620 908 700 882" stroke="#c8a45d" strokeWidth="2" fill="none" opacity="0.45" />
    </LayerSvg>
  );
}

const ghatLayers: SceneLayer[] = [
  { depth: 0, node: <DuskSky /> },
  { depth: 0.12, node: <Ghats /> },
  { depth: 0.45, node: <FloatingLamps /> },
  { depth: 1, node: <BoatForeground /> },
];

export function GhatsScene({ className }: { className?: string }) {
  return (
    <SceneLayers
      className={className}
      layers={ghatLayers}
      label="Illustration of the riverside ghats of Banaras at dusk: stone steps, temple spires, bamboo umbrellas and glowing lamps reflected in the Ganga."
    />
  );
}

/* ------------------------------------------------------- 2 · Diyas */

function DiyaWater() {
  const r = rng(303);
  const diyas = Array.from({ length: 34 }, () => {
    const t = Math.pow(r(), 1.6);
    return { x: range(r, -40, 1640), y: 380 + t * 600, s: 0.35 + t * 1.6, rot: range(r, -8, 8) };
  }).sort((a, b) => a.y - b.y);
  const petals = Array.from({ length: 40 }, () => {
    const t = r();
    return { x: range(r, 0, 1600), y: 420 + t * 560, s: 0.4 + t * 1.1, a: range(r, 0, 360) };
  });
  return (
    <LayerSvg>
      <defs>
        <linearGradient id="dw-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f0a0c" />
          <stop offset="0.4" stopColor="#2a141a" />
          <stop offset="1" stopColor="#3d1a20" />
        </linearGradient>
        <radialGradient id="dw-glow">
          <stop offset="0" stopColor="#ffe2a0" stopOpacity="0.9" />
          <stop offset="0.3" stopColor="#f29a3a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f29a3a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dw-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff7d8" />
          <stop offset="0.5" stopColor="#ffc457" />
          <stop offset="1" stopColor="#e2672a" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#dw-water)" />
      {petals.map((p, i) => (
        <ellipse key={i} cx={p.x} cy={p.y} rx={4 * p.s} ry={2.2 * p.s} transform={`rotate(${p.a} ${p.x} ${p.y})`} fill="#e98a1f" opacity="0.7" />
      ))}
      {diyas.map((d, i) => (
        <g key={i} transform={`translate(${d.x} ${d.y}) scale(${d.s}) rotate(${d.rot})`}>
          <circle r="70" fill="url(#dw-glow)" />
          {/* reflection */}
          <path d="M0 16 C6 30 5 48 0 60 C-5 48 -6 30 0 16Z" fill="#f6b85a" opacity="0.35" />
          {/* leaf bowl (dona) */}
          <path d="M-30 0 Q0 22 30 0 L24 -4 Q0 6 -24 -4Z" fill="#4c6b3a" />
          <path d="M-24 -4 Q0 6 24 -4" stroke="#a5c38a" strokeWidth="1" fill="none" opacity="0.6" />
          <circle cx="-14" cy="-3" r="5" fill="#e98a1f" />
          <circle cx="15" cy="-3" r="5" fill="#f2a22c" />
          <path className="diya-flame" d="M0 -34 C7 -22 7 -12 0 -6 C-7 -12 -7 -22 0 -34Z" fill="url(#dw-flame)" />
        </g>
      ))}
    </LayerSvg>
  );
}

const diyaLayers: SceneLayer[] = [{ depth: 0.2, node: <DiyaWater /> }];

export function DiyaWaterScene({ className }: { className?: string }) {
  return (
    <SceneLayers
      className={className}
      layers={diyaLayers}
      label="Illustration of leaf-bowl diyas with marigolds floating on the dark river, their flames reflected in the water."
    />
  );
}

/* ---------------------------------------------- 3 · Brocade still life */

function BrocadeStill() {
  const garland = (y0: number, sag: number, count: number, s: number) =>
    Array.from({ length: count }, (_, i) => {
      const t = i / (count - 1);
      const x = -40 + t * 1680;
      const y = y0 + Math.sin(t * Math.PI) * sag;
      return { x, y, s: s * (0.9 + ((i * 37) % 10) / 50) };
    });
  return (
    <LayerSvg align="xMidYMid">
      <defs>
        <pattern id="bs-jaal" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="#6a1a25" />
          <path d="M0 40 L40 0 L80 40 L40 80Z" fill="none" stroke="#c8a45d" strokeWidth="0.8" opacity="0.45" />
          <g transform="translate(40 40)" fill="#c8a45d" opacity="0.85">
            <path d="M0 -14 C5 -8 5 -3 0 0 C-5 -3 -5 -8 0 -14Z" />
            <path d="M0 14 C5 8 5 3 0 0 C-5 3 -5 8 0 14Z" />
            <path d="M-14 0 C-8 5 -3 5 0 0 C-3 -5 -8 -5 -14 0Z" />
            <path d="M14 0 C8 5 3 5 0 0 C3 -5 8 -5 14 0Z" />
            <circle r="2.4" fill="#e7d4a3" />
          </g>
          <circle cx="0" cy="0" r="2" fill="#e7d4a3" opacity="0.7" />
          <circle cx="80" cy="80" r="2" fill="#e7d4a3" opacity="0.7" />
        </pattern>
        {/* lightweight marigold: dashed rings read as ruffled petals */}
        <g id="bs-mg">
          <circle r="19" fill="#c8661a" />
          <circle r="19" fill="none" stroke="#e07a1a" strokeWidth="10" strokeDasharray="5 2.2" />
          <circle r="12" fill="none" stroke="#f29f2b" strokeWidth="9" strokeDasharray="4 2" />
          <circle r="5" fill="none" stroke="#f7b443" strokeWidth="7" strokeDasharray="3 1.6" />
        </g>
        <linearGradient id="bs-shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1e0c10" stopOpacity="0.75" />
          <stop offset="0.45" stopColor="#1e0c10" stopOpacity="0" />
          <stop offset="1" stopColor="#1e0c10" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="bs-brass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a5520" />
          <stop offset="0.35" stopColor="#e2bd6a" />
          <stop offset="0.55" stopColor="#f7e2a4" />
          <stop offset="1" stopColor="#8a6024" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#bs-jaal)" />
      {/* silk fold highlights */}
      {[180, 520, 1080, 1420].map((x, i) => (
        <path key={x} d={`M${x} 0 C${x + 60} 300 ${x - 40} 700 ${x + 30} 1000`} stroke="#f2c9a0" strokeWidth={i % 2 ? 60 : 90} fill="none" opacity="0.06" />
      ))}
      <rect width="1600" height="1000" fill="url(#bs-shade)" />
      {/* zari border along the bottom */}
      <rect x="0" y="880" width="1600" height="120" fill="#4e1219" />
      <rect x="0" y="884" width="1600" height="3" fill="#c8a45d" />
      <rect x="0" y="900" width="1600" height="1.5" fill="#c8a45d" opacity="0.6" />
      {Array.from({ length: 40 }, (_, i) => (
        <path key={i} d={`M${i * 40 + 20} 912 l12 22 l-12 22 l-12 -22z`} fill="none" stroke="#c8a45d" strokeWidth="1.2" opacity="0.7" />
      ))}

      {/* brass kalash with mango leaves and coconut */}
      <g transform="translate(1090 560)">
        <ellipse cx="0" cy="318" rx="150" ry="20" fill="#120708" opacity="0.5" />
        {[-70, -40, -12, 16, 44, 72].map((a, i) => (
          <path key={i} transform={`rotate(${a} 0 40)`} d="M0 40 C26 0 22 -70 0 -120 C-22 -70 -26 0 0 40Z" fill={i % 2 ? "#2f5a3a" : "#3b6b45"} />
        ))}
        <ellipse cx="0" cy="-20" rx="56" ry="66" fill="#7a4a24" />
        <path d="M-40 -60 Q0 -96 40 -60" stroke="#a87b4a" strokeWidth="3" fill="none" opacity="0.6" />
        <path d="M-70 40 H70 L60 70 H-60Z" fill="url(#bs-brass)" />
        <path d="M-60 70 C-170 110 -170 300 -40 316 H40 C170 300 170 110 60 70Z" fill="url(#bs-brass)" />
        <path d="M-120 170 Q0 200 120 170" stroke="#7a5520" strokeWidth="3" fill="none" opacity="0.6" />
        <path d="M-126 196 Q0 226 126 196" stroke="#f7e2a4" strokeWidth="2" fill="none" opacity="0.5" />
        <circle cx="0" cy="240" r="16" fill="none" stroke="#b64032" strokeWidth="4" />
        <path d="M0 226 V254 M-14 240 H14" stroke="#b64032" strokeWidth="4" />
      </g>

      {/* marigold garlands */}
      {[
        ...garland(120, 120, 34, 0.95),
        ...garland(60, 200, 40, 0.8),
      ].map((m, i) => (
        <g key={i} transform={`translate(${m.x} ${m.y}) scale(${m.s})`}>
          <use href="#bs-mg" />
        </g>
      ))}
    </LayerSvg>
  );
}

const brocadeLayers: SceneLayer[] = [{ depth: 0.2, node: <BrocadeStill /> }];

export function BrocadeScene({ className }: { className?: string }) {
  return (
    <SceneLayers
      className={className}
      layers={brocadeLayers}
      label="Illustration of crimson Banarasi brocade with gold zari motifs, a brass kalash crowned with mango leaves and a coconut, and garlands of marigolds."
    />
  );
}
