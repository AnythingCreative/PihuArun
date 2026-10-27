import type { ReactNode } from "react";

/** Carved gilt frame: layered gold mouldings, a bead line and filigree corners. */
function Filigree({ className }: { className: string }) {
  return (
    <svg className={`goldframe__corner ${className}`} viewBox="0 0 80 80" aria-hidden focusable="false">
      <path d="M4 76 V30 Q4 4 30 4 H76" fill="none" stroke="url(#gf-gold)" strokeWidth="5" />
      <path d="M14 76 V36 Q14 14 36 14 H76" fill="none" stroke="url(#gf-gold)" strokeWidth="2" />
      <circle cx="22" cy="22" r="7" fill="url(#gf-gold)" />
      <path d="M22 4 q8 10 0 18 q-8 -8 0 -18z M4 22 q10 8 18 0 q-8 -8 -18 0z" fill="url(#gf-gold)" />
      <path d="M40 4 q6 8 14 0 M4 40 q8 6 0 14" fill="none" stroke="url(#gf-gold)" strokeWidth="2" />
    </svg>
  );
}

export function GoldFrame({ children, className = "", arch = false }: { children: ReactNode; className?: string; arch?: boolean }) {
  return (
    <div className={`goldframe ${arch ? "goldframe--arch" : ""} ${className}`}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
        <defs>
          <linearGradient id="gf-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff1b8" />
            <stop offset="0.45" stopColor="#e0a526" />
            <stop offset="1" stopColor="#7a4a0e" />
          </linearGradient>
        </defs>
      </svg>
      <div className="goldframe__inner">{children}</div>
      {!arch && (
        <>
          <Filigree className="goldframe__corner--tl" />
          <Filigree className="goldframe__corner--tr" />
          <Filigree className="goldframe__corner--bl" />
          <Filigree className="goldframe__corner--br" />
        </>
      )}
      <span className="goldframe__shine" aria-hidden />
    </div>
  );
}
