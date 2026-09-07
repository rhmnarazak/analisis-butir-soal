import { Eye, SquarePen, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { MetodeBadge, StatusBadge } from "../assessment/StatusBadge";
import type { Assessment } from "../../types/assessment";

function Divider() {
  return <div className="h-px w-full bg-tertiary-300" />;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5">
      <span className="text-xs text-tertiary-600">{label}</span>
      <span className="text-sm font-semibold text-tertiary-900">{children}</span>
    </div>
  );
}

export function SummaryCard({ assessment }: { assessment: Assessment }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-tertiary-300 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-4">
          <h2 className="text-lg font-semibold text-tertiary-900">
            Ringkasan: {assessment.namaUjian}
          </h2>
          <StatusBadge status={assessment.status} />
        </div>
        <button
          type="button"
          className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-primary-500 px-3 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50 active:bg-primary-100"
        >
          <Eye size={16} />
          Lihat Selengkapnya
        </button>
      </div>

      <Divider />

      <div className="flex flex-col gap-6 rounded-lg border border-tertiary-200 bg-tertiary-25 p-6">
        <div className="flex flex-wrap gap-6">
          <Field label="Jenis">{assessment.jenis}</Field>
          <Field label="Mata Pelajaran">{assessment.mataPelajaran}</Field>
          <Field label="Tingkat">{assessment.tingkat}</Field>
          <Field label="Kelas">{assessment.kelas}</Field>
          <Field label="Jumlah Peserta">{assessment.jumlahPeserta}</Field>
          <Field label="Metode">
            <MetodeBadge metode={assessment.metode} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-6">
          <Field label="Waktu">
            <span className="whitespace-pre-line">{assessment.waktuUjian}</span>
          </Field>
          <Field label="Durasi">{assessment.durasi}</Field>
          <Field label="Pembuat Jadwal">{assessment.pembuatJadwal}</Field>
          <Field label="Penilai">
            <span className="flex items-center gap-1">
              <span className="truncate">{assessment.penilai}</span>
              {assessment.status === "Perlu Dinilai" && (
                <SquarePen size={14} className="shrink-0 text-primary-500" />
              )}
            </span>
          </Field>
          <Field label="Peserta Dinilai">{assessment.pesertaDinilai}</Field>
          <Field label="Nilai Rata-rata">{assessment.nilaiRataRata}</Field>
        </div>

        {assessment.metode === "Offline" && (
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-tertiary-600">Lampiran</span>
              <span className="text-sm font-semibold text-tertiary-900">
                {assessment.lampiran ? (
                  <span className="text-information-500">{assessment.lampiran}</span>
                ) : (
                  "Tidak Ada Lampiran"
                )}
              </span>
            </div>
            <button
              type="button"
              className={`flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-sm font-semibold transition-colors ${
                assessment.lampiran
                  ? "border-error-500 text-error-500 hover:bg-error-50"
                  : "border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100"
              }`}
            >
              <Upload size={16} />
              {assessment.lampiran ? "Ganti Lampiran" : "Unggah Lampiran"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
