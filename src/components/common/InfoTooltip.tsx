import { Info } from "lucide-react";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

// Hover-triggered, portal-rendered tooltip anchored under an info icon —
// shared by every "ⓘ" affordance in the app (chart-card headers, table
// column headers, etc.) so they all look and behave identically.
export function InfoTooltip({ text, size = 16 }: { text: string; size?: number }) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  function show() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
    setOpen(true);
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex cursor-help text-tertiary-400"
      >
        <Info size={size} />
      </span>
      {open &&
        createPortal(
          <div
            style={{ position: "fixed", top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
            className="z-50 w-max max-w-[240px] rounded-lg bg-tertiary-900 px-3 py-2 text-xs font-normal leading-relaxed text-white shadow-lg"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
}
