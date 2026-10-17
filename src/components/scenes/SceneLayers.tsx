import type { ReactNode } from "react";

export interface SceneLayer {
  /** 0 = static backdrop, 1 = nearest foreground. Motion code reads data-depth. */
  depth: number;
  node: ReactNode;
}

export const VIEW_W = 1600;
export const VIEW_H = 1000;

/** One full-bleed SVG per depth so each layer can move on its own compositor layer. */
export function LayerSvg({ children, align = "xMidYMax" }: { children: ReactNode; align?: string }) {
  return (
    <svg
      className="scene__svg"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio={`${align} slice`}
      aria-hidden
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function SceneLayers({ layers, label, className }: { layers: SceneLayer[]; label: string; className?: string }) {
  return (
    <div className={`scene ${className ?? ""}`} role="img" aria-label={label}>
      {layers.map((l, i) => (
        <div key={i} className="scene__layer" data-depth={l.depth}>
          {l.node}
        </div>
      ))}
    </div>
  );
}
