import type { Assessment } from "../types/assessment";

// Shown for "Lihat Hasil Analisis"/"Perbarui Hasil Analisis" rows that were
// never actually run through AssessmentStore.runAnalysis() (the static QA
// fixtures in data/assessments.ts) — keeps their info block looking the
// same as before this feature existed.
const FALLBACK_TANGGAL = "08 Okt 2024, 12.30 WIB";
const FALLBACK_OLEH = "Abdul Razak";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function formatAnalisisTimestamp(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mon = MONTHS[date.getMonth()];
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${dd} ${mon} ${date.getFullYear()}, ${hh}.${mm} WIB`;
}

// "Analisis Dijalankan :" for a soal's first-ever run, "Analisis Diperbarui
// :" once it's been re-run at least once — shared by AnbusoGate.tsx and
// AnalisisDetailPage.tsx so the two call sites can't drift.
export function getAnalisisRunInfo(assessment: Assessment): { label: string; tanggal: string; oleh: string } {
  return {
    label: assessment.analisisKind === "update" ? "Analisis Diperbarui :" : "Analisis Dijalankan :",
    tanggal: assessment.dianalisisPada ?? FALLBACK_TANGGAL,
    oleh: assessment.dianalisisOleh ?? FALLBACK_OLEH,
  };
}
