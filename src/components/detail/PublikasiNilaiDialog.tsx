import { FileText, Info, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Assessment } from "../../types/assessment";

export interface NilaiExtreme {
  nama: string;
  nilai: number;
}

// "Publikasikan Nilai" / "Publikasi Perubahan Nilai" confirmation popup, per
// Figma nodes 6028-117692 (first publish) and 6018-114094 (republish) — same
// shell, only the title/description copy differs by `isRepublish`. All the
// assessment data shown (nama, kelas, mapel, jenis, nilai tertinggi/terendah)
// is pulled from the real assessment/roster rather than Figma's placeholders.
export function PublikasiNilaiDialog({
  open,
  isRepublish,
  assessment,
  nilaiTertinggi,
  nilaiTerendah,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  isRepublish: boolean;
  assessment: Assessment;
  nilaiTertinggi: NilaiExtreme | null;
  nilaiTerendah: NilaiExtreme | null;
  onCancel: () => void;
  onConfirm: () => void;
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

  const stats: { label: string; value: string }[] = [
    { label: "Kelas", value: assessment.kelas },
    { label: "Mata Pelajaran", value: assessment.mataPelajaran },
    { label: "Jenis Asesmen", value: assessment.jenis },
    { label: "Total Peserta", value: String(assessment.jumlahPeserta) },
    { label: "Nilai Tertinggi", value: nilaiTertinggi ? `${nilaiTertinggi.nama} (${nilaiTertinggi.nilai})` : "-" },
    { label: "Nilai Terendah", value: nilaiTerendah ? `${nilaiTerendah.nama} (${nilaiTerendah.nilai})` : "-" },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publikasi-nilai-title"
        onClick={(event) => event.stopPropagation()}
        className="animate-fade-in flex w-[900px] max-w-full flex-col gap-5 rounded-[20px] bg-white shadow-[0px_0px_1px_0px_rgba(0,0,0,0.25),0px_1px_1px_0px_rgba(0,0,0,0.05)]"
      >
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-2.5">
            <h2 id="publikasi-nilai-title" className="text-lg font-bold text-tertiary-900">
              {isRepublish ? "Publikasi Perubahan Nilai Asesmen" : "Publikasi Nilai Asesmen"}
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
          <p className="text-base text-tertiary-500">
            Dengan mempublikasikan nilai, maka nilai akan muncul pada portal peserta dan data penilaian pindah ke
            Riwayat Asesmen. Nilai yang sudah dipublikasikan tidak dapat dihapus dari peserta.
          </p>
        </div>

        <div className="px-6">
          <div className="flex flex-col gap-[17px] rounded-[14px] border border-tertiary-300 bg-white px-7 pt-5 pb-[30px]">
            <div className="flex items-center gap-2.5">
              <span className="flex shrink-0 items-center justify-center rounded-full border-2 border-tertiary-300 p-3.5 text-tertiary-500">
                <FileText size={28} />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold text-tertiary-900">{assessment.namaUjian}</span>
                <span className="text-sm font-semibold text-tertiary-900">
                  Nilai Rata-Rata : {assessment.nilaiRataRata}
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-tertiary-200" />

            <div className="flex items-start gap-3 rounded-lg border border-information-500 border-l-4 bg-information-25 p-4">
              <span className="flex shrink-0 items-center justify-center rounded-full bg-information-500 p-1">
                <Info size={16} className="text-white" />
              </span>
              <p className="text-base text-tertiary-900">
                Dengan bangga kami umumkan bahwa semua peserta telah berhasil lulus ujian dengan baik. Selamat
                kepada semua yang telah berusaha keras!
              </p>
            </div>

            <div className="flex flex-wrap gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col gap-1.5">
                  <span className="text-sm text-tertiary-700">{stat.label}</span>
                  <span className="text-base font-semibold text-tertiary-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-tertiary-200 p-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex h-11 w-[120px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg border border-primary-500 px-5 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex h-11 w-[160px] shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-primary-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-400"
          >
            Publikasikan
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
