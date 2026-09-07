import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

// Matches Figma's ".modal" component (node 5998:201729) — a big centered
// tone icon, Heading 5 title, Body/Large caption, then a 2-button row
// (outline "Kembali"-style cancel + solid confirm). Used for the two
// confirm steps in the status-change flow (C.1 "Lewati Proses
// Penilaian...", C.2 "Publikasikan Nilai..."), title/message/button copy
// unchanged from before — only the visual chrome is new.
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Ya",
  cancelLabel = "Tidak",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
        className="animate-fade-in flex w-[495px] max-w-full flex-col items-center gap-[30px] rounded-[20px] bg-white p-10 shadow-[0px_0px_3px_0px_rgba(0,0,0,0.1),0px_4px_20px_0px_rgba(0,0,0,0.15)]"
      >
        <div className="flex w-[415px] max-w-full flex-col items-center gap-5">
          <span className="flex h-[140px] w-[140px] shrink-0 items-center justify-center rounded-full bg-[#FDECC8]">
            <AlertTriangle size={56} className="text-warning-500" />
          </span>
          <div className="flex flex-col items-center gap-[18px] text-center">
            <h2 id="confirm-dialog-title" className="text-2xl leading-9 font-semibold text-tertiary-900">
              {title}
            </h2>
            <p className="text-base leading-6 text-tertiary-600">{message}</p>
          </div>
        </div>
        <div className="flex w-full gap-3.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-lg border border-primary-500 px-5 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-primary-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-400"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
