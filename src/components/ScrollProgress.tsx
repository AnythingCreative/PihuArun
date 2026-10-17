import { useRef } from "react";
import { useScrollProgress } from "../hooks/useScrollProgress";

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref);
  return <div ref={ref} className="scroll-progress" aria-hidden />;
}
