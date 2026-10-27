/** Rajasthani palace at dusk — chhatris, a cusped-arch colonnade, lamps, peacocks and bougainvillea. */

/** A multifoil (cusped) arch path, the signature of Rajput–Mughal palaces. */
export function cuspedArch(x: number, y: number, w: number, h: number) {
  const r = w / 2;
  const top = y + h - r * 1.25;
  const lobes = 5;
  let d = `M${x} ${y + h} V${top} `;
  for (let i = 0; i < lobes; i++) {
    const a1 = Math.PI + ((i + 1) / lobes) * Math.PI;
    const ex = x + r + Math.cos(a1) * r;
    const ey = top + Math.sin(a1) * r * 1.25;
    const lr = (r * Math.PI) / lobes / 1.7;
    d += `A${lr} ${lr} 0 0 1 ${ex.toFixed(1)} ${ey.toFixed(1)} `;
  }
  return d + `V${y + h}Z`;
}

export function Peacock({ x, y, flip = false, scale = 1 }: { x: number; y: number; flip?: boolean; scale?: number }) {
  const feathers = Array.from({ length: 13 }, (_, i) => (i / 12) * 150 - 165);
  return (
    <g className="peacock" transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <g className="peacock__tail">
        {feathers.map((a, i) => {
          const rad = (a * Math.PI) / 180;
          const ex = Math.cos(rad) * 190;
          const ey = Math.sin(rad) * 120;
          return (
            <g key={i}>
              <path d={`M0 0 Q${ex * 0.5} ${ey * 0.5 - 10} ${ex} ${ey}`} stroke="#1f8a4c" strokeWidth="5" fill="none" />
              <ellipse cx={ex} cy={ey} rx="14" ry="10" fill="#1f8a4c" transform={`rotate(${a} ${ex} ${ey})`} />
              <ellipse cx={ex} cy={ey} rx="8" ry="6" fill="#e0a526" transform={`rotate(${a} ${ex} ${ey})`} />
              <ellipse cx={ex} cy={ey} rx="4" ry="3.5" fill="#1a3fa0" />
            </g>
          );
        })}
      </g>
      <path d="M-30 10 Q-10 -30 30 -10 Q40 20 0 30 Q-30 30 -30 10Z" fill="#1a3fa0" />
      <path d="M18 -14 Q30 -50 26 -80 Q40 -82 40 -70 Q36 -40 34 -8Z" fill="#1d5fd0" />
      <circle cx="34" cy="-80" r="9" fill="#1d5fd0" />
      <path d="M40 -80 l14 4 l-14 3z" fill="#e0a526" />
      <circle cx="36" cy="-82" r="2" fill="#fff" />
      {[-6, 0, 6].map((d) => (
        <g key={d}>
          <path d={`M${32 + d} -88 L${30 + d * 1.6} -104`} stroke="#1d5fd0" strokeWidth="1.5" />
          <circle cx={30 + d * 1.6} cy="-106" r="3" fill="#1d5fd0" />
        </g>
      ))}
      <path d="M-4 28 V52 M8 28 V52" stroke="#8a5a12" strokeWidth="3" />
    </g>
  );
}

function Bougainvillea({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="bougainvillea">
      {Array.from({ length: 26 }, (_, i) => {
        const a = i * 2.39;
        const r = 10 + (i % 7) * 9;
        return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r * 0.7} r={9 + (i % 3) * 3} fill={i % 4 ? "#d6246e" : "#f26aa8"} />;
      })}
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx={Math.cos(i) * 50} cy={Math.sin(i) * 34} rx="10" ry="5" fill="#2c7a4a" transform={`rotate(${i * 40} ${Math.cos(i) * 50} ${Math.sin(i) * 34})`} />
      ))}
    </g>
  );
}

export function PalaceScene({ className = "" }: { className?: string }) {
  const arches = [120, 420, 900, 1200];
  return (
    <svg className={`palace ${className}`} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" aria-hidden focusable="false">
      <defs>
        <linearGradient id="p-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14205a" />
          <stop offset="0.45" stopColor="#5a3a8c" />
          <stop offset="0.8" stopColor="#f08a7a" />
          <stop offset="1" stopColor="#ffc28a" />
        </linearGradient>
        <linearGradient id="p-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2c9b2" />
          <stop offset="1" stopColor="#d49a86" />
        </linearGradient>
        <linearGradient id="p-sand-dark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c98a78" />
          <stop offset="1" stopColor="#9a5e54" />
        </linearGradient>
        <linearGradient id="p-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.5" stopColor="#e0a526" />
          <stop offset="1" stopColor="#8a5a12" />
        </linearGradient>
        <radialGradient id="p-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="0.4" stopColor="#ffb22e" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ff7a1a" stopOpacity="0" />
        </radialGradient>
        <pattern id="p-marble" width="80" height="40" patternUnits="userSpaceOnUse">
          <rect width="80" height="40" fill="#f6efe6" />
          <path d="M0 20 L40 0 L80 20 L40 40Z" fill="#e8d8c8" />
          <circle cx="40" cy="20" r="4" fill="#c8102e" opacity="0.5" />
        </pattern>
      </defs>

      <g className="palace__layer" data-depth="0">
        <rect width="1600" height="1000" fill="url(#p-sky)" />
        <circle cx="1240" cy="190" r="56" fill="#fff6dc" />
        <circle cx="1240" cy="190" r="110" fill="#fff6dc" opacity="0.15" />
        {Array.from({ length: 30 }, (_, i) => (
          <circle key={i} className="kailash__star" cx={(i * 431) % 1600} cy={(i * 97) % 360} r={i % 4 ? 1.2 : 2.2} fill="#fff" style={{ animationDelay: `${-i * 0.5}s` }} />
        ))}
      </g>

      {/* distant palace skyline */}
      <g className="palace__layer" data-depth="1">
        <path d="M0 640 V520 H140 V470 H260 V540 H400 V430 H520 V560 H700 V500 H900 V560 H1080 V440 H1200 V520 H1360 V470 H1480 V540 H1600 V640Z" fill="url(#p-sand-dark)" />
        {[200, 460, 800, 1140, 1420].map((x, i) => (
          <g key={x}>
            <rect x={x - 40} y={i % 2 ? 470 : 430} width="80" height="40" fill="url(#p-sand-dark)" />
            <path d={`M${x - 46} ${i % 2 ? 470 : 430} Q${x} ${i % 2 ? 400 : 360} ${x + 46} ${i % 2 ? 470 : 430}Z`} fill="#b97868" />
            <path d={`M${x} ${i % 2 ? 404 : 364} V${i % 2 ? 386 : 346}`} stroke="url(#p-gold)" strokeWidth="4" />
          </g>
        ))}
        {Array.from({ length: 22 }, (_, i) => (
          <rect key={i} className="palace__window" x={60 + i * 70} y={560 + (i % 3) * 22} width="12" height="18" rx="6" fill="#ffd27a" style={{ animationDelay: `${-i * 0.7}s` }} />
        ))}
      </g>

      {/* colonnade */}
      <g className="palace__layer" data-depth="2">
        <rect x="0" y="300" width="1600" height="560" fill="url(#p-sand)" />
        {arches.map((x) => (
          <path key={x} d={cuspedArch(x, 360, 280, 480)} fill="#2a1b4a" opacity="0.88" />
        ))}
        {arches.map((x) => (
          <path key={`o${x}`} d={cuspedArch(x - 10, 350, 300, 490)} fill="none" stroke="url(#p-gold)" strokeWidth="4" />
        ))}
        <path d="M0 300 H1600 V330 H0Z" fill="#c98a78" />
        <path d="M0 330 H1600" stroke="url(#p-gold)" strokeWidth="5" />
        {Array.from({ length: 40 }, (_, i) => (
          <path key={i} d={`M${i * 40} 300 l20 -26 l20 26z`} fill="#c98a78" />
        ))}
        {/* hanging lamps */}
        {[260, 560, 1040, 1340].map((x, i) => (
          <g key={x} className="palace__lamp" style={{ transformOrigin: `${x}px 330px`, animationDelay: `${-i * 0.9}s` }}>
            <path d={`M${x} 330 V470`} stroke="url(#p-gold)" strokeWidth="2" />
            <circle cx={x} cy="500" r="60" fill="url(#p-lamp)" />
            <path d={`M${x - 18} 480 h36 l-8 40 h-20z`} fill="url(#p-gold)" />
            <path d={`M${x - 22} 480 Q${x} 456 ${x + 22} 480Z`} fill="url(#p-gold)" />
          </g>
        ))}
        {/* marigold strings */}
        {[0, 1].map((r) => (
          <path key={r} d={`M0 ${344 + r * 18} Q400 ${410 + r * 18} 800 ${344 + r * 18} T1600 ${344 + r * 18}`} fill="none" stroke={r ? "#d6246e" : "#f4a21c"} strokeWidth="12" strokeDasharray="2 12" strokeLinecap="round" />
        ))}
      </g>

      {/* balustrade + marble floor */}
      <g className="palace__layer" data-depth="3">
        <rect x="0" y="840" width="1600" height="160" fill="url(#p-marble)" />
        <rect x="0" y="770" width="1600" height="16" fill="#f6efe6" />
        <rect x="0" y="828" width="1600" height="14" fill="#e8d8c8" />
        {Array.from({ length: 54 }, (_, i) => (
          <path key={i} d={`M${12 + i * 30} 786 q-8 20 0 42 h10 q8 -22 0 -42z`} fill="#f2e6da" />
        ))}
        <Bougainvillea x={400} y={470} s={1.1} />
        <Bougainvillea x={1200} y={470} s={1.1} />
        <Bougainvillea x={370} y={790} s={0.9} />
        <Bougainvillea x={1230} y={790} s={0.9} />
      </g>

      <g className="palace__layer" data-depth="4">
        <Peacock x={470} y={756} scale={0.78} />
        <Peacock x={1130} y={756} flip scale={0.78} />
      </g>
    </svg>
  );
}
