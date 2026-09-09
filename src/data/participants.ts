import type { Participant, QuestionTypeKey, QuestionTypeScores } from "../types/assessment";

// 10 questions total, spread across all 8 question types (No 1-3 Pilihan
// Ganda, No 4-10 one question each of the remaining types).
const QUESTION_COUNTS: Record<QuestionTypeKey, number> = {
  pilihanGanda: 3,
  pilihanGandaKompleks: 1,
  esai: 1,
  menjodohkan: 1,
  mengurutkan: 1,
  benarSalah: 1,
  pilihanGandaEsai: 1,
  survei: 1,
};
const TOTAL_SOAL = Object.values(QUESTION_COUNTS).reduce((sum, n) => sum + n, 0);

// Grading order: auto-graded Pilihan Ganda first, then the manually-graded
// types in question order — so a partially graded participant always has
// their earlier question types finished and later ones still pending.
const GRADING_ORDER: QuestionTypeKey[] = [
  "pilihanGanda",
  "pilihanGandaKompleks",
  "esai",
  "menjodohkan",
  "mengurutkan",
  "benarSalah",
  "pilihanGandaEsai",
  "survei",
];

// Assessment covers kelas X-A, X-B, X-C (10 peserta each) — see assessments.ts.
const NAMES: { nama: string; kelas: string }[] = [
  { nama: "Agung Hidayat", kelas: "X-A" },
  { nama: "Annisa Rahmi", kelas: "X-A" },
  { nama: "Dodit Mulyanto Putra Diningrat", kelas: "X-A" },
  { nama: "Eka Saputra", kelas: "X-A" },
  { nama: "Lidia Putri", kelas: "X-A" },
  { nama: "Nindy Hanifa", kelas: "X-A" },
  { nama: "Bayu Pratama", kelas: "X-A" },
  { nama: "Citra Dewi", kelas: "X-A" },
  { nama: "Dimas Anggara", kelas: "X-A" },
  { nama: "Fitri Handayani", kelas: "X-A" },
  { nama: "Gilang Ramadhan", kelas: "X-B" },
  { nama: "Hana Wulandari", kelas: "X-B" },
  { nama: "Irfan Maulana", kelas: "X-B" },
  { nama: "Joko Susilo", kelas: "X-B" },
  { nama: "Kartika Sari", kelas: "X-B" },
  { nama: "Lukman Hakim", kelas: "X-B" },
  { nama: "Mega Puspita", kelas: "X-B" },
  { nama: "Nanda Pratiwi", kelas: "X-B" },
  { nama: "Oki Setiawan", kelas: "X-B" },
  { nama: "Putri Ayu Lestari", kelas: "X-B" },
  { nama: "Rangga Saputra", kelas: "X-C" },
  { nama: "Sinta Marlina", kelas: "X-C" },
  { nama: "Taufik Hidayat", kelas: "X-C" },
  { nama: "Umi Kalsum", kelas: "X-C" },
  { nama: "Vino Bastian", kelas: "X-C" },
  { nama: "Wulan Andini", kelas: "X-C" },
  { nama: "Yusuf Ramadhan", kelas: "X-C" },
  { nama: "Zahra Amelia", kelas: "X-C" },
  { nama: "Aditya Nugraha", kelas: "X-C" },
  { nama: "Bella Safitri", kelas: "X-C" },
];

const PARTIAL_SOAL_DINILAI_CYCLE = [3, 5, 7, 4, 8, 6];
const CORRECTNESS_CYCLE = [0.8, 0.6, 1, 0.7, 0.9, 0.5, 0.8, 0.7, 0.6, 0.9];
// null = never manually adjusted; a set value is an absolute replacement
// score (0-100), independent of nilaiAsli — mirrors a teacher overriding a
// student's final grade after review (e.g. partial credit, appeal).
const PENYESUAIAN_CYCLE: (number | null)[] = [null, 65, null, 82, null, 45, 90, null, 70, null];

function buildParticipant(index: number, nama: string, kelas: string): Participant {
  const nomorPeserta = `${2024100231 + index}`;

  // Grading progress pattern: some untouched, some mid-grading, most fully
  // graded — mirrors a real class roster.
  let soalDinilai: number;
  if (index % 6 === 0) {
    soalDinilai = 0;
  } else if (index % 4 === 0) {
    soalDinilai = PARTIAL_SOAL_DINILAI_CYCLE[index % PARTIAL_SOAL_DINILAI_CYCLE.length];
  } else {
    soalDinilai = TOTAL_SOAL;
  }

  const correctness = CORRECTNESS_CYCLE[index % CORRECTNESS_CYCLE.length];

  let remainingGraded = soalDinilai;
  let totalBenar = 0;
  const scores = {} as QuestionTypeScores;
  for (const type of GRADING_ORDER) {
    const typeCount = QUESTION_COUNTS[type];
    const graded = Math.min(remainingGraded, typeCount);
    remainingGraded -= graded;
    const benar = Math.min(graded, Math.round(graded * correctness));
    const salah = graded - benar;
    const kosong = typeCount - graded;
    const skor = benar * 10;
    scores[type] = { benar, salah, kosong, skor };
    totalBenar += benar;
  }

  const nilaiAsli = totalBenar * 10;
  const nilaiPenyesuaian = soalDinilai === TOTAL_SOAL ? PENYESUAIAN_CYCLE[index % PENYESUAIAN_CYCLE.length] : null;

  return {
    id: `p${index + 1}`,
    nama,
    nomorPeserta,
    kelas,
    soalDinilai,
    totalSoal: TOTAL_SOAL,
    ...scores,
    nilaiAsli,
    nilaiPenyesuaian,
  };
}

export const participants: Participant[] = NAMES.map((n, index) =>
  buildParticipant(index, n.nama, n.kelas),
);
