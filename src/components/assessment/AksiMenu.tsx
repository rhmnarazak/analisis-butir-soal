import { Eye, Loader2, MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAssessmentStore } from "../../state/AssessmentStore";
import type { AnbusoState, Assessment } from "../../types/assessment";
import { AnbusoStateIcon, isAnbusoActionable } from "./AnbusoActionCell";
import { needsRepublish } from "./StatusBadge";

const RUNNABLE_STATES: AnbusoState[] = ["Analisis Sekarang", "Perbarui Hasil Analisis"];

// Figma's default (non-hover) menu frame is a fixed 232px, but its "hovered"
// variants drop the fixed width (sizing: hug) so the bolder hover text never
// wraps. A fixed-width dropdown that reflows on hover would be worse UX, so
// instead the width here is sized to comfortably fit the longest label
// ("Lihat Detail Asesmen") at the heavier hover/semibold weight.
const MENU_WIDTH = 264;

// Matches the Figma ".aksiMenu" component: default is plain (white bg,
// tertiary-900 regular text); hovering an item tints the background
// primary-25, and turns the text/icon primary-500 + semibold — icons use no
// color class of their own so they inherit this via currentColor.
const MENU_ITEM_CLASS =
  "flex h-11 w-full items-center gap-2 whitespace-nowrap rounded-lg px-5 text-left text-sm text-tertiary-900 transition-colors hover:bg-primary-25 hover:font-semibold hover:text-primary-500 active:bg-primary-100";

export function AksiMenu({ row }: { row: Assessment }) {
  const navigate = useNavigate();
  const { isAnalysisPending, runAnalysis } = useAssessmentStore();
  const pending = isAnalysisPending(row.id);
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

  const anbusoActionable = isAnbusoActionable(row.anbusoState);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          open ? setOpen(false) : openMenu();
        }}
        className="animate-fade-in flex h-9 w-9 items-center justify-center rounded-lg border border-primary-500 text-primary-500 transition-colors hover:bg-primary-50 active:bg-primary-100"
        aria-label="Buka menu aksi"
        aria-expanded={open}
      >
        <MoreVertical size={18} />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: position.top, left: position.left, width: MENU_WIDTH }}
            className="z-50 rounded-xl border border-tertiary-200 bg-white p-3 shadow-[0px_0px_2px_0px_rgba(0,0,0,0.2),0px_2px_10px_0px_rgba(0,0,0,0.1)]"
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
                navigate(`/asesmen/${row.id}`);
              }}
              className={MENU_ITEM_CLASS}
            >
              <Eye size={20} className="shrink-0" />
              Lihat Detail Asesmen
            </button>
            {pending ? (
              <span className={`${MENU_ITEM_CLASS} cursor-default text-tertiary-500 hover:bg-transparent hover:font-normal hover:text-tertiary-500`}>
                <Loader2 size={20} className="shrink-0 animate-spin" />
                Menunggu Hasil Analisis
              </span>
            ) : (
              anbusoActionable && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpen(false);
                    if (row.anbusoState === "Lihat Hasil Analisis") {
                      navigate(`/asesmen/${row.id}/analisis-butir-soal`);
                    } else if (row.anbusoState === "Perbarui Hasil Analisis" && needsRepublish(row)) {
                      // Nilai haven't been (re)published yet ("Publikasi
                      // Ulang") — don't silently run AnBuSo here. ?blocked=1
                      // makes the AnBuSo tab show the warning popup right
                      // away instead of requiring a second click there.
                      navigate(`/asesmen/${row.id}?tab=anbuso&blocked=1`);
                    } else if (RUNNABLE_STATES.includes(row.anbusoState)) {
                      runAnalysis(row.id);
                      navigate(`/asesmen/${row.id}?tab=anbuso`);
                    }
                  }}
                  className={MENU_ITEM_CLASS}
                >
                  <AnbusoStateIcon state={row.anbusoState} size={20} className="shrink-0" />
                  {row.anbusoState}
                </button>
              )
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
