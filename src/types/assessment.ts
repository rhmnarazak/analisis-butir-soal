export type AssessmentStatus = "Perlu Dinilai" | "Siap Dipublikasi" | "Selesai";

export type AnbusoState =
  | "Tidak Ada Analisis"
  | "Menunggu Penilaian"
  | "Menunggu Publikasi"
  | "Analisis Sekarang"
  | "Lihat Hasil Analisis"
  | "Perbarui Hasil Analisis"
  | "Tidak Dapat Dianalisis";

export interface Assessment {
  id: string;
  namaUjian: string;
  waktuUjian: string;
  jenis: string;
  mataPelajaran: string;
  tingkat: string;
  penilai: string;
  metode: "Online" | "Offline";
  status: AssessmentStatus;
  pesertaDinilai: string;
  nilaiRataRata: string;
  anbusoState: AnbusoState;
  // Detail-page-only fields (not shown in the summary table)
  kelas: string;
  jumlahPeserta: number;
  durasi: string;
  pembuatJadwal: string;
  kkm: number;
  // Offline-only: the uploaded scan/photo of the paper answer sheets.
  lampiran?: string;
  // Set by AssessmentStore.runAnalysis() once an AnBuSo run completes —
  // undefined until the first run. "analisisKind" says whether the most
  // recent run was the first ("run") or a re-run ("update"), which decides
  // the "Analisis Dijalankan :" vs "Analisis Diperbarui :" label.
  dianalisisPada?: string;
  dianalisisOleh?: string;
  analisisKind?: "run" | "update";
  // Set by AssessmentStore.publishNilai() — undefined until nilai is
  // published at least once (shown on the Peserta tab's "Selesai" banner).
  nilaiDipublikasikanPada?: string;
  nilaiDipublikasikanOleh?: string;
  // Set by AssessmentStore.updateNilaiPeserta() when a participant's nilai
  // is edited on an already-"Selesai" assessment — independent of
  // anbusoState, since editing nilai before AnBuSo has ever run
  // (anbusoState still "Analisis Sekarang") still means the published
  // nilai is stale even though there's no analysis result to go stale.
  // Cleared by publishNilai(). Drives needsRepublish() in StatusBadge.tsx.
  perluPublikasiUlang?: boolean;
}

export interface QuestionTypeScore {
  benar: number;
  salah: number;
  kosong: number;
  skor: number;
}

export const QUESTION_TYPE_KEYS = [
  "pilihanGanda",
  "pilihanGandaKompleks",
  "esai",
  "menjodohkan",
  "mengurutkan",
  "benarSalah",
  "pilihanGandaEsai",
  "survei",
] as const;

export type QuestionTypeKey = (typeof QUESTION_TYPE_KEYS)[number];

export type QuestionTypeScores = Record<QuestionTypeKey, QuestionTypeScore>;

export interface Participant extends QuestionTypeScores {
  id: string;
  nama: string;
  nomorPeserta: string;
  kelas: string;
  soalDinilai: number;
  totalSoal: number;
  nilaiAsli: number;
  // null = never manually adjusted (Penyesuaian column shows "-"); once
  // set, it's an absolute replacement score (0-100), not a delta from
  // nilaiAsli, and takes over as the value judged against ABN/kkm.
  nilaiPenyesuaian: number | null;
}

export type DifficultyLevel = "Sangat Mudah" | "Mudah" | "Sedang" | "Sukar" | "Sangat Sukar";
export type DiscriminationLevel = "Rendah Sekali" | "Rendah" | "Sedang" | "Tinggi" | "Tinggi Sekali";
export type ValidityLevel = "Valid" | "Tidak Valid";
export type DistraktorLabel = "Efektif" | "Tidak Efektif";

// Per-soal completeness: "Lengkap" has every applicable metric incl.
// distraktor, "Sebagian" is missing distraktor data, "Tidak Ada" means the
// soal type can't be analyzed at all (e.g. PG Esai, Survei). Derived by
// getAnalisisProgress() in lib/itemAnalysisStats.ts — not stored on the soal.
export type AnalisisProgress = "Lengkap" | "Sebagian" | "Tidak Ada";
// Derived by getHasilAnalisis() in lib/itemAnalysisStats.ts from the 4
// metrics below (per the Validitas/Kesukaran/Daya Pembeda/Distraktor rules)
// — not stored on the soal, so it can never drift out of sync with them.
export type HasilAnalisis = "Layak Digunakan" | "Perlu Ditinjau" | "Perlu Diperbaiki" | "Tidak Dianalisis";

// One lettered answer option — used to render the Soal card (Pilihan Ganda,
// PG Kompleks, Benar/Salah). The Sebaran Skor donut + Analisis Distraktor
// table on the soal detail page only ever read this for jenis "pilihanGanda"
// (per-option student counts + kelompok atas/bawah were only computed for
// true multiple-choice soal), but the option list itself is reused to render
// PG Kompleks (multi-correct, checkbox style) and Benar/Salah (2-option).
export interface AnswerOption {
  letter: string;
  text: string;
  isCorrect: boolean;
  studentCount: number;
  kelAtas: number;
  kelBawah: number;
}

// A left/right pair for jenis "menjodohkan".
export interface MatchingPair {
  kiri: string;
  kanan: string;
}

export interface QuestionAnalysis {
  no: number;
  jenis: QuestionTypeKey;
  cuplikanSoal: string;
  options?: AnswerOption[];
  pasangan?: MatchingPair[];
  // Correct order for jenis "mengurutkan" — the Soal card shows a shuffled
  // copy of this list, Kunci Jawaban shows this exact order.
  urutanBenar?: string[];
  // value = r hitung; label must equal deriveValiditasLabel(value).
  validitas: { value: number; label: ValidityLevel } | null;
  // value = P (proportion correct, 0-1); label must equal deriveKesukaranLabel(value).
  tingkatKesukaran: { value: number; label: DifficultyLevel } | null;
  // value = D (discrimination index, 0-1); label must equal deriveDayaPembedaLabel(value).
  dayaPembeda: { value: number; label: DiscriminationLevel } | null;
  // Only ever set for jenis "pilihanGanda" — value = fraction of wrong
  // options individually picked by >=5% of siswa; label must equal
  // deriveDistraktorLabel(value). See lib/itemAnalysisStats.ts.
  distraktor: { value: number; label: DistraktorLabel } | null;
}
