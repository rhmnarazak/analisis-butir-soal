import { MoreVertical, SquarePen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MENU_WIDTH = 200;

// Same portal-dropdown pattern as AksiMenu.tsx (the assessment-list row
// menu), just scoped to a single participant row with one action.
const MENU_ITEM_CLASS =
  "flex h-11 w-full items-center gap-2 whitespace-nowrap rounded-lg px-5 text-left text-sm text-tertiary-900 transition-colors hover:bg-primary-25 hover:font-semibold hover:text-primary-500 active:bg-primary-100";
const MENU_ITEM_DISABLED_CLASS =
  "flex h-11 w-full cursor-not-allowed items-center gap-2 whitespace-nowrap rounded-lg px-5 text-left text-sm text-tertiary-400";

export function PesertaAksiMenu({
  participantName,
  disabled,
  onUbahNilai,
}: {
  participantName: string;
  // "Ubah Nilai" only makes sense once the participant actually has a
  // Nilai Asli to edit — disabled while still "Perlu Dinilai".
  disabled: boolean;
  onUbahNilai: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPosition({ top: rect.bottom + 6, left: rect.right - MENU_WIDTH });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function closeOnScrollOrResize() {
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", closeOnScrollOrResize, true);
    window.addEventListener("resize", closeOnScrollOrResize);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", closeOnScrollOrResize, true);
      window.removeEventListener("resize", closeOnScrollOrResize);
    };
  }, [open]);

  return (
    <span onClick={(event) => event.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-500 text-primary-500 transition-colors hover:bg-primary-50 active:bg-primary-100"
        aria-label={`Aksi ${participantName}`}
        aria-expanded={open}
      >
        <MoreVertical size={16} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: position.top, left: position.left, width: MENU_WIDTH }}
            className="z-50 rounded-xl border border-tertiary-200 bg-white p-3 shadow-[0px_0px_2px_0px_rgba(0,0,0,0.2),0px_2px_10px_0px_rgba(0,0,0,0.1)]"
            onClick={(event) => event.stopPropagation()}
          >
            {disabled ? (
              <span className={MENU_ITEM_DISABLED_CLASS}>
                <SquarePen size={18} className="shrink-0" />
                Ubah Nilai
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onUbahNilai();
                }}
                className={MENU_ITEM_CLASS}
              >
                <SquarePen size={18} className="shrink-0" />
                Ubah Nilai
              </button>
            )}
          </div>,
          document.body,
        )}
    </span>
  );
}
