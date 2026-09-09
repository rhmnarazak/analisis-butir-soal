import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// "Ubah Nilai" popup for a single participant, per Figma node 6028-117646
// (".ModalPengaturanBobotNilai"). Nilai Penyesuaian is an absolute
// replacement score (0-100, see src/lib/participantStatus.ts) — pre-filled
// with the current override when re-editing, blank the first time.
export function UbahNilaiDialog({
  open,
  participantName,
  currentNilaiPenyesuaian,
  onCancel,
  onSave,
}: {
  open: boolean;
  participantName: string;
  currentNilaiPenyesuaian: number | null;
  onCancel: () => void;
  onSave: (nilaiBaru: number) => void;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (open) setValue(currentNilaiPenyesuaian !== null ? String(currentNilaiPenyesuaian) : "");
  }, [open, currentNilaiPenyesuaian]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const numeric = Number(value);
  const isValid = value !== "" && Number.isInteger(numeric) && numeric >= 0 && numeric <= 100;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ubah-nilai-title"
        onClick={(event) => event.stopPropagation()}
        className="animate-fade-in flex w-[480px] max-w-full flex-col rounded-[20px] bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.1),0px_8px_40px_0px_rgba(0,0,0,0.2)]"
      >
        <div className="flex flex-col gap-4 px-6 pt-6 pb-3">
          <div className="flex items-center justify-between gap-2.5">
            <h2 id="ubah-nilai-title" className="text-lg font-bold text-tertiary-900">
              Ubah Nilai Asli
            </h2>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Tutup"
              className="shrink-0 rounded-lg p-0.5 text-tertiary-500 transition-colors hover:bg-tertiary-100"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-base text-tertiary-600">
            <strong className="font-bold">{participantName}</strong> akan menerima penyesuaian nilai. Pastikan
            sesuai kebijakan sekolah sebelum menyimpan.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 px-6 pt-3 pb-6">
          <div className="flex w-full flex-col gap-2">
            <label htmlFor="nilai-baru" className="text-sm font-semibold text-tertiary-900">
              Penyesuaian Nilai
            </label>
            <div className="flex h-11 items-center gap-3 rounded-lg border border-tertiary-300 bg-white px-4">
              <input
                id="nilai-baru"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={value}
                onChange={(event) => setValue(event.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                className="w-full text-sm text-tertiary-900 placeholder:text-tertiary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 border-t border-tertiary-200 p-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-lg border border-primary-500 px-5 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={() => onSave(numeric)}
            className="flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-primary-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-tertiary-300 disabled:text-tertiary-500"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
