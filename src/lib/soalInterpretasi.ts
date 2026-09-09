import { AlertOctagon, AlertTriangle, Ban, CircleCheck, type LucideIcon } from "lucide-react";
import type { DifficultyLevel, DiscriminationLevel, QuestionAnalysis } from "../types/assessment";

export type InterpretasiSeverity = "success" | "warning" | "error" | "neutral";
export interface InterpretasiPoint {
  severity: InterpretasiSeverity;
  text: string;
}

// Status-chip styling per severity — matches the .statusNew component
// variants (Status=Success/Warning/Error/Tertiary): 5993-113335 (error),
// 5993-113353 (warning), 5993-113457 (tertiary). Shared by SoalDetailPage's
// bullet list and SoalPerluPerhatianPage's table cells so the same
// severity always reads the same color/icon everywhere.
export const CHIP_STYLE: Record<InterpretasiSeverity, { className: string; Icon: LucideIcon }> = {
  success: { className: "bg-success-50 border-success-200 text-success-500", Icon: CircleCheck },
  warning: { className: "bg-secondary-50 border-secondary-200 text-warning-500", Icon: AlertTriangle },
  error: { className: "bg-error-50 border-error-200 text-error-500", Icon: AlertOctagon },
  neutral: { className: "bg-tertiary-50 border-tertiary-200 text-tertiary-600", Icon: Ban },
};

// Kesukaran is U-shaped (both extremes are weak discriminators): Sedang is
// the ideal middle, Mudah/Sukar are a caution, Sangat Mudah/Sangat Sukar are
// a hard flag.
export const KESUKARAN_INTERPRETASI: Record<DifficultyLevel, InterpretasiPoint> = {
  "Sangat Sukar": { severity: "error", text: "Soal sangat sukar karena tidak ada peserta yang menjawab dengan benar." },
  Sukar: { severity: "warning", text: "Soal tergolong sukar karena hanya sebagian kecil peserta yang menjawab dengan benar." },
  Sedang: { severity: "success", text: "Tingkat kesukaran soal tergolong sedang." },
  Mudah: { severity: "warning", text: "Soal tergolong mudah karena sebagian besar peserta menjawab dengan benar." },
  "Sangat Mudah": { severity: "error", text: "Sebagian besar atau seluruh peserta menjawab soal dengan benar." },
};

// Daya Pembeda is monotonic (higher is always better).
export const DAYA_PEMBEDA_INTERPRETASI: Record<DiscriminationLevel, InterpretasiPoint> = {
  "Rendah Sekali": { severity: "error", text: "Soal belum mampu membedakan peserta berdasarkan tingkat kemampuannya." },
  Rendah: { severity: "error", text: "Soal masih kurang mampu membedakan peserta berdasarkan tingkat kemampuannya." },
  Sedang: { severity: "warning", text: "Soal cukup mampu membedakan peserta berdasarkan tingkat kemampuannya." },
  Tinggi: { severity: "success", text: "Soal mampu membedakan peserta berdasarkan tingkat kemampuannya." },
  "Tinggi Sekali": { severity: "success", text: "Soal sangat mampu membedakan peserta berdasarkan tingkat kemampuannya." },
};

export interface Interpretasi {
  validitas: InterpretasiPoint;
  kesukaran: InterpretasiPoint;
  dayaPembeda: InterpretasiPoint;
  distraktor: InterpretasiPoint;
}

// Always exactly 4 points — Validitas, Kesukaran, Daya Pembeda, Efektivitas
// Distraktor — falling back to a neutral "tidak dianalisis" point whenever
// the underlying stat is null for this soal's jenis.
export function buildInterpretasi(q: QuestionAnalysis): Interpretasi {
  const validitas: InterpretasiPoint = q.validitas
    ? q.validitas.label === "Valid"
      ? { severity: "success", text: "Soal valid dan hasil jawabannya berkaitan dengan hasil tes secara keseluruhan." }
      : { severity: "error", text: "Hasil jawaban soal belum cukup berkaitan dengan hasil tes secara keseluruhan." }
    : { severity: "neutral", text: "Validitas tidak dianalisis untuk soal ini." };

  const kesukaran: InterpretasiPoint = q.tingkatKesukaran
    ? KESUKARAN_INTERPRETASI[q.tingkatKesukaran.label]
    : { severity: "neutral", text: "Tingkat kesukaran tidak dianalisis untuk soal ini." };

  const dayaPembeda: InterpretasiPoint = q.dayaPembeda
    ? DAYA_PEMBEDA_INTERPRETASI[q.dayaPembeda.label]
    : { severity: "neutral", text: "Daya pembeda tidak dianalisis untuk soal ini." };

  const distraktor: InterpretasiPoint = q.distraktor
    ? q.distraktor.label === "Efektif"
      ? { severity: "success", text: "Pilihan jawaban salah berfungsi sebagai pengecoh." }
      : { severity: "error", text: "Terdapat pilihan jawaban salah yang kurang berfungsi sebagai pengecoh." }
    : { severity: "neutral", text: "Efetivitas distraktor tidak dianalisis untuk soal ini." };

  return { validitas, kesukaran, dayaPembeda, distraktor };
}

// Flat-list form of buildInterpretasi(), for callers (SoalDetailPage's
// bullet list) that just want the 4 points in display order.
export function buildInterpretasiList(q: QuestionAnalysis): InterpretasiPoint[] {
  const { validitas, kesukaran, dayaPembeda, distraktor } = buildInterpretasi(q);
  return [validitas, kesukaran, dayaPembeda, distraktor];
}
