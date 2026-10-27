/**
 * Illustrated dulha and dulhan holding the varmala — a stylised portrait of
 * Arun (safa, rectangular glasses, full beard) and Pratima (red lehenga,
 * long dark hair under the dupatta). Drawn, not photographed.
 */
const MARIGOLDS = Array.from({ length: 15 }, (_, i) => {
  const t = i / 14;
  return { x: 282 + t * 56, y: 418 + Math.sin(t * Math.PI) * 58, c: i % 3 === 1 ? "#d6246e" : i % 2 ? "#f4a21c" : "#ff7a1a" };
});

export function CoupleIllustration({ className = "" }: { className?: string }) {
  return (
    <svg className={`couple-art ${className}`} viewBox="0 0 600 700" role="img" aria-labelledby="couple-art-title" focusable="false">
      <title id="couple-art-title">Illustration of Arun in an ivory sherwani and saffron safa, and Pratima in a red lehenga, holding a marigold varmala</title>
      <defs>
        <linearGradient id="ca-safa" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffb238" />
          <stop offset="0.6" stopColor="#f07a12" />
          <stop offset="1" stopColor="#c4500c" />
        </linearGradient>
        <linearGradient id="ca-sherwani" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e9dcc0" />
          <stop offset="0.5" stopColor="#fbf4e3" />
          <stop offset="1" stopColor="#ddcfb0" />
        </linearGradient>
        <linearGradient id="ca-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e3203f" />
          <stop offset="0.55" stopColor="#b3102c" />
          <stop offset="1" stopColor="#7a0a1e" />
        </linearGradient>
        <linearGradient id="ca-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.5" stopColor="#e0a526" />
          <stop offset="1" stopColor="#8a5a12" />
        </linearGradient>
        <linearGradient id="ca-dupatta" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8294a" stopOpacity="0.92" />
          <stop offset="1" stopColor="#b3102c" stopOpacity="0.78" />
        </linearGradient>
        <radialGradient id="ca-skin-a" cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#dca17a" />
          <stop offset="1" stopColor="#b97a55" />
        </radialGradient>
        <radialGradient id="ca-skin-p" cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#f0c09c" />
          <stop offset="1" stopColor="#d59a74" />
        </radialGradient>
        <pattern id="ca-buti" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="11" r="2.4" fill="#f6d27a" />
          <circle cx="0" cy="0" r="1.4" fill="#f6d27a" />
          <circle cx="22" cy="22" r="1.4" fill="#f6d27a" />
        </pattern>
      </defs>

      {/* ground shadow */}
      <ellipse cx="300" cy="680" rx="230" ry="18" fill="#00000040" />

      {/* ---------- Arun ---------- */}
      <g className="couple-art__groom">
        {/* safa tail behind */}
        <path d="M252 196 Q300 250 286 360 Q272 300 246 236Z" fill="url(#ca-safa)" />
        {/* churidar + mojari */}
        <path d="M188 560 L196 664 H218 L222 580 L228 664 H250 L254 560Z" fill="#f3ead7" />
        <path d="M190 600 h60 M192 630 h56" stroke="#d8cbb0" strokeWidth="2" />
        <ellipse cx="206" cy="668" rx="20" ry="8" fill="url(#ca-gold)" />
        <ellipse cx="240" cy="668" rx="20" ry="8" fill="url(#ca-gold)" />
        {/* sherwani */}
        <path d="M150 334 Q160 302 220 296 Q280 302 290 334 L304 588 Q220 604 136 588Z" fill="url(#ca-sherwani)" />
        <path d="M136 588 Q220 604 304 588" fill="none" stroke="url(#ca-gold)" strokeWidth="7" />
        <path d="M220 300 V596" stroke="url(#ca-gold)" strokeWidth="4" />
        {[330, 362, 394, 426, 458, 490].map((y) => (
          <circle key={y} cx="220" cy={y} r="4" fill="url(#ca-gold)" />
        ))}
        <path d="M168 360 q18 30 0 60 M272 360 q-18 30 0 60" fill="none" stroke="#e0a526" strokeOpacity="0.55" strokeWidth="2" />
        {/* maroon dupatta sash */}
        <path d="M160 326 Q190 330 300 520 L290 548 Q200 400 150 352Z" fill="#7a0a1e" />
        <path d="M160 326 Q190 330 300 520" fill="none" stroke="url(#ca-gold)" strokeWidth="3" />
        {/* left arm */}
        <path d="M152 336 Q128 420 140 520 L160 520 Q158 430 176 360Z" fill="url(#ca-sherwani)" />
        <ellipse cx="150" cy="530" rx="13" ry="16" fill="url(#ca-skin-a)" />
        {/* right arm reaching to the varmala */}
        <path d="M282 330 Q318 360 296 420 L280 414 Q292 372 266 352Z" fill="url(#ca-sherwani)" />
        <ellipse cx="286" cy="420" rx="13" ry="11" fill="url(#ca-skin-a)" />
        {/* neck + collar */}
        <rect x="205" y="266" width="30" height="36" rx="10" fill="url(#ca-skin-a)" />
        <path d="M198 298 Q220 312 242 298 L240 286 Q220 296 200 286Z" fill="url(#ca-gold)" />
        {/* pearl mala */}
        <path d="M188 312 Q220 380 252 312" fill="none" stroke="#fffaf0" strokeWidth="5" strokeDasharray="1 7" strokeLinecap="round" />
        {/* head */}
        <ellipse cx="220" cy="232" rx="38" ry="46" fill="url(#ca-skin-a)" />
        <ellipse cx="182" cy="236" rx="7" ry="11" fill="#b97a55" />
        <ellipse cx="258" cy="236" rx="7" ry="11" fill="#b97a55" />
        {/* hair at the temples */}
        <path d="M182 214 Q184 236 188 244 L186 210Z M258 214 Q256 236 252 244 L254 210Z" fill="#1c1410" />
        {/* beard + moustache */}
        <path d="M184 238 Q186 292 220 298 Q254 292 256 238 Q250 262 238 268 Q220 260 202 268 Q190 262 184 238Z" fill="#1c1410" />
        <path d="M204 256 Q220 248 236 256 Q228 262 220 258 Q212 262 204 256Z" fill="#1c1410" />
        <path d="M210 270 Q220 276 230 270" fill="none" stroke="#7a3a2a" strokeWidth="2.5" strokeLinecap="round" />
        {/* eyes + brows behind glasses */}
        <path d="M196 220 q8 -5 16 0 M228 220 q8 -5 16 0" fill="none" stroke="#1c1410" strokeWidth="3" strokeLinecap="round" />
        <path d="M198 231 q6 4 12 0 M230 231 q6 4 12 0" fill="none" stroke="#1c1410" strokeWidth="2.5" strokeLinecap="round" />
        {/* rectangular glasses */}
        <rect x="190" y="222" width="26" height="20" rx="3" fill="#ffffff22" stroke="#d9dde2" strokeWidth="2.2" />
        <rect x="224" y="222" width="26" height="20" rx="3" fill="#ffffff22" stroke="#d9dde2" strokeWidth="2.2" />
        <path d="M216 228 H224 M190 228 L182 226 M250 228 L258 226" stroke="#d9dde2" strokeWidth="2" />
        <path d="M218 236 q2 8 -2 12" fill="none" stroke="#9a5f40" strokeWidth="2" />
        {/* safa */}
        <path d="M176 216 Q172 160 220 150 Q270 160 264 216 Q220 196 176 216Z" fill="url(#ca-safa)" />
        <path d="M180 198 Q220 170 262 196 M184 182 Q220 156 258 180 M190 168 Q222 150 250 166" fill="none" stroke="#c4500c" strokeWidth="2.5" />
        <path d="M176 216 Q220 196 264 216" fill="none" stroke="url(#ca-gold)" strokeWidth="4" />
        <circle cx="220" cy="184" r="9" fill="url(#ca-gold)" />
        <circle cx="220" cy="184" r="4.5" fill="#c8102e" />
        <path d="M222 176 Q236 130 262 120 Q244 140 230 178Z" fill="#fff6e0" stroke="url(#ca-gold)" strokeWidth="1.5" />
        <path d="M212 194 q8 10 16 0" fill="none" stroke="#fffaf0" strokeWidth="3" strokeDasharray="1 5" strokeLinecap="round" />
      </g>

      {/* ---------- Pratima ---------- */}
      <g className="couple-art__bride">
        {/* long hair behind */}
        <path d="M346 226 Q330 330 352 430 L408 430 Q430 330 414 226Z" fill="#160e0c" />
        {/* lehenga */}
        <path d="M336 404 Q300 560 284 672 Q380 692 476 672 Q460 560 424 404Z" fill="url(#ca-red)" />
        <path d="M336 404 Q300 560 284 672 Q380 692 476 672 Q460 560 424 404Z" fill="url(#ca-buti)" opacity="0.8" />
        <path d="M290 640 Q380 662 470 640" fill="none" stroke="url(#ca-gold)" strokeWidth="10" />
        <path d="M286 664 Q380 684 474 664" fill="none" stroke="url(#ca-gold)" strokeWidth="5" />
        <path d="M296 610 Q380 630 464 610" fill="none" stroke="url(#ca-gold)" strokeWidth="3" strokeDasharray="10 6" />
        <path d="M360 420 Q350 540 336 660 M400 420 Q410 540 424 660" fill="none" stroke="#7a0a1e" strokeOpacity="0.6" strokeWidth="2" />
        {/* waist + choli */}
        <path d="M346 380 H414 L424 406 H336Z" fill="url(#ca-skin-p)" />
        <path d="M344 318 Q380 306 416 318 L418 384 Q380 392 342 384Z" fill="url(#ca-red)" />
        <path d="M342 384 Q380 392 418 384" fill="none" stroke="url(#ca-gold)" strokeWidth="4" />
        {/* arms holding the varmala */}
        <path d="M346 326 Q318 360 330 418 L346 414 Q338 376 360 344Z" fill="url(#ca-skin-p)" />
        <ellipse cx="338" cy="420" rx="12" ry="10" fill="url(#ca-skin-p)" />
        <path d="M330 404 h18 M330 410 h18" stroke="#d6246e" strokeWidth="3" />
        <path d="M414 326 Q446 380 430 470 L414 466 Q424 392 400 346Z" fill="url(#ca-skin-p)" />
        <ellipse cx="422" cy="474" rx="12" ry="12" fill="url(#ca-skin-p)" />
        <path d="M414 452 h18 M414 458 h18" stroke="#d6246e" strokeWidth="3" />
        {/* neck + jewellery */}
        <rect x="367" y="270" width="26" height="40" rx="10" fill="url(#ca-skin-p)" />
        <path d="M352 306 Q380 344 408 306" fill="none" stroke="url(#ca-gold)" strokeWidth="8" />
        <path d="M358 314 Q380 356 402 314" fill="none" stroke="#2aa36b" strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" />
        <circle cx="380" cy="338" r="6" fill="#c8102e" stroke="url(#ca-gold)" strokeWidth="2" />
        {/* head */}
        <ellipse cx="380" cy="236" rx="33" ry="41" fill="url(#ca-skin-p)" />
        <path d="M348 222 Q350 186 380 182 Q410 186 412 222 Q400 200 380 198 Q360 200 348 222Z" fill="#160e0c" />
        <path d="M380 184 V200" stroke="#c8102e" strokeWidth="2.5" />
        {/* maang tikka */}
        <path d="M380 184 Q378 196 380 204" fill="none" stroke="url(#ca-gold)" strokeWidth="1.5" />
        <circle cx="380" cy="208" r="5" fill="url(#ca-gold)" />
        <circle cx="380" cy="208" r="2" fill="#c8102e" />
        {/* eyes, brows, bindi, lips */}
        <path d="M360 226 q7 -4 14 0 M386 226 q7 -4 14 0" fill="none" stroke="#2a1410" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M361 236 q6 4 12 0 M387 236 q6 4 12 0" fill="none" stroke="#2a1410" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="380" cy="220" r="2.4" fill="#c8102e" />
        <path d="M371 260 Q380 266 389 260 Q380 270 371 260Z" fill="#b5123a" />
        <path d="M380 242 q2 7 -2 10" fill="none" stroke="#c48262" strokeWidth="1.8" />
        {/* nath */}
        <circle cx="388" cy="252" r="6" fill="none" stroke="url(#ca-gold)" strokeWidth="1.6" />
        <path d="M393 250 Q404 246 412 238" fill="none" stroke="#fffaf0" strokeWidth="1.2" strokeDasharray="1 2" />
        {/* jhumkas */}
        <path d="M344 248 v8 M416 248 v8" stroke="url(#ca-gold)" strokeWidth="2" />
        <path d="M338 256 q6 -8 12 0 l-6 10z M410 256 q6 -8 12 0 l-6 10z" fill="url(#ca-gold)" />
        {/* dupatta over the head */}
        <path d="M340 236 Q336 172 380 166 Q426 172 420 236 L462 540 Q446 500 432 440 L424 300 Q420 250 412 232 Q404 190 380 188 Q356 190 348 232 Q340 250 336 300 L326 440 Q314 500 298 540Z" fill="url(#ca-dupatta)" />
        <path d="M340 236 Q336 172 380 166 Q426 172 420 236 L462 540 M340 236 L298 540" fill="none" stroke="url(#ca-gold)" strokeWidth="4" />
        <path d="M352 196 Q380 176 408 196" fill="none" stroke="url(#ca-gold)" strokeWidth="2" strokeDasharray="3 5" />
      </g>

      {/* ---------- varmala between them ---------- */}
      <g className="couple-art__varmala">
        {MARIGOLDS.map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r="7" fill={m.c} />
        ))}
        {MARIGOLDS.filter((_, i) => i % 2).map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r="3" fill="#fff6e0" />
        ))}
      </g>
    </svg>
  );
}
