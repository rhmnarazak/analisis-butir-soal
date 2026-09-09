import type {
  AnalisisProgress,
  AnswerOption,
  DifficultyLevel,
  DiscriminationLevel,
  DistraktorLabel,
  HasilAnalisis,
  QuestionAnalysis,
  ValidityLevel,
} from "../types/assessment";
import { isAnalyzable } from "./soalAnalysis";

export type { AnalisisProgress, HasilAnalisis };

// A valid item analysis needs at least this many participants.
export const MIN_PESERTA_ANALYSIS = 10;

// Pearson product-moment critical value (r tabel), two-tailed alpha 0.05,
// for this assessment's sample size (N=30) — the Validitas rule's threshold.
export const R_TABEL = 0.361;

// ---- Rule A: Validitas — r hitung > r tabel = Valid, else Tidak Valid. ----
export function deriveValiditasLabel(rHitung: number): ValidityLevel {
  return rHitung > R_TABEL ? "Valid" : "Tidak Valid";
}

// ---- Rule B: Kesukaran (P = proportion of siswa answering correctly). ----
// U-shaped: both extremes (0 and 1) are their own tier, everything strictly
// between is banded into Sukar/Sedang/Mudah.
export function deriveKesukaranLabel(p: number): DifficultyLevel {
  if (p <= 0) return "Sangat Sukar";
  if (p <= 0.3) return "Sukar";
  if (p <= 0.7) return "Sedang";
  if (p < 1) return "Mudah";
  return "Sangat Mudah";
}

// ---- Rule C: Daya Pembeda (D = discrimination index). ----
export function deriveDayaPembedaLabel(d: number): DiscriminationLevel {
  if (d <= 0) return "Rendah Sekali";
  if (d <= 0.2) return "Rendah";
  if (d <= 0.4) return "Sedang";
  if (d <= 0.7) return "Tinggi";
  return "Tinggi Sekali";
}

// ---- Rule D: Distraktor — only ever applicable for jenis "pilihanGanda". ----
// value = fraction of wrong options individually picked by >=5% of siswa;
// 100% (every distraktor pulls its weight) = Efektif, anything less = Tidak
// Efektif.
export function deriveDistraktorFromOptions(options: AnswerOption[]): { value: number; label: DistraktorLabel } {
  const wrong = options.filter((opt) => !opt.isCorrect);
  const totalPeserta = options.reduce((sum, opt) => sum + opt.studentCount, 0);
  const effectiveCount = wrong.filter((opt) => totalPeserta > 0 && opt.studentCount / totalPeserta >= 0.05).length;
  const value = wrong.length > 0 ? effectiveCount / wrong.length : 0;
  return { value, label: value >= 1 ? "Efektif" : "Tidak Efektif" };
}

// The "Lihat Hasil Analisis" AnBuSo state has 3 tiers based on peserta
// count — same copy used by both the AnBuSo tab gate card (AnbusoGate) and
// the "Informasi Analisis" card on the full Analisis Butir Soal page, so
// they never drift out of sync.
export function getAnalisisTier(jumlahPeserta: number): { title: string; description: string } {
  if (jumlahPeserta >= 100) {
    return {
      title: "Analisis Sangat Stabil",
      description: "Hasil analisis memiliki tingkat keandalan yang tinggi untuk evaluasi dan pengembangan bank soal.",
    };
  }
  if (jumlahPeserta >= 30) {
    return {
      title: "Analisis Lengkap",
      description: "Hasil analisis dapat digunakan sebagai acuan evaluasi soal.",
    };
  }
  return {
    title: "Analisis Awal",
    description: "Hasil analisis tersedia, namun akurasinya masih terbatas karena jumlah peserta belum mencukupi.",
  };
}

export type DistraktorStatus = DistraktorLabel | "Tidak Dianalisis";

// Kualitas Paket Soal rating — Skor = Layak / Dianalisis x 100%. Bands are
// half-open except the top one: [80,100] Sangat Baik, [60,80) Baik, [40,60)
// Sedang, [20,40) Buruk, [0,20) Sangat Buruk.
export type KualitasLabel = "Sangat Baik" | "Baik" | "Sedang" | "Buruk" | "Sangat Buruk";

export function getKualitasLabel(skorKualitas: number): KualitasLabel {
  if (skorKualitas >= 80) return "Sangat Baik";
  if (skorKualitas >= 60) return "Baik";
  if (skorKualitas >= 40) return "Sedang";
  if (skorKualitas >= 20) return "Buruk";
  return "Sangat Buruk";
}

// The severity tone driving the Ringkasan Kualitas Paket Soal card's colors
// (border/icon/pill/alert) — Sangat Baik and Baik both read as success per
// Figma's ".ringkasanKualitasPaketSoal" component set.
export type KualitasTone = "success" | "warning" | "error";

export function getKualitasTone(label: KualitasLabel): KualitasTone {
  if (label === "Sangat Baik" || label === "Baik") return "success";
  if (label === "Sedang") return "warning";
  return "error";
}

// Reliabilitas Tes (Cronbach's alpha) rating — r=1 Sempurna, [0.9,1) Sangat
// Baik, [0.8,0.9) Baik, [0.7,0.8) Dapat Diterima, (0,0.7) Rendah, r=0 Tidak
// Reliabel.
export type ReliabilitasLabel = "Sempurna" | "Sangat Baik" | "Baik" | "Dapat Diterima" | "Rendah" | "Tidak Reliabel";

export function getReliabilitasLabel(reliabilitas: number): ReliabilitasLabel {
  if (reliabilitas >= 1) return "Sempurna";
  if (reliabilitas >= 0.9) return "Sangat Baik";
  if (reliabilitas >= 0.8) return "Baik";
  if (reliabilitas >= 0.7) return "Dapat Diterima";
  if (reliabilitas > 0) return "Rendah";
  return "Tidak Reliabel";
}

// Same 3-tone mapping as Kualitas Paket Soal: Sempurna/Sangat Baik/Baik are
// success, Dapat Diterima is warning, Rendah/Tidak Reliabel are error.
export function getReliabilitasTone(label: ReliabilitasLabel): KualitasTone {
  if (label === "Sempurna" || label === "Sangat Baik" || label === "Baik") return "success";
  if (label === "Dapat Diterima") return "warning";
  return "error";
}

// ---- Rule E: Analisis (completeness) — Lengkap once Distraktor is also
// analyzed (jenis "pilihanGanda"), Sebagian while it's the only metric
// missing, Tidak Ada when the soal's jenis can't be scored at all. ----
export function getAnalisisProgress(q: QuestionAnalysis): AnalisisProgress {
  if (!q.validitas || !q.tingkatKesukaran || !q.dayaPembeda) return "Tidak Ada";
  return q.distraktor ? "Lengkap" : "Sebagian";
}

// ---- Rule F: Hasil Analisis. Daya Pembeda Rendah/Rendah Sekali is an
// automatic disqualifier; otherwise count how many of the 4 metrics are
// non-ideal ("bermasalah") — 0 => Layak Digunakan, 1-3 => Perlu Ditinjau,
// all 4 => Perlu Diperbaiki. Distraktor is skipped entirely when it wasn't
// analyzed (non-"pilihanGanda" jenis), so it alone can never push a soal to
// "Perlu Diperbaiki" via the all-4-problems path. ----
export function getHasilAnalisis(q: QuestionAnalysis): HasilAnalisis {
  if (!q.validitas || !q.tingkatKesukaran || !q.dayaPembeda) return "Tidak Dianalisis";

  if (q.dayaPembeda.label === "Rendah" || q.dayaPembeda.label === "Rendah Sekali") {
    return "Perlu Diperbaiki";
  }

  let problems = 0;
  if (q.validitas.label !== "Valid") problems += 1;
  if (q.tingkatKesukaran.label !== "Sedang") problems += 1;
  if (q.dayaPembeda.label !== "Tinggi" && q.dayaPembeda.label !== "Tinggi Sekali") problems += 1;
  if (q.distraktor && q.distraktor.label === "Tidak Efektif") problems += 1;

  if (problems >= 4) return "Perlu Diperbaiki";
  if (problems >= 1) return "Perlu Ditinjau";
  return "Layak Digunakan";
}

export function getDistraktorStatus(q: QuestionAnalysis): DistraktorStatus {
  return q.distraktor ? q.distraktor.label : "Tidak Dianalisis";
}

export function getDistraktorPercent(q: QuestionAnalysis): number | null {
  return q.distraktor ? q.distraktor.value * 100 : null;
}

// Default sort for any "which soal need attention" list: most urgent status
// first (Perlu Diperbaiki > Perlu Ditinjau > Layak Digunakan), non-analyzable
// soal pushed to the very end.
export const HASIL_PRIORITY: Record<HasilAnalisis, number> = {
  "Perlu Diperbaiki": 0,
  "Perlu Ditinjau": 1,
  "Layak Digunakan": 2,
  "Tidak Dianalisis": 3,
};

export interface AlasanPerluPerhatian {
  kriteria: "Validitas" | "Tingkat Kesukaran" | "Daya Pembeda" | "Distraktor";
  detail: string;
}

// The exact per-criteria breakdown behind a "Perlu Ditinjau"/"Perlu
// Diperbaiki" verdict — same 4 checks as getHasilAnalisis()'s "problems"
// count, kept side by side so they can't drift apart. Empty for a soal
// that's "Layak Digunakan" (nothing flagged) or "Tidak Dianalisis".
export function getAlasanPerluPerhatian(q: QuestionAnalysis): AlasanPerluPerhatian[] {
  if (!q.validitas || !q.tingkatKesukaran || !q.dayaPembeda) return [];

  const alasan: AlasanPerluPerhatian[] = [];
  if (q.validitas.label !== "Valid") {
    alasan.push({ kriteria: "Validitas", detail: q.validitas.label });
  }
  if (q.tingkatKesukaran.label !== "Sedang") {
    alasan.push({ kriteria: "Tingkat Kesukaran", detail: q.tingkatKesukaran.label });
  }
  if (q.dayaPembeda.label !== "Tinggi" && q.dayaPembeda.label !== "Tinggi Sekali") {
    alasan.push({ kriteria: "Daya Pembeda", detail: q.dayaPembeda.label });
  }
  if (q.distraktor && q.distraktor.label === "Tidak Efektif") {
    alasan.push({ kriteria: "Distraktor", detail: "Tidak Efektif" });
  }
  return alasan;
}

export interface AnalisisStats {
  totalSoal: number;
  totalAnalyzable: number;
  layak: number;
  ditinjau: number;
  diperbaiki: number;
  tidakDianalisis: number;
  skorKualitas: number;
  kualitasLabel: KualitasLabel;
  validCount: number;
  tidakValidCount: number;
  kesukaranCount: Record<DifficultyLevel, number>;
  avgKesukaran: number;
  dayaPembedaCount: Record<DiscriminationLevel, number>;
  avgDayaPembeda: number;
  efektifCount: number;
  tidakEfektifCount: number;
  distraktorApplicableCount: number;
  reliabilitas: number;
  reliabilitasLabel: ReliabilitasLabel;
}

export function buildAnalisisStats(questions: QuestionAnalysis[], reliabilitas = 0.94): AnalisisStats {
  const analyzable = questions.filter(isAnalyzable);
  const totalSoal = questions.length;
  const totalAnalyzable = analyzable.length;

  const hasilList = questions.map(getHasilAnalisis);
  const layak = hasilList.filter((h) => h === "Layak Digunakan").length;
  const ditinjau = hasilList.filter((h) => h === "Perlu Ditinjau").length;
  const diperbaiki = hasilList.filter((h) => h === "Perlu Diperbaiki").length;
  const tidakDianalisis = hasilList.filter((h) => h === "Tidak Dianalisis").length;

  const skorKualitas = totalAnalyzable > 0 ? (layak / totalAnalyzable) * 100 : 0;
  const kualitasLabel = getKualitasLabel(skorKualitas);

  const validCount = analyzable.filter((q) => q.validitas?.label === "Valid").length;
  const tidakValidCount = analyzable.filter((q) => q.validitas?.label === "Tidak Valid").length;

  const kesukaranCount: Record<DifficultyLevel, number> = {
    "Sangat Mudah": 0,
    Mudah: 0,
    Sedang: 0,
    Sukar: 0,
    "Sangat Sukar": 0,
  };
  analyzable.forEach((q) => {
    if (q.tingkatKesukaran) kesukaranCount[q.tingkatKesukaran.label] += 1;
  });
  const kesukaranValues = analyzable
    .map((q) => q.tingkatKesukaran?.value)
    .filter((v): v is number => v !== undefined);
  const avgKesukaran = kesukaranValues.length
    ? kesukaranValues.reduce((a, b) => a + b, 0) / kesukaranValues.length
    : 0;

  const dayaPembedaCount: Record<DiscriminationLevel, number> = {
    "Tinggi Sekali": 0,
    Tinggi: 0,
    Sedang: 0,
    Rendah: 0,
    "Rendah Sekali": 0,
  };
  analyzable.forEach((q) => {
    if (q.dayaPembeda) dayaPembedaCount[q.dayaPembeda.label] += 1;
  });
  const dayaPembedaValues = analyzable
    .map((q) => q.dayaPembeda?.value)
    .filter((v): v is number => v !== undefined);
  const avgDayaPembeda = dayaPembedaValues.length
    ? dayaPembedaValues.reduce((a, b) => a + b, 0) / dayaPembedaValues.length
    : 0;

  const distraktorApplicableCount = questions.filter((q) => q.distraktor !== null).length;
  const efektifCount = questions.filter((q) => q.distraktor?.label === "Efektif").length;
  const tidakEfektifCount = distraktorApplicableCount - efektifCount;

  // Reliability (Cronbach's alpha proxy) is authored directly per
  // assessment fixture (see getReliabilitasForAssessment in
  // data/questionAnalysis.ts), not derived from daya pembeda — defaults to
  // 0.94 (Sangat Baik) when the caller doesn't override it.
  const reliabilitasLabel = getReliabilitasLabel(reliabilitas);

  return {
    totalSoal,
    totalAnalyzable,
    layak,
    ditinjau,
    diperbaiki,
    tidakDianalisis,
    skorKualitas,
    kualitasLabel,
    validCount,
    tidakValidCount,
    kesukaranCount,
    avgKesukaran,
    dayaPembedaCount,
    avgDayaPembeda,
    efektifCount,
    tidakEfektifCount,
    distraktorApplicableCount,
    reliabilitas,
    reliabilitasLabel,
  };
}
