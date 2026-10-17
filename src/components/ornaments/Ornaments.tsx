/**
 * Reusable ornament library: lotus, mandala, marigold, diya, toran, temple
 * arch, Ganesh line art, dividers. All are lightweight inline SVG drawn in
 * `currentColor` (unless they carry their own natural colour) so they pick up
 * the palette of whichever section they sit in.
 *
 * Every line-art path carries pathLength="1" so motion code can "draw" it by
 * animating stroke-dashoffset from 1 to 0.
 */
import { useId, type SVGProps } from "react";

type SvgProps = SVGProps<SVGSVGElement> & { title?: string };

function A11y({ title }: { title?: string }) {
  return title ? <title>{title}</title> : null;
}
const decorative = (title?: string) =>
  title ? { role: "img" as const } : { "aria-hidden": true as const, focusable: "false" as const };

/* ---------------------------------------------------------------- Lotus */

export function Lotus({ title, strokeWidth = 1.1, ...p }: SvgProps & { strokeWidth?: number }) {
  const petals = [
    { a: 0, s: 1 },
    { a: -24, s: 0.92 },
    { a: 24, s: 0.92 },
    { a: -50, s: 0.78 },
    { a: 50, s: 0.78 },
    { a: -74, s: 0.6 },
    { a: 74, s: 0.6 },
  ];
  return (
    <svg viewBox="0 0 200 130" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...decorative(title)} {...p}>
      <A11y title={title} />
      <g>
        {petals
          .slice()
          .reverse()
          .map(({ a, s }, i) => (
            <g key={i} transform={`rotate(${a} 100 108) translate(100 108) scale(${s}) translate(-100 -108)`}>
              <path pathLength={1} d="M100 18 C116 42 118 80 100 108 C82 80 84 42 100 18Z" fill="var(--lotus-fill, none)" />
              <path pathLength={1} d="M100 34 C106 54 106 80 100 100" opacity="0.55" />
            </g>
          ))}
      </g>
      <path pathLength={1} d="M38 112 C70 104 130 104 162 112" />
      <path pathLength={1} d="M58 121 C82 116 118 116 142 121" opacity="0.6" />
      <circle cx="100" cy="11" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

/* -------------------------------------------------------------- Mandala */

function leaf(r1: number, r2: number, w: number) {
  const m = r1 + (r2 - r1) * 0.42;
  return `M0 ${-r1} C${w} ${-m} ${w * 0.55} ${-(r2 - (r2 - r1) * 0.12)} 0 ${-r2} C${-w * 0.55} ${-(r2 - (r2 - r1) * 0.12)} ${-w} ${-m} 0 ${-r1}Z`;
}

const MANDALA_RINGS = [
  { r1: 14, r2: 34, w: 9, n: 8 },
  { r1: 38, r2: 62, w: 10, n: 16 },
  { r1: 66, r2: 92, w: 9, n: 24 },
  { r1: 98, r2: 128, w: 11, n: 32 },
  { r1: 134, r2: 150, w: 5, n: 48 },
];

export function Mandala({ title, strokeWidth = 0.7, ...p }: SvgProps & { strokeWidth?: number }) {
  return (
    <svg viewBox="-160 -160 320 320" fill="none" stroke="currentColor" strokeWidth={strokeWidth} {...decorative(title)} {...p}>
      <A11y title={title} />
      {[10, 36, 64, 95, 131, 153].map((r) => (
        <circle key={r} r={r} pathLength={1} opacity={r === 153 ? 0.6 : 1} />
      ))}
      {MANDALA_RINGS.map((ring, ri) => (
        <g key={ri}>
          {Array.from({ length: ring.n }, (_, i) => (
            <path
              key={i}
              pathLength={1}
              d={leaf(ring.r1, ring.r2, ring.w)}
              transform={`rotate(${(360 / ring.n) * i + (ri % 2 ? 180 / ring.n : 0)})`}
            />
          ))}
        </g>
      ))}
      {Array.from({ length: 64 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 64;
        return <circle key={i} cx={Math.cos(a) * 157} cy={Math.sin(a) * 157} r={0.9} fill="currentColor" stroke="none" />;
      })}
    </svg>
  );
}

/* ------------------------------------------------------------- Marigold */

const MARIGOLD_RINGS = [
  { r: 25, n: 20, rx: 6.4, ry: 10, c: "#d9741a" },
  { r: 19, n: 17, rx: 6, ry: 9, c: "#e98a1f" },
  { r: 12.5, n: 13, rx: 5.4, ry: 7.6, c: "#f29f2b" },
  { r: 6, n: 9, rx: 4.4, ry: 6, c: "#f7b443" },
];

/** A genda (marigold) bloom in its natural colours. */
export function Marigold({ title, ...p }: SvgProps) {
  return (
    <svg viewBox="-36 -36 72 72" {...decorative(title)} {...p}>
      <A11y title={title} />
      {MARIGOLD_RINGS.map((ring, ri) => (
        <g key={ri}>
          {Array.from({ length: ring.n }, (_, i) => (
            <ellipse
              key={i}
              cx={0}
              cy={-ring.r}
              rx={ring.rx}
              ry={ring.ry}
              fill={ring.c}
              stroke="#a8500f"
              strokeOpacity={0.35}
              strokeWidth={0.5}
              transform={`rotate(${(360 / ring.n) * i + ri * 7})`}
            />
          ))}
        </g>
      ))}
      <circle r="3.2" fill="#c8661a" />
    </svg>
  );
}

/** A single loose marigold petal, for drifting accents. */
export function MarigoldPetal(p: SvgProps) {
  return (
    <svg viewBox="0 0 20 28" aria-hidden focusable="false" {...p}>
      <path d="M10 1 C17 6 19 16 15 23 C13 27 7 27 5 23 C1 16 3 6 10 1Z" fill="#e98a1f" />
      <path d="M10 4 C13 10 13 18 10 25" stroke="#c0661a" strokeWidth="0.7" fill="none" opacity="0.6" />
    </svg>
  );
}

/* ----------------------------------------------------------------- Diya */

export function Diya({ title, lit = true, ...p }: SvgProps & { lit?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" {...decorative(title)} {...p}>
      <A11y title={title} />
      <defs>
        <radialGradient id={`g${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.9" />
          <stop offset="0.4" stopColor="#f2a541" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f2a541" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`f${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6d6" />
          <stop offset="0.45" stopColor="#ffc457" />
          <stop offset="1" stopColor="#e2672a" />
        </linearGradient>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c98a3e" />
          <stop offset="1" stopColor="#7a4a1f" />
        </linearGradient>
      </defs>
      {lit && <circle className="diya-glow" cx="74" cy="44" r="34" fill={`url(#g${id})`} />}
      <path d="M10 62 C18 82 60 86 82 66 L95 58 C78 56 44 53 10 62Z" fill={`url(#b${id})`} />
      <path d="M12 62 C40 57 70 57 93 58" stroke="#e7d4a3" strokeOpacity="0.55" strokeWidth="1.2" fill="none" />
      <path d="M30 76 C40 80 56 80 66 76" stroke="#3a220f" strokeOpacity="0.4" strokeWidth="1" fill="none" />
      {lit && (
        <path className="diya-flame" d="M82 22 C90 36 91 49 82 55 C73 49 74 36 82 22Z" fill={`url(#f${id})`} />
      )}
    </svg>
  );
}

/* ---------------------------------------------------------------- Toran */

/** A horizontal string of mango leaves and marigolds. Repeats to any width. */
export function Toran({ className, height = 56 }: { className?: string; height?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} width="100%" height={height} aria-hidden focusable="false">
      <defs>
        <pattern id={`t${id}`} width="64" height="56" patternUnits="userSpaceOnUse">
          <path d="M0 6 Q32 14 64 6" stroke="#8a5a1e" strokeWidth="1.2" fill="none" />
          {/* mango leaf */}
          <path d="M16 10 C24 20 22 38 16 48 C10 38 8 20 16 10Z" fill="#2f5a3a" />
          <path d="M16 12 L16 46" stroke="#a5c38a" strokeWidth="0.6" opacity="0.7" />
          {/* marigold bead string */}
          <line x1="48" y1="10" x2="48" y2="30" stroke="#8a5a1e" strokeWidth="0.8" />
          <circle cx="48" cy="22" r="5.5" fill="#e98a1f" />
          <circle cx="48" cy="33" r="6.5" fill="#f2a22c" />
          <circle cx="48" cy="33" r="2" fill="#c8661a" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#t${id})`} />
    </svg>
  );
}

/* ---------------------------------------------------------- Temple arch */

/** Cusped (multifoil) arch outline; stretches to its box. */
export function TempleArch({ className, strokeWidth = 1 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} viewBox="0 0 100 140" preserveAspectRatio="none" fill="none" stroke="currentColor" aria-hidden focusable="false">
      <path
        pathLength={1}
        vectorEffect="non-scaling-stroke"
        strokeWidth={strokeWidth}
        d="M2 140 V52 C2 46 6 44 8 40 C8 32 14 28 18 27 C20 18 28 13 34 13 C38 6 44 3 50 1 C56 3 62 6 66 13 C72 13 80 18 82 27 C86 28 92 32 92 40 C94 44 98 46 98 52 V140"
      />
      <path
        pathLength={1}
        vectorEffect="non-scaling-stroke"
        strokeWidth={strokeWidth}
        opacity="0.55"
        d="M7 140 V55 C7 50 10 48 12 45 C12 38 17 34 21 33 C23 25 30 20 36 20 C40 13 45 10 50 8 C55 10 60 13 64 20 C70 20 77 25 79 33 C83 34 88 38 88 45 C90 48 93 50 93 55 V140"
      />
    </svg>
  );
}

/* --------------------------------------------------- Ganesh line motif */

/** A restrained, Ganesh-inspired line motif: mukut, ears, trunk and modak. */
export function GaneshMotif({ title, strokeWidth = 1.3, ...p }: SvgProps & { strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 120 124" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...decorative(title)} {...p}>
      <A11y title={title} />
      {/* mukut (crown) */}
      <path pathLength={1} d="M46 31 L49 21 L54 26 L60 11 L66 26 L71 21 L74 31" />
      <path pathLength={1} d="M45 31 H75" />
      <circle cx="60" cy="8" r="1.6" fill="currentColor" stroke="none" />
      {/* ears */}
      <path pathLength={1} d="M46 35 C30 29 19 43 24 58 C28 69 40 70 48 61" />
      <path pathLength={1} d="M74 35 C90 29 101 43 96 58 C92 69 80 70 72 61" />
      <path pathLength={1} d="M42 41 C33 40 29 49 32 56" opacity="0.55" />
      <path pathLength={1} d="M78 41 C87 40 91 49 88 56" opacity="0.55" />
      {/* head */}
      <path pathLength={1} d="M46 33 C45 45 47 54 52 60" />
      <path pathLength={1} d="M74 33 C75 45 73 54 68 60" />
      {/* tilak & eyes */}
      <path pathLength={1} d="M60 34 V40" />
      <circle cx="60" cy="43" r="1.3" fill="currentColor" stroke="none" />
      <path pathLength={1} d="M51 46 C53 44.5 55 44.5 57 46" />
      <path pathLength={1} d="M63 46 C65 44.5 67 44.5 69 46" />
      {/* trunk */}
      <path pathLength={1} d="M55 52 C53 66 54 80 63 88 C70 94 79 90 78 83 C77 77 70 77 70 82" />
      <path pathLength={1} d="M65 52 C64 64 64 74 69 79" />
      {/* tusk */}
      <path pathLength={1} d="M68 61 C73 62 76 65 76 70" opacity="0.8" />
      {/* modak on a lotus base */}
      <path pathLength={1} d="M36 96 C40 89 46 89 50 96 C47 99 39 99 36 96Z" />
      <path pathLength={1} d="M43 89 V86" />
      <path pathLength={1} d="M30 108 C46 100 74 100 90 108" />
      <path pathLength={1} d="M42 113 C54 109 66 109 78 113" opacity="0.6" />
    </svg>
  );
}

/* ------------------------------------------------------------- Dividers */

export function LotusDivider({ className }: { className?: string }) {
  return (
    <div className={`gold-rule ${className ?? ""}`} aria-hidden>
      <svg viewBox="0 0 40 24" width="40" height="24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M20 2 C25 8 25 16 20 22 C15 16 15 8 20 2Z" />
        <path d="M20 22 C14 20 8 15 6 9 C11 10 16 14 20 22Z" />
        <path d="M20 22 C26 20 32 15 34 9 C29 10 24 14 20 22Z" />
      </svg>
    </div>
  );
}

export function DotDivider({ className }: { className?: string }) {
  return (
    <div className={`gold-rule ${className ?? ""}`} aria-hidden>
      <svg viewBox="0 0 30 10" width="30" height="10" fill="currentColor">
        <circle cx="5" cy="5" r="1.4" />
        <path d="M15 0 L19 5 L15 10 L11 5Z" />
        <circle cx="25" cy="5" r="1.4" />
      </svg>
    </div>
  );
}

/** Corner flourish for ornamental frames (top-left orientation). */
export function CornerFlourish({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 90 90" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden focusable="false">
      <path pathLength={1} d="M2 88 V20 C2 10 10 2 20 2 H88" />
      <path pathLength={1} d="M9 88 V26 C9 16 16 9 26 9 H88" opacity="0.6" />
      <path pathLength={1} d="M20 20 C30 22 36 30 34 40 C26 38 21 31 20 20Z" />
      <path pathLength={1} d="M20 20 C22 30 30 36 40 34 C38 26 31 21 20 20Z" />
      <circle cx="44" cy="44" r="2" fill="currentColor" stroke="none" />
      <path pathLength={1} d="M16 50 C16 60 20 66 26 70" opacity="0.7" />
      <path pathLength={1} d="M50 16 C60 16 66 20 70 26" opacity="0.7" />
      <circle cx="16" cy="56" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="56" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
