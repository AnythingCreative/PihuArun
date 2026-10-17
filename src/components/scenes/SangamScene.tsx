/**
 * Illustrated sunrise at the Triveni Sangam, Prayagraj: the paler, silt-laden
 * Ganga meeting the deeper green Yamuna, pilgrim boats, winter gulls, the long
 * low wall of the fort on the far bank and pilgrims' flags on the sand.
 * Four depth layers for parallax.
 */
import { LayerSvg, SceneLayers, type SceneLayer } from "./SceneLayers";
import { rng, range } from "../../lib/random";

const HORIZON = 620;

function Sky() {
  const r = rng(7);
  return (
    <LayerSvg>
      <defs>
        <linearGradient id="sg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9cdb4" />
          <stop offset="0.38" stopColor="#f2d2a6" />
          <stop offset="0.62" stopColor="#f6c98a" />
          <stop offset="0.7" stopColor="#f3d4a6" />
        </linearGradient>
        <radialGradient id="sg-sun" cx="1060" cy="600" r="520" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff3cf" stopOpacity="1" />
          <stop offset="0.08" stopColor="#ffe3a3" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#f7c27a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f7c27a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#sg-sky)" />
      <rect width="1600" height="1000" fill="url(#sg-sun)" />
      <circle cx="1060" cy="600" r="42" fill="#fff4d4" />
      {/* thin morning clouds */}
      {Array.from({ length: 9 }, (_, i) => (
        <ellipse
          key={i}
          cx={range(r, 0, 1600)}
          cy={range(r, 120, 470)}
          rx={range(r, 120, 320)}
          ry={range(r, 4, 11)}
          fill="#fff7ea"
          opacity={range(r, 0.18, 0.4)}
        />
      ))}
    </LayerSvg>
  );
}

function FarBank() {
  const r = rng(11);
  let trees = `M0 ${HORIZON}`;
  for (let x = 0; x <= 1600; x += 22) {
    trees += ` Q${x + 11} ${HORIZON - range(r, 8, 24)} ${x + 22} ${HORIZON - range(r, 2, 8)}`;
  }
  trees += ` V${HORIZON + 8} H0Z`;
  return (
    <LayerSvg>
      <path d={trees} fill="#b98f73" opacity="0.5" />
      {/* the fort's long wall and round bastions, hazy in the morning light */}
      <g fill="#a87e63" opacity="0.62">
        <rect x="110" y="588" width="560" height="34" />
        {[110, 230, 350, 470, 590, 670].map((x) => (
          <path key={x} d={`M${x - 16} 622 V584 Q${x} 570 ${x + 16} 584 V622Z`} />
        ))}
        {Array.from({ length: 28 }, (_, i) => (
          <rect key={i} x={118 + i * 20} y={582} width={9} height={7} />
        ))}
      </g>
      <rect x="0" y={HORIZON - 4} width="1600" height="12" fill="#f3d6ad" opacity="0.6" />
    </LayerSvg>
  );
}

function Water() {
  const r = rng(23);
  const glints = Array.from({ length: 42 }, (_, i) => {
    const t = i / 42;
    const y = HORIZON + 10 + t * t * 380;
    const w = range(r, 20, 80) + t * 160;
    return { x: 1060 - w / 2 + range(r, -30, 30) * (1 + t * 3), y, w, h: 1.5 + t * 5, o: range(r, 0.35, 0.8) * (1 - t * 0.5) };
  });
  const ripples = Array.from({ length: 70 }, () => {
    const t = r();
    const y = HORIZON + 14 + t * t * 380;
    return { x: range(r, 0, 1600), y, w: 18 + t * 90, o: 0.12 + t * 0.15 };
  });
  return (
    <LayerSvg>
      <defs>
        <linearGradient id="sg-ganga" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecc999" />
          <stop offset="1" stopColor="#b48d64" />
        </linearGradient>
        <linearGradient id="sg-yamuna" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fa998" />
          <stop offset="0.5" stopColor="#5f7a72" />
          <stop offset="1" stopColor="#3b5751" />
        </linearGradient>
        <filter id="sg-soft" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <rect y={HORIZON} width="1600" height={1000 - HORIZON} fill="url(#sg-ganga)" />
      <path d={`M0 ${HORIZON} H700 C600 740 520 860 380 1000 H0Z`} fill="url(#sg-yamuna)" />
      {/* where the two waters meet the colours blur into each other */}
      <path d={`M700 ${HORIZON} C600 740 520 860 380 1000`} stroke="#a7a084" strokeWidth="46" fill="none" opacity="0.55" filter="url(#sg-soft)" />
      {glints.map((g, i) => (
        <rect key={i} x={g.x} y={g.y} width={g.w} height={g.h} rx={g.h / 2} fill="#fff0c6" opacity={g.o} />
      ))}
      {ripples.map((p, i) => (
        <rect key={`r${i}`} x={p.x} y={p.y} width={p.w} height="1.6" rx="0.8" fill="#fff6e0" opacity={p.o} />
      ))}
    </LayerSvg>
  );
}

function Boat({ x, y, s, tone, flip = false }: { x: number; y: number; s: number; tone: string; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      {/* reflection */}
      <g transform="scale(1 -0.55)" opacity="0.18">
        <path d="M-62 -4 Q-48 12 0 12 Q46 12 66 -10 L60 -2 Q0 4 -62 -4Z" fill={tone} />
      </g>
      <path d="M-30 -4 V-20 Q0 -32 30 -20 V-4Z" fill="#c9673a" opacity="0.85" />
      <path d="M-30 -20 Q0 -32 30 -20" stroke={tone} strokeWidth="1.5" fill="none" />
      <path d="M-62 -4 Q-48 12 0 12 Q46 12 66 -10 L60 -2 Q0 4 -62 -4Z" fill={tone} />
      <line x1="-47" y1="-3" x2="-45" y2="-30" stroke={tone} strokeWidth="3" strokeLinecap="round" />
      <circle cx="-45" cy="-35" r="4" fill={tone} />
      <line x1="-40" y1="-25" x2="-74" y2="12" stroke={tone} strokeWidth="1.6" />
    </g>
  );
}

function Boats() {
  const r = rng(5);
  const gulls = Array.from({ length: 26 }, () => ({
    x: range(r, 300, 1500),
    y: range(r, 380, 760),
    s: range(r, 0.5, 1.3),
  }));
  return (
    <LayerSvg>
      <Boat x={1270} y={668} s={0.55} tone="#6a4a39" />
      <Boat x={420} y={700} s={0.75} tone="#5a3d2f" flip />
      <Boat x={880} y={745} s={1.05} tone="#4a3125" />
      <Boat x={1180} y={830} s={1.5} tone="#3e281e" flip />
      <Boat x={190} y={820} s={1.3} tone="#3c271d" />
      <g fill="none" stroke="#4a3328" strokeLinecap="round" strokeWidth="1.6">
        {gulls.map((g, i) => (
          <path key={i} transform={`translate(${g.x} ${g.y}) scale(${g.s})`} d="M-9 0 Q-4.5 -5 0 0 Q4.5 -5 9 0" />
        ))}
      </g>
    </LayerSvg>
  );
}

function Foreground() {
  const flags = [
    { x: 60, top: 470, c: "#e07a1f", shape: "tri" },
    { x: 118, top: 540, c: "#b64032", shape: "rect" },
    { x: 172, top: 600, c: "#f1e2c4", shape: "tri" },
    { x: 1440, top: 500, c: "#b64032", shape: "tri" },
    { x: 1500, top: 440, c: "#e07a1f", shape: "rect" },
    { x: 1556, top: 560, c: "#183f36", shape: "tri" },
  ];
  return (
    <LayerSvg>
      <defs>
        <linearGradient id="sg-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c99d70" />
          <stop offset="1" stopColor="#8d6444" />
        </linearGradient>
      </defs>
      <path d="M0 1000 V905 C140 885 300 915 470 945 C540 958 600 975 640 1000Z" fill="url(#sg-sand)" />
      <path d="M1600 1000 V895 C1480 890 1360 920 1240 958 C1200 972 1170 988 1150 1000Z" fill="url(#sg-sand)" />
      {flags.map((f, i) => (
        <g key={i}>
          <rect x={f.x - 2} y={f.top} width="4" height={1000 - f.top} fill="#5b3f27" />
          {f.shape === "tri" ? (
            <path d={`M${f.x + 2} ${f.top + 4} L${f.x + 62} ${f.top + 22} L${f.x + 2} ${f.top + 44}Z`} fill={f.c} />
          ) : (
            <path d={`M${f.x + 2} ${f.top + 4} H${f.x + 58} Q${f.x + 52} ${f.top + 22} ${f.x + 58} ${f.top + 40} H${f.x + 2}Z`} fill={f.c} />
          )}
          <circle cx={f.x} cy={f.top - 3} r="4" fill="#c8a45d" />
        </g>
      ))}
    </LayerSvg>
  );
}

export const sangamLayers: SceneLayer[] = [
  { depth: 0, node: <Sky /> },
  { depth: 0.12, node: <FarBank /> },
  { depth: 0.12, node: <Water /> },
  { depth: 0.55, node: <Boats /> },
  { depth: 1, node: <Foreground /> },
];

export function SangamScene({ className }: { className?: string }) {
  return (
    <SceneLayers
      className={className}
      layers={sangamLayers}
      label="Illustration of sunrise at the Triveni Sangam in Prayagraj, where the pale Ganga meets the green Yamuna, with pilgrim boats, gulls and pilgrims' flags on the sandbank."
    />
  );
}
