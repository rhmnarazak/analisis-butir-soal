import { X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { getHasilAnalisis, HASIL_PRIORITY } from "../../lib/itemAnalysisStats";
import type { QuestionAnalysis } from "../../types/assessment";
import { AnalisisSoalTable } from "./AnalisisSoalTable";

// Popup for "Tinjau X Soal Yang Perlu Perhatian" (RingkasanKualitasPaketSoal's
// RekomendasiCard button) — reuses the exact same soal table as the page's
// own "Semua Soal" list (AnalisisSoalTable), filtered to just "Perlu
// Ditinjau"/"Perlu Diperbaiki", with the extra "Alasan" column spelling out
// which of the 4 metrics is flagged and why.
export function SoalPerluPerhatianDialog({
  open,
  onClose,
  questions,
  onSelectSoal,
}: {
  open: boolean;
  onClose: () => void;
  questions: QuestionAnalysis[];
  onSelectSoal: (q: QuestionAnalysis) => void;
}) {
  const rows = useMemo(() => {
    const withHasil = questions.map((q) => ({ q, hasil: getHasilAnalisis(q) }));
    return withHasil
      .filter((r) => r.hasil === "Perlu Ditinjau" || r.hasil === "Perlu Diperbaiki")
      .sort((a, b) => {
        const priorityDiff = HASIL_PRIORITY[a.hasil] - HASIL_PRIORITY[b.hasil];
        return priorityDiff !== 0 ? priorityDiff : a.q.no - b.q.no;
      });
  }, [questions]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="soal-perlu-perhatian-title"
        onClick={(event) => event.stopPropagation()}
        className="animate-fade-in flex max-h-[85vh] w-full max-w-[1400px] flex-col gap-4 rounded-[20px] bg-white p-6 shadow-[0px_0px_3px_0px_rgba(0,0,0,0.1),0px_4px_20px_0px_rgba(0,0,0,0.15)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 id="soal-perlu-perhatian-title" className="text-lg font-bold text-tertiary-900">
              Soal Yang Perlu Perhatian
            </h2>
            <p className="text-sm text-tertiary-600">
              {rows.length} soal memerlukan tinjauan atau perbaikan berdasarkan hasil analisis.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="shrink-0 rounded-lg p-1 text-tertiary-500 transition-colors hover:bg-tertiary-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <AnalisisSoalTable rows={rows} onRowClick={onSelectSoal} showAlasan />
        </div>
      </div>
    </div>,
    document.body,
  );
}
