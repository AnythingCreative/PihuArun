/**
 * Illustrated Himalayan dawn with a Kedar-style stone temple — inspired by
 * Triyuginarayan, where Shiv and Parvati are said to have married before an
 * eternal flame. Each <g data-depth> layer drifts at its own speed on scroll.
 */
const PINES = Array.from({ length: 34 }, (_, i) => ({ x: (i * 53) % 1640 - 20, h: 60 + ((i * 37) % 70), y: 742 + ((i * 29) % 40) }));
const FLAGS = ["#1f4fb4", "#f4f1e8", "#d4241f", "#1f8a4c", "#f2b81d"];

export function KailashScene({ className = "" }: { className?: string }) {
  return (
    <svg className={`kailash ${className}`} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" aria-hidden focusable="false">
      <defs>
        <linearGradient id="k-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24366e" />
          <stop offset="0.32" stopColor="#7a4f8f" />
          <stop offset="0.55" stopColor="#e2788a" />
          <stop offset="0.72" stopColor="#f8a866" />
          <stop offset="0.86" stopColor="#ffd98e" />
        </linearGradient>
        <radialGradient id="k-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff7d6" />
          <stop offset="0.35" stopColor="#ffe08a" />
          <stop offset="1" stopColor="#ffb05a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="k-snow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#f6e2ea" />
          <stop offset="1" stopColor="#b9a8cf" />
        </linearGradient>
        <linearGradient id="k-rock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d6f9e" />
          <stop offset="1" stopColor="#3e3e6e" />
        </linearGradient>
        <linearGradient id="k-ridge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4c5e8c" />
          <stop offset="1" stopColor="#24304f" />
        </linearGradient>
        <linearGradient id="k-forest" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f4a43" />
          <stop offset="1" stopColor="#0d2522" />
        </linearGradient>
        <linearGradient id="k-stone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a7a68" />
          <stop offset="0.5" stopColor="#c9b79c" />
          <stop offset="1" stopColor="#6e604f" />
        </linearGradient>
        <linearGradient id="k-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3a2a" />
          <stop offset="1" stopColor="#2e1a12" />
        </linearGradient>
        <linearGradient id="k-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.5" stopColor="#e0a526" />
          <stop offset="1" stopColor="#8a5a12" />
        </linearGradient>
        <radialGradient id="k-fire" cx="0.5" cy="0.8" r="0.6">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="0.4" stopColor="#ffb22e" />
          <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="k-court" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5e3a2c" />
          <stop offset="1" stopColor="#1c0f0b" />
        </linearGradient>
      </defs>

      <g className="kailash__layer" data-depth="0">
        <rect width="1600" height="1000" fill="url(#k-sky)" />
        <circle className="kailash__sun" cx="1210" cy="300" r="240" fill="url(#k-sun)" />
        <circle cx="1210" cy="300" r="58" fill="#fff4cf" />
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} className="kailash__star" cx={(i * 397) % 1600} cy={(i * 131) % 260} r={i % 3 ? 1.2 : 2} fill="#fff" style={{ animationDelay: `${-i * 0.4}s` }} />
        ))}
      </g>

      <g className="kailash__layer" data-depth="1">
        <path d="M-40 640 L180 420 L260 470 L420 300 L520 380 L640 250 L760 360 L860 300 L980 410 L1120 280 L1240 370 L1360 260 L1500 400 L1640 360 V720 H-40Z" fill="url(#k-rock)" />
        <path d="M420 300 L470 350 L440 345 L410 380 L380 340Z M640 250 L700 310 L660 300 L630 330 L600 300Z M1120 280 L1180 340 L1140 330 L1110 360 L1080 330Z M1360 260 L1420 320 L1380 310 L1350 345 L1320 310Z M180 420 L220 460 L195 455 L170 480 L150 455Z"
          fill="url(#k-snow)" />
        <path d="M640 250 L760 360 L860 300 L980 410 L860 380 L760 420 L700 350Z M1120 280 L1240 370 L1360 260 L1300 360 L1200 400Z" fill="#ffffff" opacity="0.55" />
      </g>

      <g className="kailash__layer kailash__clouds" data-depth="2">
        <g className="kailash__cloud" fill="#fff4ef" opacity="0.85">
          <ellipse cx="260" cy="470" rx="190" ry="34" /><ellipse cx="340" cy="450" rx="110" ry="36" />
          <ellipse cx="1260" cy="440" rx="220" ry="32" /><ellipse cx="1180" cy="424" rx="120" ry="34" />
        </g>
        <g className="kailash__cloud kailash__cloud--slow" fill="#ffd8c8" opacity="0.6">
          <ellipse cx="760" cy="520" rx="260" ry="26" /><ellipse cx="1500" cy="520" rx="200" ry="24" />
        </g>
      </g>

      <g className="kailash__layer" data-depth="3">
        <path d="M-40 720 L120 600 L260 650 L400 560 L560 640 L700 590 L820 650 L980 570 L1140 640 L1300 580 L1460 650 L1640 600 V820 H-40Z" fill="url(#k-ridge)" />
        <path d="M400 560 L440 590 L410 588 L390 605Z M980 570 L1020 600 L990 598 L970 615Z M1300 580 L1340 610 L1310 606 L1290 622Z" fill="#e8e6f6" />
      </g>

      <g className="kailash__layer" data-depth="4">
        <path d="M-40 790 Q200 720 420 760 T860 750 T1300 740 T1640 760 V1000 H-40Z" fill="url(#k-forest)" />
        {PINES.map((p, i) => (
          <path key={i} d={`M${p.x} ${p.y} l${p.h * 0.28} ${p.h} h${-p.h * 0.56}z`} fill={i % 3 ? "#123a33" : "#1a4d42"} />
        ))}
      </g>

      {/* the temple */}
      <g className="kailash__layer" data-depth="5">
      <g className="kailash__temple" transform="translate(304 344) scale(0.62)">
        <path d="M560 860 H1040 L1080 900 H520Z" fill="#6e604f" />
        <rect x="610" y="700" width="380" height="165" fill="url(#k-stone)" />
        <path d="M590 712 L800 640 L1010 712Z" fill="url(#k-roof)" />
        <path d="M600 712 H1000" stroke="url(#k-gold)" strokeWidth="5" />
        {/* shikhara */}
        <path d="M720 702 C724 600 742 520 800 440 C858 520 876 600 880 702Z" fill="url(#k-stone)" />
        {Array.from({ length: 9 }, (_, i) => {
          const y = 690 - i * 28;
          const w = 80 - i * 7;
          return <path key={i} d={`M${800 - w} ${y} H${800 + w}`} stroke="#5c4e40" strokeWidth="3" />;
        })}
        <path d="M770 452 L800 410 L830 452Z" fill="url(#k-roof)" />
        <path d="M752 470 L800 420 L848 470" fill="none" stroke="url(#k-gold)" strokeWidth="3" />
        <circle cx="800" cy="398" r="10" fill="url(#k-gold)" />
        <path d="M800 388 V330" stroke="#3a2a1a" strokeWidth="3" />
        <path className="kailash__flag" d="M802 332 L866 346 L802 362Z" fill="#f08a1c" />
        {/* doorway with the flame glow */}
        <path d="M770 865 V790 Q800 755 830 790 V865Z" fill="#2a120a" />
        <ellipse className="kailash__doorglow" cx="800" cy="840" rx="34" ry="40" fill="url(#k-fire)" />
        {[640, 700, 900, 960].map((x) => (
          <rect key={x} x={x - 8} y="740" width="16" height="125" fill="#a8977f" />
        ))}
        {[650, 950].map((x) => (
          <g key={x}>
            <path d={`M${x - 26} 700 L${x} 660 L${x + 26} 700Z`} fill="url(#k-roof)" />
            <circle cx={x} cy="652" r="6" fill="url(#k-gold)" />
          </g>
        ))}
        {/* bells */}
        {[740, 770, 830, 860].map((x, i) => (
          <g key={x} className="kailash__bell" style={{ animationDelay: `${-i * 0.6}s`, transformOrigin: `${x}px 712px` }}>
            <path d={`M${x} 712 V740`} stroke="#8a5a12" strokeWidth="1.5" />
            <path d={`M${x - 7} 752 Q${x} 734 ${x + 7} 752Z`} fill="url(#k-gold)" />
          </g>
        ))}
      </g>
      </g>

      {/* prayer flags */}
      <g className="kailash__layer" data-depth="5">
        <path d="M-20 680 Q400 820 800 720 T1620 680" fill="none" stroke="#3a2a1a" strokeWidth="1.5" />
        {Array.from({ length: 30 }, (_, i) => {
          const t = i / 29;
          const x = -20 + t * 1640;
          const y = 120 + (t < 0.5 ? 560 + Math.sin(t * Math.PI * 2) * 70 : 600 - Math.sin((t - 0.5) * Math.PI * 2) * 40 + (t - 0.5) * -80);
          return <path key={i} className="kailash__prayer" d={`M${x} ${y} h26 l-4 30 h-22z`} fill={FLAGS[i % 5]} style={{ animationDelay: `${-i * 0.23}s`, transformOrigin: `${x}px ${y}px` }} />;
        })}
      </g>

      {/* courtyard and diyas */}
      <g className="kailash__layer" data-depth="6">
        <path d="M-40 930 Q800 880 1640 930 V1000 H-40Z" fill="url(#k-court)" />
        {[220, 1380].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="938" rx="80" ry="16" fill="#00000055" />
            <path d={`M${x - 46} 918 Q${x} 960 ${x + 46} 918Z`} fill="url(#k-gold)" />
            <ellipse className="kailash__flame" cx={x} cy="880" rx="20" ry="44" fill="url(#k-fire)" />
            <path className="kailash__flame" d={`M${x} 870 q14 22 0 42 q-14 -20 0 -42z`} fill="#fff3b0" />
          </g>
        ))}
      </g>
    </svg>
  );
}
