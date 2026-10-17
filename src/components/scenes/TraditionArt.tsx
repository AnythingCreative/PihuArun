/**
 * Hand-drawn-style illustrations for the traditions sequence. Line work is in
 * currentColor; spot colour comes from the natural materials (turmeric, henna,
 * brass, fire, marigold).
 */
import { useId } from "react";
import { Diya, GaneshMotif, Lotus, Mandala } from "../ornaments/Ornaments";

export type TraditionArtKey = "ganesh" | "haldi" | "mehendi" | "mandap" | "pheras";

const base = {
  viewBox: "0 0 300 300",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: "false" as const,
};

function Flames({ x, y, s = 1, id }: { x: number; y: number; s?: number; id: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <linearGradient id={`fl${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a8" />
          <stop offset="0.5" stopColor="#f6a23a" />
          <stop offset="1" stopColor="#b64032" />
        </linearGradient>
      </defs>
      <path className="diya-flame" d="M0 -46 C12 -30 16 -14 8 0 H-8 C-16 -14 -12 -30 0 -46Z" fill={`url(#fl${id})`} stroke="none" />
      <path className="diya-flame" d="M-14 -26 C-8 -18 -6 -8 -8 0 H-18 C-22 -10 -20 -18 -14 -26Z" fill={`url(#fl${id})`} stroke="none" opacity="0.85" />
      <path className="diya-flame" d="M14 -28 C20 -18 22 -8 18 0 H8 C6 -8 8 -18 14 -28Z" fill={`url(#fl${id})`} stroke="none" opacity="0.85" />
    </g>
  );
}

function HavanKund({ x, y, id }: { x: number; y: number; id: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <Flames x={0} y={-14} id={id} />
      <path d="M-34 -14 H34 L28 0 H-28Z" fill="#c8a45d" fillOpacity="0.35" />
      <path d="M-44 0 H44 V10 H-44Z M-52 10 H52 V20 H-52Z" fill="#c8a45d" fillOpacity="0.2" />
    </g>
  );
}

function Ganesh() {
  return (
    <svg {...base}>
      <circle cx="150" cy="140" r="104" stroke="#c8a45d" strokeOpacity="0.6" />
      <circle cx="150" cy="140" r="96" stroke="#c8a45d" strokeOpacity="0.35" strokeDasharray="2 5" />
      <g transform="translate(90 72)">
        <GaneshMotif width="120" height="124" />
      </g>
      <g transform="translate(36 214)">
        <Diya width="62" height="62" />
      </g>
      <g transform="translate(264 214) scale(-1 1)">
        <Diya width="62" height="62" />
      </g>
      <g transform="translate(110 236)" opacity="0.8">
        <Lotus width="80" height="52" />
      </g>
    </svg>
  );
}

function Haldi() {
  const id = useId().replace(/:/g, "");
  return (
    <svg {...base}>
      <defs>
        <radialGradient id={`sun${id}`}>
          <stop offset="0" stopColor="#f6c24a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#f6c24a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`brass${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a6024" />
          <stop offset="0.45" stopColor="#e7c579" />
          <stop offset="1" stopColor="#8a6024" />
        </linearGradient>
      </defs>
      <circle cx="150" cy="150" r="130" fill={`url(#sun${id})`} stroke="none" />
      {[-60, -30, 0, 30, 60].map((a) => (
        <path key={a} transform={`rotate(${a} 150 168)`} d="M150 168 C168 130 166 84 150 54 C134 84 132 130 150 168Z" fill="#3b6b45" fillOpacity="0.9" stroke="#2f5a3a" />
      ))}
      <path d="M62 168 C70 236 230 236 238 168Z" fill={`url(#brass${id})`} stroke="#7a5520" />
      <ellipse cx="150" cy="168" rx="88" ry="16" fill="#e8a21c" stroke="#b97a12" />
      <path d="M100 166 C120 160 130 172 150 166 C170 160 182 172 200 166" stroke="#f7cf5a" strokeWidth="2" />
      <path d="M110 242 H190 L182 252 H118Z" fill="#7a5520" fillOpacity="0.5" stroke="#7a5520" />
      {[70, 230].map((x) => (
        <g key={x} transform={`translate(${x} 250)`} stroke="none">
          <circle r="14" fill="#e07a1a" />
          <circle r="14" fill="none" stroke="#f29f2b" strokeWidth="8" strokeDasharray="4 2" />
          <circle r="4" fill="#c8661a" />
        </g>
      ))}
    </svg>
  );
}

function Mehendi() {
  return (
    <svg {...base} stroke="#7a3b1e">
      <g transform="translate(150 140)" color="#7a3b1e">
        <g transform="translate(-92 -92)">
          <Mandala width="184" height="184" strokeWidth={1.1} />
        </g>
        <circle r="18" fill="#7a3b1e" fillOpacity="0.25" />
      </g>
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          transform={`rotate(${a} 150 140) translate(150 22)`}
          d="M0 0 C10 -4 16 4 12 12 C8 20 -4 20 -6 10 C-8 2 -4 -2 0 0 C4 2 4 8 0 9"
        />
      ))}
      {/* mehendi cone */}
      <g transform="translate(232 214) rotate(32)">
        <path d="M-10 -40 L10 -40 L0 22Z" fill="#c8a45d" fillOpacity="0.5" stroke="#8a6024" />
        <path d="M-10 -40 L10 -40" stroke="#8a6024" strokeWidth="3" />
        <path d="M0 22 L0 30" stroke="#7a3b1e" strokeWidth="2" />
      </g>
      <path d="M60 252 C90 240 120 262 150 250 C180 238 210 262 240 250" strokeDasharray="1 6" strokeWidth="2.4" />
    </svg>
  );
}

function Mandap() {
  const id = useId().replace(/:/g, "");
  return (
    <svg {...base}>
      {/* canopy */}
      <path d="M40 92 L150 34 L260 92Z" fill="#b64032" fillOpacity="0.12" />
      <path d="M40 92 L150 34 L260 92" />
      <path d="M150 34 V20" />
      <circle cx="150" cy="16" r="4" fill="#c8a45d" stroke="none" />
      <path d="M36 92 H264 M36 100 H264" />
      {/* pillars */}
      {[54, 246].map((x) => (
        <g key={x}>
          <path d={`M${x - 6} 100 V256 M${x + 6} 100 V256`} />
          <path d={`M${x - 12} 256 H${x + 12} V266 H${x - 12}Z`} />
          <path d={`M${x - 10} 112 H${x + 10} M${x - 10} 240 H${x + 10}`} />
        </g>
      ))}
      {[104, 196].map((x) => (
        <path key={x} d={`M${x} 100 V234`} opacity="0.4" />
      ))}
      {/* drapes and marigold strings */}
      <path d="M60 104 C100 150 200 150 240 104" stroke="#c8a45d" />
      <path d="M60 104 C70 130 70 160 64 190" stroke="#b64032" strokeOpacity="0.6" />
      <path d="M240 104 C230 130 230 160 236 190" stroke="#b64032" strokeOpacity="0.6" />
      {Array.from({ length: 13 }, (_, i) => {
        const x = 70 + i * 13.3;
        return (
          <g key={i}>
            <line x1={x} y1="102" x2={x} y2={118 + (i % 2) * 8} strokeWidth="0.8" />
            <circle cx={x} cy={122 + (i % 2) * 8} r="4" fill={i % 2 ? "#f2a22c" : "#e07a1a"} stroke="none" />
          </g>
        );
      })}
      <HavanKund x={150} y={232} id={id} />
      <path d="M30 266 H270" />
      <path d="M44 276 H256" opacity="0.5" />
    </svg>
  );
}

function Pheras() {
  const id = useId().replace(/:/g, "");
  const steps = Array.from({ length: 7 }, (_, i) => {
    const a = Math.PI + (i / 6) * Math.PI;
    return { x: 150 + Math.cos(a) * 112, y: 196 + Math.sin(a) * 74, n: i + 1 };
  });
  return (
    <svg {...base}>
      <ellipse cx="150" cy="196" rx="112" ry="74" strokeDasharray="2 6" stroke="#c8a45d" strokeWidth="1.6" />
      <path d="M262 196 l-6 -10 m6 10 l6 -10" stroke="#c8a45d" />
      <HavanKund x={150} y={214} id={id} />
      {steps.map((s) => (
        <g key={s.n}>
          <circle cx={s.x} cy={s.y} r="13" fill="#f7f1e7" />
          <text x={s.x} y={s.y + 4.5} textAnchor="middle" fontFamily="var(--font-display)" fontSize="14" fill="currentColor" stroke="none">
            {s.n}
          </text>
        </g>
      ))}
      {/* gathbandhan: the knotted cloth that ties the couple */}
      <path d="M96 66 C120 56 136 76 150 66 C164 56 180 76 204 66" stroke="#b64032" strokeWidth="3" />
      <path d="M144 62 C140 70 146 78 150 72 C154 78 160 70 156 62 C152 58 148 58 144 62Z" fill="#b64032" stroke="#b64032" />
      <path d="M150 74 L144 98 M150 74 L156 98" stroke="#b64032" strokeWidth="2" />
    </svg>
  );
}

export function TraditionArt({ kind }: { kind: TraditionArtKey }) {
  switch (kind) {
    case "ganesh":
      return <Ganesh />;
    case "haldi":
      return <Haldi />;
    case "mehendi":
      return <Mehendi />;
    case "mandap":
      return <Mandap />;
    case "pheras":
      return <Pheras />;
  }
}
