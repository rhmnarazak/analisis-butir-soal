import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// "Ubah Nilai" popup for a single participant. Nilai Penyesuaian is an
// absolute replacement score (0-100, see src/lib/participantStatus.ts),
// so this dialog just captures that one number — pre-filled with the
// current override when re-editing, blank ("belum diisi") the first time.
export function UbahNilaiDialog({
  open,
  participantName,
  nilaiAsli,
  currentNilaiPenyesuaian,
  onCancel,
  onSave,
}: {
  open: boolean;
  participantName: string;
  nilaiAsli: number;
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
        className="animate-fade-in flex w-[420px] max-w-full flex-col gap-5 rounded-[20px] bg-white p-6 shadow-[0px_0px_3px_0px_rgba(0,0,0,0.1),0px_4px_20px_0px_rgba(0,0,0,0.15)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 id="ubah-nilai-title" className="text-lg font-semibold text-tertiary-900">
              Ubah Nilai
            </h2>
            <p className="text-sm text-tertiary-600">{participantName}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup"
            className="shrink-0 rounded-lg p-1 text-tertiary-500 transition-colors hover:bg-tertiary-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-tertiary-200 bg-tertiary-25 px-4 py-3 text-sm">
          <span className="text-tertiary-600">Nilai Asli</span>
          <span className="font-semibold text-tertiary-900">{nilaiAsli}</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="nilai-baru" className="text-sm font-semibold text-tertiary-900">
            Nilai Baru
          </label>
          <input
            id="nilai-baru"
            type="text"
            inputMode="numeric"
            placeholder="Masukkan nilai (0-100)"
            value={value}
            onChange={(event) => setValue(event.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
            className="h-11 rounded-lg border border-tertiary-300 bg-white px-4 text-sm font-semibold text-tertiary-900 focus:border-primary-500 focus:outline-none"
          />
          {value !== "" && !isValid && <span className="text-xs text-error-500">Nilai harus di antara 0-100.</span>}
        </div>

        <div className="flex gap-3">
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
            className="flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-primary-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:bg-tertiary-300"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
