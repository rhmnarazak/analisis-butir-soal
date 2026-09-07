import type { AnswerOption, MatchingPair, QuestionAnalysis, QuestionTypeKey } from "../types/assessment";

// Matches Case_1_AnBuSo.md exactly.
export const questionAnalysis: QuestionAnalysis[] = [
  {
    no: 1,
    jenis: "pilihanGanda",
    cuplikanSoal: "Akar-akar persamaan kuadrat x² - 5x + 6 = 0 adalah...",
    options: [
      { letter: "A", text: "x = 2 dan x = 3", isCorrect: true, studentCount: 13, kelAtas: 12, kelBawah: 1 },
      { letter: "B", text: "x = -2 dan x = -3", isCorrect: false, studentCount: 8, kelAtas: 1, kelBawah: 7 },
      { letter: "C", text: "x = 2 dan x = -3", isCorrect: false, studentCount: 5, kelAtas: 1, kelBawah: 4 },
      { letter: "D", text: "x = -2 dan x = 3", isCorrect: false, studentCount: 4, kelAtas: 1, kelBawah: 3 },
    ],
    // 3/3 distraktor picked by >=5% siswa (B 26,7%, C 16,7%, D 13,3%) = 100%.
    validitas: { value: 0.82, label: "Valid" },
    tingkatKesukaran: { value: 0.44, label: "Sedang" },
    dayaPembeda: { value: 0.62, label: "Tinggi" },
    distraktor: { value: 1, label: "Efektif" },
  },
  {
    no: 2,
    jenis: "pilihanGanda",
    cuplikanSoal: "Perhatikan grafik fungsi kuadrat berikut. Titik puncak grafik tersebut adalah...",
    options: [
      { letter: "A", text: "(-1, 4)", isCorrect: false, studentCount: 3, kelAtas: 1, kelBawah: 2 },
      { letter: "B", text: "(1, -4)", isCorrect: true, studentCount: 22, kelAtas: 13, kelBawah: 9 },
      { letter: "C", text: "(2, 4)", isCorrect: false, studentCount: 2, kelAtas: 0, kelBawah: 2 },
      { letter: "D", text: "(-2, -4)", isCorrect: false, studentCount: 3, kelAtas: 1, kelBawah: 2 },
    ],
    // 3/3 distraktor picked by >=5% siswa (A 10%, C 6,7%, D 10%) = 100%.
    validitas: { value: 0.82, label: "Valid" },
    tingkatKesukaran: { value: 0.75, label: "Mudah" },
    dayaPembeda: { value: 0.98, label: "Tinggi Sekali" },
    distraktor: { value: 1, label: "Efektif" },
  },
  {
    no: 3,
    jenis: "pilihanGanda",
    cuplikanSoal: "Nilai limit fungsi lim(x→2) (x² - 4)/(x - 2) adalah...",
    options: [
      { letter: "A", text: "0", isCorrect: false, studentCount: 1, kelAtas: 0, kelBawah: 1 },
      { letter: "B", text: "2", isCorrect: false, studentCount: 10, kelAtas: 4, kelBawah: 6 },
      { letter: "C", text: "4", isCorrect: true, studentCount: 13, kelAtas: 9, kelBawah: 4 },
      { letter: "D", text: "Tidak terdefinisi", isCorrect: false, studentCount: 6, kelAtas: 2, kelBawah: 4 },
    ],
    // 2/3 distraktor picked by >=5% siswa (A 3,3% ineffective, B 33,3%, D 20%) = 66,7%.
    validitas: { value: 0.82, label: "Valid" },
    tingkatKesukaran: { value: 0.44, label: "Sedang" },
    dayaPembeda: { value: 0.34, label: "Sedang" },
    distraktor: { value: 2 / 3, label: "Tidak Efektif" },
  },
  {
    no: 4,
    jenis: "pilihanGandaKompleks",
    cuplikanSoal: "Sudut antara vektor a = (1, 2) dan b = (3, -1) adalah...",
    options: [
      { letter: "A", text: "Hasil kali titik (dot product) kedua vektor adalah 1", isCorrect: true, studentCount: 0, kelAtas: 0, kelBawah: 0 },
      { letter: "B", text: "Panjang vektor a adalah √5", isCorrect: true, studentCount: 0, kelAtas: 0, kelBawah: 0 },
      { letter: "C", text: "Kedua vektor saling tegak lurus", isCorrect: false, studentCount: 0, kelAtas: 0, kelBawah: 0 },
      { letter: "D", text: "Sudut antara kedua vektor lebih dari 90°", isCorrect: false, studentCount: 0, kelAtas: 0, kelBawah: 0 },
    ],
    validitas: { value: 0.82, label: "Valid" },
    tingkatKesukaran: { value: 0.44, label: "Sedang" },
    dayaPembeda: { value: 0.62, label: "Tinggi" },
    distraktor: null,
  },
  {
    no: 5,
    jenis: "esai",
    cuplikanSoal: "Nilai dari integral tak tentu ∫(3x² + 2x) dx adalah...",
    validitas: { value: 0.82, label: "Valid" },
    tingkatKesukaran: { value: 0.27, label: "Sukar" },
    dayaPembeda: { value: 0.62, label: "Tinggi" },
    distraktor: null,
  },
  {
    no: 6,
    jenis: "menjodohkan",
    cuplikanSoal: "Sebuah kubus memiliki panjang rusuk 6 cm. Volume kubus tersebut adalah...",
    pasangan: [
      { kiri: "Rusuk", kanan: "s = 6 cm" },
      { kiri: "Volume", kanan: "V = s³" },
      { kiri: "Luas Permukaan", kanan: "L = 6s²" },
      { kiri: "Diagonal Ruang", kanan: "d = s√3" },
    ],
    validitas: { value: 0.82, label: "Valid" },
    tingkatKesukaran: { value: 0.44, label: "Sedang" },
    dayaPembeda: { value: 0.62, label: "Tinggi" },
    distraktor: null,
  },
  {
    no: 7,
    jenis: "mengurutkan",
    cuplikanSoal: "Persamaan garis yang melalui titik (2, 3) dan sejajar dengan garis y = 2x + 1 adalah...",
    urutanBenar: [
      "Tentukan gradien garis y = 2x + 1, yaitu m = 2",
      "Gunakan rumus garis melalui satu titik: y - y₁ = m(x - x₁)",
      "Substitusikan titik (2, 3): y - 3 = 2(x - 2)",
      "Sederhanakan menjadi bentuk y = 2x - 1",
    ],
    validitas: { value: 0.82, label: "Valid" },
    tingkatKesukaran: { value: 0.44, label: "Sedang" },
    dayaPembeda: { value: 0.98, label: "Tinggi Sekali" },
    distraktor: null,
  },
  {
    no: 8,
    jenis: "benarSalah",
    cuplikanSoal: "Pernyataan: median dari data 4, 7, 8, 5, 9, 6, 10 adalah 7.",
    options: [
      { letter: "A", text: "Benar", isCorrect: true, studentCount: 8, kelAtas: 7, kelBawah: 1 },
      { letter: "B", text: "Salah", isCorrect: false, studentCount: 22, kelAtas: 8, kelBawah: 14 },
    ],
    validitas: { value: 0.82, label: "Valid" },
    tingkatKesukaran: { value: 0.27, label: "Sukar" },
    dayaPembeda: { value: 0.62, label: "Tinggi" },
    distraktor: null,
  },
  {
    no: 9,
    jenis: "pilihanGandaEsai",
    cuplikanSoal:
      "Jelaskan langkah-langkah menyelesaikan sistem persamaan linear dua variabel berikut, lalu tentukan himpunan penyelesaiannya.",
    validitas: null,
    tingkatKesukaran: null,
    dayaPembeda: null,
    distraktor: null,
  },
  {
    no: 10,
    jenis: "survei",
    cuplikanSoal: "Seberapa yakin kamu dengan jawabanmu pada soal-soal di atas?",
    validitas: null,
    tingkatKesukaran: null,
    dayaPembeda: null,
    distraktor: null,
  },
];

// A paket soal where every soal is PG Esai/Survei — for AnBuSo test
// assessments that need to demonstrate the "Tidak Dapat Dianalisis (jenis
// soal)" gate, where no soal in the package qualifies for analysis at all.
export const nonAnalyzableQuestions: QuestionAnalysis[] = [
  {
    no: 1,
    jenis: "pilihanGandaEsai",
    cuplikanSoal:
      "Jelaskan langkah-langkah menyelesaikan sistem persamaan linear dua variabel berikut, lalu tentukan himpunan penyelesaiannya.",
    validitas: null,
    tingkatKesukaran: null,
    dayaPembeda: null,
    distraktor: null,
  },
  {
    no: 2,
    jenis: "survei",
    cuplikanSoal: "Seberapa yakin kamu dengan jawabanmu pada soal-soal di atas?",
    validitas: null,
    tingkatKesukaran: null,
    dayaPembeda: null,
    distraktor: null,
  },
];

// ---- "Lihat Hasil Analisis" Kualitas Paket Soal QA fixtures (assessment
// ids 19-25) — one per Figma ".ringkasanKualitasPaketSoal" variant, so each
// Kualitas/Reliabilitas band can be opened and checked directly. All 7 reuse
// the same 8 analyzable + 2 non-analyzable soal shapes (jenis/cuplikan/
// options), varying only the 4 metrics per soal so getHasilAnalisis lands on
// the exact layak/ditinjau/diperbaiki counts Figma shows for that variant.
const KUALITAS_FIXTURE_SHAPES: {
  no: number;
  jenis: QuestionTypeKey;
  cuplikanSoal: string;
  options?: AnswerOption[];
  pasangan?: MatchingPair[];
  urutanBenar?: string[];
}[] = [
  {
    no: 1,
    jenis: "pilihanGanda",
    cuplikanSoal: "Akar-akar persamaan kuadrat x² - 5x + 6 = 0 adalah...",
    options: [
      { letter: "A", text: "x = 2 dan x = 3", isCorrect: true, studentCount: 13, kelAtas: 12, kelBawah: 1 },
      { letter: "B", text: "x = -2 dan x = -3", isCorrect: false, studentCount: 8, kelAtas: 1, kelBawah: 7 },
      { letter: "C", text: "x = 2 dan x = -3", isCorrect: false, studentCount: 5, kelAtas: 1, kelBawah: 4 },
      { letter: "D", text: "x = -2 dan x = 3", isCorrect: false, studentCount: 4, kelAtas: 1, kelBawah: 3 },
    ],
  },
  {
    no: 2,
    jenis: "pilihanGanda",
    cuplikanSoal: "Perhatikan grafik fungsi kuadrat berikut. Titik puncak grafik tersebut adalah...",
    options: [
      { letter: "A", text: "(-1, 4)", isCorrect: false, studentCount: 3, kelAtas: 1, kelBawah: 2 },
      { letter: "B", text: "(1, -4)", isCorrect: true, studentCount: 22, kelAtas: 13, kelBawah: 9 },
      { letter: "C", text: "(2, 4)", isCorrect: false, studentCount: 2, kelAtas: 0, kelBawah: 2 },
      { letter: "D", text: "(-2, -4)", isCorrect: false, studentCount: 3, kelAtas: 1, kelBawah: 2 },
    ],
  },
  {
    no: 3,
    jenis: "pilihanGanda",
    cuplikanSoal: "Nilai limit fungsi lim(x→2) (x² - 4)/(x - 2) adalah...",
    // 3/3 distraktor picked by >=5% siswa (A 6,7%, B 16,7%, D 13,3%) = 100%.
    options: [
      { letter: "A", text: "0", isCorrect: false, studentCount: 2, kelAtas: 0, kelBawah: 2 },
      { letter: "B", text: "2", isCorrect: false, studentCount: 5, kelAtas: 1, kelBawah: 4 },
      { letter: "C", text: "4", isCorrect: true, studentCount: 19, kelAtas: 14, kelBawah: 5 },
      { letter: "D", text: "Tidak terdefinisi", isCorrect: false, studentCount: 4, kelAtas: 1, kelBawah: 3 },
    ],
  },
  {
    no: 4,
    jenis: "pilihanGandaKompleks",
    cuplikanSoal: "Sudut antara vektor a = (1, 2) dan b = (3, -1) adalah...",
    options: [
      { letter: "A", text: "Hasil kali titik (dot product) kedua vektor adalah 1", isCorrect: true, studentCount: 0, kelAtas: 0, kelBawah: 0 },
      { letter: "B", text: "Panjang vektor a adalah √5", isCorrect: true, studentCount: 0, kelAtas: 0, kelBawah: 0 },
      { letter: "C", text: "Kedua vektor saling tegak lurus", isCorrect: false, studentCount: 0, kelAtas: 0, kelBawah: 0 },
      { letter: "D", text: "Sudut antara kedua vektor lebih dari 90°", isCorrect: false, studentCount: 0, kelAtas: 0, kelBawah: 0 },
    ],
  },
  {
    no: 5,
    jenis: "esai",
    cuplikanSoal: "Nilai dari integral tak tentu ∫(3x² + 2x) dx adalah...",
  },
  {
    no: 6,
    jenis: "menjodohkan",
    cuplikanSoal: "Sebuah kubus memiliki panjang rusuk 6 cm. Volume kubus tersebut adalah...",
    pasangan: [
      { kiri: "Rusuk", kanan: "s = 6 cm" },
      { kiri: "Volume", kanan: "V = s³" },
      { kiri: "Luas Permukaan", kanan: "L = 6s²" },
      { kiri: "Diagonal Ruang", kanan: "d = s√3" },
    ],
  },
  {
    no: 7,
    jenis: "mengurutkan",
    cuplikanSoal: "Persamaan garis yang melalui titik (2, 3) dan sejajar dengan garis y = 2x + 1 adalah...",
    urutanBenar: [
      "Tentukan gradien garis y = 2x + 1, yaitu m = 2",
      "Gunakan rumus garis melalui satu titik: y - y₁ = m(x - x₁)",
      "Substitusikan titik (2, 3): y - 3 = 2(x - 2)",
      "Sederhanakan menjadi bentuk y = 2x - 1",
    ],
  },
  {
    no: 8,
    jenis: "benarSalah",
    cuplikanSoal: "Pernyataan: median dari data 4, 7, 8, 5, 9, 6, 10 adalah 7.",
    options: [
      { letter: "A", text: "Benar", isCorrect: true, studentCount: 8, kelAtas: 7, kelBawah: 1 },
      { letter: "B", text: "Salah", isCorrect: false, studentCount: 22, kelAtas: 8, kelBawah: 14 },
    ],
  },
];

const KUALITAS_FIXTURE_TAIL: QuestionAnalysis[] = [
  {
    no: 9,
    jenis: "pilihanGandaEsai",
    cuplikanSoal:
      "Jelaskan langkah-langkah menyelesaikan sistem persamaan linear dua variabel berikut, lalu tentukan himpunan penyelesaiannya.",
    validitas: null,
    tingkatKesukaran: null,
    dayaPembeda: null,
    distraktor: null,
  },
  {
    no: 10,
    jenis: "survei",
    cuplikanSoal: "Seberapa yakin kamu dengan jawabanmu pada soal-soal di atas?",
    validitas: null,
    tingkatKesukaran: null,
    dayaPembeda: null,
    distraktor: null,
  },
];

type HasilTier = "layak" | "ditinjau" | "diperbaiki";

// Engineered against getHasilAnalisis's rule (itemAnalysisStats.ts):
// "layak" scores 0 problems, "ditinjau" scores exactly 1 (Kesukaran =
// Mudah), "diperbaiki" trips the hard Daya Pembeda "Rendah" override.
// Distraktor is Efektif by construction for every PG shape above (every
// distraktor is picked by >=5% siswa), so it never adds a problem and never
// needs varying per tier.
function metricsForTier(
  tier: HasilTier,
  isPilihanGanda: boolean,
): Pick<QuestionAnalysis, "validitas" | "tingkatKesukaran" | "dayaPembeda" | "distraktor"> {
  const distraktor = isPilihanGanda ? { value: 1, label: "Efektif" as const } : null;
  if (tier === "diperbaiki") {
    return {
      validitas: { value: 0.82, label: "Valid" },
      tingkatKesukaran: { value: 0.44, label: "Sedang" },
      dayaPembeda: { value: 0.15, label: "Rendah" },
      distraktor,
    };
  }
  if (tier === "ditinjau") {
    return {
      validitas: { value: 0.82, label: "Valid" },
      tingkatKesukaran: { value: 0.75, label: "Mudah" },
      dayaPembeda: { value: 0.62, label: "Tinggi" },
      distraktor,
    };
  }
  return {
    validitas: { value: 0.82, label: "Valid" },
    tingkatKesukaran: { value: 0.44, label: "Sedang" },
    dayaPembeda: { value: 0.62, label: "Tinggi" },
    distraktor,
  };
}

function buildKualitasFixture(tiers: [HasilTier, HasilTier, HasilTier, HasilTier, HasilTier, HasilTier, HasilTier, HasilTier]): QuestionAnalysis[] {
  const analyzable = KUALITAS_FIXTURE_SHAPES.map((shape, i) => ({
    ...shape,
    ...metricsForTier(tiers[i], shape.jenis === "pilihanGanda"),
  }));
  return [...analyzable, ...KUALITAS_FIXTURE_TAIL];
}

// Id 19 — Skor 100% (8 layak, 0 ditinjau, 0 diperbaiki).
const kualitasSangatBaik100 = buildKualitasFixture([
  "layak",
  "layak",
  "layak",
  "layak",
  "layak",
  "layak",
  "layak",
  "layak",
]);
// Id 20 — Skor 87,5% (7 layak, 1 ditinjau, 0 diperbaiki).
const kualitasSangatBaik875 = buildKualitasFixture([
  "layak",
  "layak",
  "layak",
  "layak",
  "layak",
  "layak",
  "layak",
  "ditinjau",
]);
// Id 21 — Skor 62,5% (5 layak, 2 ditinjau, 1 diperbaiki) — "Baik".
const kualitasBaik = buildKualitasFixture([
  "layak",
  "layak",
  "layak",
  "layak",
  "layak",
  "ditinjau",
  "ditinjau",
  "diperbaiki",
]);
// Id 22 — Skor 50% (4 layak, 2 ditinjau, 2 diperbaiki) — "Sedang".
const kualitasSedang = buildKualitasFixture([
  "layak",
  "layak",
  "layak",
  "layak",
  "ditinjau",
  "ditinjau",
  "diperbaiki",
  "diperbaiki",
]);
// Id 23 — Skor 37,5% (3 layak, 3 ditinjau, 2 diperbaiki) — "Buruk".
const kualitasBuruk = buildKualitasFixture([
  "layak",
  "layak",
  "layak",
  "ditinjau",
  "ditinjau",
  "ditinjau",
  "diperbaiki",
  "diperbaiki",
]);
// Id 24 — Skor 12,5% (1 layak, 4 ditinjau, 3 diperbaiki).
const kualitasSangatBuruk125 = buildKualitasFixture([
  "layak",
  "ditinjau",
  "ditinjau",
  "ditinjau",
  "ditinjau",
  "diperbaiki",
  "diperbaiki",
  "diperbaiki",
]);
// Id 25 — Skor 0% (0 layak, 0 ditinjau, 8 diperbaiki).
const kualitasSangatBuruk0 = buildKualitasFixture([
  "diperbaiki",
  "diperbaiki",
  "diperbaiki",
  "diperbaiki",
  "diperbaiki",
  "diperbaiki",
  "diperbaiki",
  "diperbaiki",
]);

// Reliabilitas is authored directly per fixture (see buildAnalisisStats'
// own comment — it's not derived from Daya Pembeda), so each id 19-25 fixture
// pairs its Kualitas Paket Soal band with the exact Reliabilitas Tes band
// the user asked for. Every other assessment id falls back to 0.94 (Sangat
// Baik), matching the original hardcoded value.
const RELIABILITAS_BY_ASSESSMENT_ID: Record<string, number> = {
  "19": 1, // Sempurna
  "20": 0.94, // Sangat Baik
  "21": 0.86, // Baik
  "22": 0.72, // Dapat Diterima
  "23": 0.44, // Rendah
  "24": 0.44, // Rendah
  "25": 0, // Tidak Reliabel
};

const QUESTIONS_BY_ASSESSMENT_ID: Record<string, QuestionAnalysis[]> = {
  "19": kualitasSangatBaik100,
  "20": kualitasSangatBaik875,
  "21": kualitasBaik,
  "22": kualitasSedang,
  "23": kualitasBuruk,
  "24": kualitasSangatBuruk125,
  "25": kualitasSangatBuruk0,
};

// Assessment ids whose paket soal is entirely PG Esai/Survei (used by the
// "Tidak Dapat Dianalisis (jenis soal)" AnBuSo test cases) — every other
// assessment id uses the default mixed-type `questionAnalysis` bank.
const NON_ANALYZABLE_ASSESSMENT_IDS = new Set(["9", "11"]);

export function getQuestionsForAssessment(assessmentId: string): QuestionAnalysis[] {
  if (assessmentId in QUESTIONS_BY_ASSESSMENT_ID) return QUESTIONS_BY_ASSESSMENT_ID[assessmentId];
  return NON_ANALYZABLE_ASSESSMENT_IDS.has(assessmentId) ? nonAnalyzableQuestions : questionAnalysis;
}

export function getReliabilitasForAssessment(assessmentId: string): number {
  return RELIABILITAS_BY_ASSESSMENT_ID[assessmentId] ?? 0.94;
}
