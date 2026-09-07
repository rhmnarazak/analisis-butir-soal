import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowUpDown,
  Ban,
  CircleArrowLeft,
  CircleArrowRight,
  CircleCheck,
  CircleX,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ChartCard, LegendRow, Pill, StackedSegments, ThresholdBar } from "../components/detail/ChartCardKit";
import { JENIS_STYLES, JenisPill } from "../components/detail/SoalTab";
import { getQuestionsForAssessment } from "../data/questionAnalysis";
import { usePageTitle } from "../hooks/usePageTitle";
import { getHasilAnalisis, R_TABEL, type HasilAnalisis } from "../lib/itemAnalysisStats";
import { useAssessmentStore } from "../state/AssessmentStore";
import type { AnswerOption, DifficultyLevel, DiscriminationLevel, QuestionAnalysis } from "../types/assessment";

const KESUKARAN_BANDS: { className: string; width: number; dividerClassName: string; tick?: string }[] = [
  { className: "bg-error-500", width: 20, dividerClassName: "bg-error-700", tick: "0,2" },
  { className: "bg-warning-500", width: 20, dividerClassName: "bg-warning-500", tick: "0,4" },
  { className: "bg-success-500", width: 20, dividerClassName: "bg-success-700", tick: "0,6" },
  { className: "bg-warning-500", width: 20, dividerClassName: "bg-warning-500", tick: "0,8" },
  { className: "bg-error-500", width: 20, dividerClassName: "bg-error-700" },
];

const DAYA_PEMBEDA_BANDS: { className: string; width: number; dividerClassName: string; tick?: string }[] = [
  { className: "bg-error-700", width: 15, dividerClassName: "bg-error-700", tick: "0,15" },
  { className: "bg-error-500", width: 15, dividerClassName: "bg-error-500", tick: "0,3" },
  { className: "bg-warning-500", width: 20, dividerClassName: "bg-warning-500", tick: "0,5" },
  { className: "bg-success-500", width: 25, dividerClassName: "bg-success-500", tick: "0,75" },
  { className: "bg-success-700", width: 25, dividerClassName: "bg-success-700" },
];

const HASIL_BANNER: Record<HasilAnalisis, { border: string; bg: string; icon: string; title: string; desc: string }> = {
  "Layak Digunakan": {
    border: "border-success-500",
    bg: "bg-success-25",
    icon: "bg-success-500",
    title: "Soal Layak Digunakan",
    desc: "Hasil analisis menunjuan karakteristik soal sudah baik dan soal dapat digunakan kembali.",
  },
  "Perlu Ditinjau": {
    border: "border-warning-500",
    bg: "bg-warning-25",
    icon: "bg-warning-500",
    title: "Soal Perlu Ditinjau",
    desc: "Terdapat indiator yang perlu diperhatikan, tetapi belum cukup kuat untuk menyatakan soal perlu diperbaiki.",
  },
  "Perlu Diperbaiki": {
    border: "border-error-500",
    bg: "bg-error-25",
    icon: "bg-error-500",
    title: "Soal Perlu Diperbaiki",
    desc: "Terdapat indikator yang menunjukan masalah cukup signifikan sehingga soal perlu ada perbaikan jika ingin digunakan kembali.",
  },
  "Tidak Dianalisis": {
    border: "border-tertiary-500",
    bg: "bg-tertiary-25",
    icon: "bg-tertiary-500",
    title: "Soal Tidak Dianalisis",
    desc: "Tidak dapat dianalisis untuk jenis soal ini.",
  },
};

const HASIL_ICON: Record<HasilAnalisis, typeof AlertTriangle> = {
  "Layak Digunakan": CircleCheck,
  "Perlu Ditinjau": AlertTriangle,
  "Perlu Diperbaiki": CircleX,
  "Tidak Dianalisis": Ban,
};

// Wrong-answer shades from most to least saturated red — assigned by rank
// (most-picked distractor gets the strongest red, least-picked the palest),
// not by option letter.
const WRONG_ANSWER_GRADIENT = ["bg-error-700", "bg-error-500", "bg-error-200", "bg-error-50"];

function wrongAnswerColorByLetter(options: AnswerOption[]): Record<string, string> {
  const ranked = [...options].filter((opt) => !opt.isCorrect).sort((a, b) => b.studentCount - a.studentCount);
  const colors: Record<string, string> = {};
  ranked.forEach((opt, i) => {
    colors[opt.letter] = WRONG_ANSWER_GRADIENT[Math.min(i, WRONG_ANSWER_GRADIENT.length - 1)];
  });
  return colors;
}

function Divider() {
  return <div className="h-px w-full bg-tertiary-300" />;
}

type InterpretasiSeverity = "success" | "warning" | "error" | "neutral";
interface InterpretasiPoint {
  severity: InterpretasiSeverity;
  text: string;
}

const INTERPRETASI_ITEM_STYLE: Record<
  InterpretasiSeverity,
  { bg: string; border: string; iconColor: string; Icon: typeof AlertTriangle }
> = {
  success: { bg: "bg-success-25", border: "border-success-200", iconColor: "text-success-500", Icon: CircleCheck },
  warning: { bg: "bg-warning-25", border: "border-secondary-200", iconColor: "text-warning-500", Icon: AlertTriangle },
  error: { bg: "bg-error-25", border: "border-error-200", iconColor: "text-error-500", Icon: AlertOctagon },
  neutral: { bg: "bg-tertiary-25", border: "border-tertiary-200", iconColor: "text-tertiary-500", Icon: Ban },
};

// Status chip (".statusNew") styling per severity — matches the .statusNew
// component variants (Status=Success/Warning/Error/Tertiary) exactly:
// 5993-113335 (error), 5993-113353 (warning), 5993-113457 (tertiary).
const CHIP_STYLE: Record<InterpretasiSeverity, { className: string; Icon: typeof AlertTriangle }> = {
  success: { className: "bg-success-50 border-success-200 text-success-500", Icon: CircleCheck },
  warning: { className: "bg-secondary-50 border-secondary-200 text-warning-500", Icon: AlertTriangle },
  error: { className: "bg-error-50 border-error-200 text-error-500", Icon: AlertOctagon },
  neutral: { className: "bg-tertiary-50 border-tertiary-200 text-tertiary-600", Icon: Ban },
};

// One boxed interpretation bullet — per Figma InterpretationItemValiditas /
// -Kesukaran / -DayaPembeda / -Distraktor component sets (5991-101366 etc.).
function InterpretasiItem({ severity, text }: InterpretasiPoint) {
  const style = INTERPRETASI_ITEM_STYLE[severity];
  return (
    <div className={`flex items-start gap-2 rounded-lg border p-4 ${style.border} ${style.bg}`}>
      <style.Icon size={20} className={`mt-0.5 shrink-0 ${style.iconColor}`} />
      <p className="text-sm text-tertiary-900">{text}</p>
    </div>
  );
}

// Kesukaran is U-shaped (both extremes are weak discriminators): Sedang is
// the ideal middle, Mudah/Sukar are a caution, Sangat Mudah/Sangat Sukar are
// a hard flag — mirrors KESUKARAN_BANDS' coloring.
const KESUKARAN_INTERPRETASI: Record<DifficultyLevel, InterpretasiPoint> = {
  "Sangat Sukar": { severity: "error", text: "Soal sangat sukar karena tidak ada peserta yang menjawab dengan benar." },
  Sukar: { severity: "warning", text: "Soal tergolong sukar karena hanya sebagian kecil peserta yang menjawab dengan benar." },
  Sedang: { severity: "success", text: "Tingkat kesukaran soal tergolong sedang." },
  Mudah: { severity: "warning", text: "Soal tergolong mudah karena sebagian besar peserta menjawab dengan benar." },
  "Sangat Mudah": { severity: "error", text: "Sebagian besar atau seluruh peserta menjawab soal dengan benar." },
};

// Daya Pembeda is monotonic (higher is always better) — mirrors
// DAYA_PEMBEDA_BANDS' coloring.
const DAYA_PEMBEDA_INTERPRETASI: Record<DiscriminationLevel, InterpretasiPoint> = {
  "Rendah Sekali": { severity: "error", text: "Soal belum mampu membedakan peserta berdasarkan tingkat kemampuannya." },
  Rendah: { severity: "error", text: "Soal masih kurang mampu membedakan peserta berdasarkan tingkat kemampuannya." },
  Sedang: { severity: "warning", text: "Soal cukup mampu membedakan peserta berdasarkan tingkat kemampuannya." },
  Tinggi: { severity: "success", text: "Soal mampu membedakan peserta berdasarkan tingkat kemampuannya." },
  "Tinggi Sekali": { severity: "success", text: "Soal sangat mampu membedakan peserta berdasarkan tingkat kemampuannya." },
};

// Always exactly 4 points — Validitas, Kesukaran, Daya Pembeda, Efektivitas
// Distraktor — falling back to a neutral "tidak dianalisis" box (matching
// the Distraktor "Tidak Dianalisis" component, 5993-111845) whenever the
// underlying stat is null for this soal's jenis.
function buildInterpretasi(q: QuestionAnalysis): InterpretasiPoint[] {
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

  return [validitas, kesukaran, dayaPembeda, distraktor];
}

function SebaranSkorCard({ options, jumlahPeserta }: { options: AnswerOption[]; jumlahPeserta: number }) {
  const wrongColors = wrongAnswerColorByLetter(options);
  const dotClassName = (opt: AnswerOption) => (opt.isCorrect ? "bg-success-500" : wrongColors[opt.letter]);

  let cumulative = 0;
  const stops = options
    .map((opt) => {
      const start = cumulative;
      cumulative += (opt.studentCount / jumlahPeserta) * 100;
      const varName = dotClassName(opt).replace("bg-", "");
      return `var(--color-${varName}) ${start}% ${cumulative}%`;
    })
    .join(", ");

  return (
    <ChartCard title="Sebaran Skor" border="border-tertiary-100" tooltip>
      <p className="-mt-2 text-xs text-tertiary-700">Persentase pilihan jawaban yang dipilih siswa</p>
      <div className="flex flex-col items-center gap-1 py-2">
        <div
          className="relative flex h-[180px] w-[180px] items-center justify-center rounded-full"
          style={{ background: `conic-gradient(${stops})` }}
        >
          <div className="flex h-[144px] w-[144px] flex-col items-center justify-center rounded-full bg-white text-center">
            <span className="text-3xl font-bold text-tertiary-900">{jumlahPeserta}</span>
            <span className="text-xs text-tertiary-900">Siswa</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <LegendRow
            key={opt.letter}
            dotClassName={dotClassName(opt)}
            label={opt.isCorrect ? `${opt.letter} (Benar)` : opt.letter}
            count={opt.studentCount}
            unit="Siswa"
            percent={`${((opt.studentCount / jumlahPeserta) * 100).toFixed(1).replace(".", ",")}%`}
          />
        ))}
      </div>
    </ChartCard>
  );
}

function AnalisisDistraktorTable({ options }: { options: AnswerOption[] }) {
  return (
    <div className="flex flex-1 flex-col gap-4 rounded-lg border border-tertiary-200 bg-white p-5" style={{ minWidth: 360 }}>
      <span className="text-base font-semibold text-tertiary-900">Analisis Distraktor</span>
      <div className="overflow-x-auto rounded-lg border border-tertiary-300">
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr>
              {["Pilihan", "Kel. Atas", "Kel. Bawah", "Total Pemilih", "Efektivitas"].map((h) => (
                <th key={h} className="whitespace-nowrap border-b border-tertiary-300 bg-tertiary-50 px-3 py-2.5 font-bold text-tertiary-900">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {options.map((opt) => {
              const total = opt.kelAtas + opt.kelBawah;
              const totalPercent = ((total / (options.reduce((s, o) => s + o.kelAtas + o.kelBawah, 0) || 1)) * 100).toFixed(1).replace(".", ",");
              const totalOfAll = options.reduce((s, o) => s + o.studentCount, 0) || 1;
              const pickedPercent = (opt.studentCount / totalOfAll) * 100;
              const efektif = pickedPercent >= 5;
              return (
                <tr key={opt.letter}>
                  <td className={`whitespace-nowrap border-b border-tertiary-300 px-3 py-2.5 text-tertiary-900 ${opt.isCorrect ? "font-bold" : ""}`}>
                    {opt.letter}
                    {opt.isCorrect ? " (Benar)" : "."}
                  </td>
                  <td className="whitespace-nowrap border-b border-tertiary-300 px-3 py-2.5 text-tertiary-900">
                    {opt.kelAtas} ({((opt.kelAtas / (options.reduce((s, o) => s + o.kelAtas, 0) || 1)) * 100).toFixed(1).replace(".", ",")}%)
                  </td>
                  <td className="whitespace-nowrap border-b border-tertiary-300 px-3 py-2.5 text-tertiary-900">
                    {opt.kelBawah} ({((opt.kelBawah / (options.reduce((s, o) => s + o.kelBawah, 0) || 1)) * 100).toFixed(1).replace(".", ",")}%)
                  </td>
                  <td className="whitespace-nowrap border-b border-tertiary-300 px-3 py-2.5 font-bold text-tertiary-900">
                    {total} ({totalPercent}%)
                  </td>
                  <td className="whitespace-nowrap border-b border-tertiary-300 px-3 py-2.5 font-bold text-tertiary-900">
                    {opt.isCorrect ? (
                      "-"
                    ) : (
                      <span className={efektif ? "text-success-500" : "text-error-500"}>
                        {efektif ? "Efektif" : "Tidak Efektif"}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-tertiary-700">Distraktor dianggap efektif jika dipilih oleh ≥5% siswa.</p>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "prioritas", label: "Perlu Perhatian" },
  { value: "nomor", label: "No. Soal" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];
const HASIL_PRIORITY: Record<HasilAnalisis, number> = {
  "Perlu Diperbaiki": 0,
  "Perlu Ditinjau": 1,
  "Layak Digunakan": 2,
  "Tidak Dianalisis": 3,
};

export function SoalDetailPage() {
  const { id, no } = useParams<{ id: string; no: string }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortValue>("prioritas");
  const [sortOpen, setSortOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setSortOpen(false);
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) setPickerOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { getAssessment } = useAssessmentStore();
  const assessment = getAssessment(id ?? "");
  const questionAnalysis = getQuestionsForAssessment(id ?? "");
  const currentNo = Number(no);
  const question = questionAnalysis.find((q) => q.no === currentNo);
  usePageTitle(
    assessment && question ? `Soal No. ${question.no} - ${assessment.namaUjian}` : "Detail Analisis Soal",
  );

  const orderedQuestions = useMemo(() => {
    const withHasil = questionAnalysis.map((q) => ({ q, hasil: getHasilAnalisis(q) }));
    return [...withHasil]
      .sort((a, b) => {
        if (sortBy === "nomor") return a.q.no - b.q.no;
        const diff = HASIL_PRIORITY[a.hasil] - HASIL_PRIORITY[b.hasil];
        return diff !== 0 ? diff : a.q.no - b.q.no;
      })
      .map((r) => r.q);
  }, [sortBy, questionAnalysis]);

  if (!assessment) return <Navigate to="/" replace />;
  if (!question) return <Navigate to={`/asesmen/${assessment.id}/analisis-butir-soal`} replace />;

  const backHref = `/asesmen/${assessment.id}/analisis-butir-soal`;
  const currentIndex = orderedQuestions.findIndex((q) => q.no === currentNo);
  const prevQuestion = currentIndex > 0 ? orderedQuestions[currentIndex - 1] : null;
  const nextQuestion = currentIndex < orderedQuestions.length - 1 ? orderedQuestions[currentIndex + 1] : null;

  const hasil = getHasilAnalisis(question);
  const banner = HASIL_BANNER[hasil];
  const HasilIcon = HASIL_ICON[hasil];
  const jumlahPeserta = assessment.jumlahPeserta;
  const correctOptions = question.options?.filter((opt) => opt.isCorrect) ?? [];
  const isPilihanGanda = question.jenis === "pilihanGanda";
  // PG Esai and Survei aren't scored/graded like the other types, so a
  // distractor-effectiveness verdict (even a placeholder one) doesn't apply.
  const showDistraktorCard = question.jenis !== "pilihanGandaEsai" && question.jenis !== "survei";
  const interpretasi = buildInterpretasi(question);

  function goToSoal(target: number) {
    navigate(`/asesmen/${assessment!.id}/analisis-butir-soal/soal/${target}`);
  }

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <div className="flex shrink-0 items-center justify-between border-b border-tertiary-200 bg-white px-6 py-6">
        <span className="text-xl font-semibold text-tertiary-900">Detail Analisis Soal</span>
        <button type="button" onClick={() => navigate(backHref)} aria-label="Tutup">
          <XCircle size={24} className="text-tertiary-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-[1392px] flex-col gap-6">
          <div className={`flex items-start gap-3 rounded-lg border border-l-4 p-4 ${banner.border} ${banner.bg}`}>
            <span className={`flex shrink-0 items-center justify-center rounded-full p-1 ${banner.icon}`}>
              <HasilIcon size={14} className="text-white" />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold text-tertiary-900">{banner.title}</span>
              <p className="text-sm text-tertiary-900">{banner.desc}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="flex flex-1 flex-col gap-5 rounded-lg border border-tertiary-200 bg-white p-5" style={{ minWidth: 360 }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-tertiary-900">Soal No. {question.no}</span>
                <span className="text-lg text-tertiary-500">dari {questionAnalysis.length}</span>
                <JenisPill jenis={question.jenis} />
              </div>
              <Divider />
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-tertiary-900">Soal</span>
                <p className="text-sm text-tertiary-900">{question.cuplikanSoal}</p>

                {question.options && (
                  <div className="flex flex-col gap-3 pl-1">
                    {question.options.map((opt) => (
                      <div key={opt.letter} className="flex items-center gap-3">
                        {question.jenis === "pilihanGandaKompleks" ? (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 border-primary-300 text-xs font-semibold text-primary-500">
                            {opt.letter}
                          </span>
                        ) : (
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-500">
                            {opt.letter}
                          </span>
                        )}
                        <span className="text-sm text-tertiary-900">{opt.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {question.pasangan && (
                  <div className="flex flex-col gap-2 pl-1">
                    {question.pasangan.map((pair, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-tertiary-900">
                        <span className="flex-1 rounded-lg border border-tertiary-200 bg-tertiary-25 px-3 py-2">{pair.kiri}</span>
                        <span className="text-tertiary-400">—</span>
                        <span className="flex-1 rounded-lg border border-tertiary-200 bg-tertiary-25 px-3 py-2">{pair.kanan}</span>
                      </div>
                    ))}
                  </div>
                )}

                {question.urutanBenar && (
                  <div className="flex flex-col gap-2 pl-1">
                    {[...question.urutanBenar].reverse().map((item, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border border-tertiary-200 bg-tertiary-25 px-3 py-2 text-sm text-tertiary-900">
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {correctOptions.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-semibold text-tertiary-900">Kunci Jawaban</span>
                  <div className="flex flex-col gap-3 pl-1">
                    {correctOptions.map((opt) => (
                      <div key={opt.letter} className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-semibold text-primary-500">
                          {opt.letter}
                        </span>
                        <span className="text-sm text-tertiary-900">{opt.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {question.urutanBenar && (
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-semibold text-tertiary-900">Kunci Jawaban</span>
                  <div className="flex flex-col gap-2 pl-1">
                    {question.urutanBenar.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-tertiary-900">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-500">
                          {i + 1}
                        </span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isPilihanGanda && question.options && (
              <div style={{ width: 336 }} className="shrink-0">
                <SebaranSkorCard options={question.options} jumlahPeserta={jumlahPeserta} />
              </div>
            )}
          </div>

          {showDistraktorCard && (
          <div className="flex flex-wrap gap-4">
            {question.validitas && (
              <ChartCard
                title="Validitas"
                icon={<img src="/images/icons/list-check.svg" alt="" className="h-6 w-6" />}
                iconBg="bg-primary-25"
                border="border-tertiary-100"
                tooltip
              >
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-tertiary-900">{question.validitas.value.toFixed(2).replace(".", ",")}</span>
                  {(() => {
                    const chip = CHIP_STYLE[question.validitas.label === "Valid" ? "success" : "error"];
                    return <Pill label={question.validitas.label} icon={<chip.Icon size={14} />} className={chip.className} />;
                  })()}
                </div>
                <p className="text-xs text-tertiary-700">
                  Hasil jawaban soal ini berkaitan dengan hasil tes peserta secara keseluruhan.
                </p>
                <ThresholdBar
                  bands={[
                    { className: "bg-error-500", width: R_TABEL * 100, dividerClassName: "bg-error-700", tick: R_TABEL.toFixed(2).replace(".", ",") },
                    { className: "bg-success-500", width: (1 - R_TABEL) * 100, dividerClassName: "bg-success-700" },
                  ]}
                  endDividerClassName="bg-success-900"
                  markerPercent={question.validitas.value * 100}
                />
                <p className="text-sm text-tertiary-900">
                  r hitung: <strong>{question.validitas.value.toFixed(2).replace(".", ",")}</strong>{" "}
                  {question.validitas.value > R_TABEL ? ">" : "≤"} r tabel:{" "}
                  <strong>{R_TABEL.toFixed(2).replace(".", ",")}</strong>
                </p>
              </ChartCard>
            )}

            {question.tingkatKesukaran && (
              <ChartCard
                title="Tingkat Kesukaran"
                icon={<img src="/images/icons/trending-up.svg" alt="" className="h-6 w-6" />}
                iconBg="bg-primary-25"
                border="border-tertiary-100"
                tooltip
              >
                {(() => {
                  const good = question.tingkatKesukaran.label === "Sedang";
                  const chip = CHIP_STYLE[KESUKARAN_INTERPRETASI[question.tingkatKesukaran.label].severity];
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-tertiary-900">
                          {question.tingkatKesukaran.value.toFixed(2).replace(".", ",")}
                        </span>
                        <Pill label={question.tingkatKesukaran.label} icon={<chip.Icon size={14} />} className={chip.className} />
                      </div>
                      <p className="text-xs text-tertiary-700">
                        {good
                          ? "Sebagian besar peserta menjawab soal dengan proporsi benar dan salah yang seimbang."
                          : "Sebagian besar peserta menjawab soal dengan benar atau salah."}
                      </p>
                    </>
                  );
                })()}
                <ThresholdBar
                  bands={KESUKARAN_BANDS}
                  endDividerClassName="bg-error-700"
                  markerPercent={question.tingkatKesukaran.value * 100}
                />
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex flex-col gap-2">
                    <LegendRow dotClassName="bg-error-500" label="Sangat Mudah" />
                    <LegendRow dotClassName="bg-warning-500" label="Mudah" />
                    <LegendRow dotClassName="bg-success-500" label="Sedang" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <LegendRow dotClassName="bg-warning-500" label="Sukar" />
                    <LegendRow dotClassName="bg-error-500" label="Sangat Sukar" />
                  </div>
                </div>
              </ChartCard>
            )}

            {question.dayaPembeda && (
              <ChartCard
                title="Daya Pembeda"
                icon={<img src="/images/icons/layers-difference.svg" alt="" className="h-6 w-6" />}
                iconBg="bg-primary-25"
                border="border-tertiary-100"
                tooltip
              >
                {(() => {
                  const good = question.dayaPembeda.label === "Tinggi" || question.dayaPembeda.label === "Tinggi Sekali";
                  const chip = CHIP_STYLE[DAYA_PEMBEDA_INTERPRETASI[question.dayaPembeda.label].severity];
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-tertiary-900">
                          {question.dayaPembeda.value.toFixed(2).replace(".", ",")}
                        </span>
                        <Pill label={question.dayaPembeda.label} icon={<chip.Icon size={14} />} className={chip.className} />
                      </div>
                      <p className="text-xs text-tertiary-700">
                        {good
                          ? "Soal mampu membedakan peserta berkemampuan tinggi dan rendah dengan baik."
                          : "Soal masih kurang mampu membedakan peserta berkemampuan tinggi dan rendah."}
                      </p>
                    </>
                  );
                })()}
                <ThresholdBar
                  bands={DAYA_PEMBEDA_BANDS}
                  endDividerClassName="bg-success-700"
                  markerPercent={question.dayaPembeda.value * 100}
                />
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex flex-col gap-2">
                    <LegendRow dotClassName="bg-error-700" label="Rendah Sekali" />
                    <LegendRow dotClassName="bg-error-500" label="Rendah" />
                    <LegendRow dotClassName="bg-warning-500" label="Sedang" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <LegendRow dotClassName="bg-success-500" label="Tinggi" />
                    <LegendRow dotClassName="bg-success-700" label="Tinggi Sekali" />
                  </div>
                </div>
              </ChartCard>
            )}

            <ChartCard
              title="Efektivitas Distraktor"
              icon={<img src="/images/icons/equal-not.svg" alt="" className="h-6 w-6" />}
              iconBg="bg-primary-25"
              border="border-tertiary-100"
              tooltip
            >
              {question.distraktor ? (
                (() => {
                  const good = question.distraktor.label === "Efektif";
                  const percent = question.distraktor.value * 100;
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="flex items-end gap-1">
                          <span className="text-3xl font-bold text-tertiary-900">{Math.round(percent)}</span>
                          <span className="pb-1 text-sm text-tertiary-700">%</span>
                        </div>
                        {(() => {
                          const chip = CHIP_STYLE[good ? "success" : "error"];
                          return <Pill label={question.distraktor.label} icon={<chip.Icon size={14} />} className={chip.className} />;
                        })()}
                      </div>
                      <p className="text-xs text-tertiary-700">
                        {good
                          ? "Pilihan jawaban salah cukup dipilih oleh peserta dan berfungsi sebagai pengecoh."
                          : "Pilihan jawaban salah kurang dipilih oleh peserta sehingga tidak berfungsi sebagai pengecoh."}
                      </p>
                      <StackedSegments
                        segments={[
                          { className: "bg-success-500", percent },
                          { className: "bg-error-500", percent: 100 - percent },
                        ]}
                      />
                      <div className="flex flex-col gap-2">
                        <LegendRow dotClassName="bg-success-500" label="Efektif" />
                        <LegendRow dotClassName="bg-error-500" label="Tidak Efektif" />
                      </div>
                    </>
                  );
                })()
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-tertiary-900">-</span>
                    <Pill label="Tidak Dianalisis" icon={<Ban size={14} />} className={CHIP_STYLE.neutral.className} />
                  </div>
                  <p className="text-xs text-tertiary-700">Tidak dapat dianalisis untuk jenis soal ini.</p>
                  <StackedSegments segments={[{ className: "bg-tertiary-100", percent: 100 }]} />
                  <div className="flex flex-col gap-2">
                    <LegendRow dotClassName="bg-success-500" label="Efektif" />
                    <LegendRow dotClassName="bg-error-500" label="Tidak Efektif" />
                  </div>
                </>
              )}
            </ChartCard>
          </div>
          )}

          <div className="flex flex-wrap gap-6">
            {isPilihanGanda && question.options && <AnalisisDistraktorTable options={question.options} />}

            {showDistraktorCard ? (
              <div
                className={`flex flex-1 flex-col gap-4 rounded-lg border p-5 ${banner.border} ${banner.bg}`}
                style={{ minWidth: 360 }}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex shrink-0 items-center justify-center rounded-full p-2 ${banner.icon}`}>
                    <Sparkles size={20} className="text-white" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-base font-semibold text-tertiary-900">Interpretasi</span>
                    <span className="text-xs text-tertiary-600">Dibuat otomatis berdasarkan hasil analisis soal ini</span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {interpretasi.map((item, i) => (
                    <InterpretasiItem key={i} severity={item.severity} text={item.text} />
                  ))}
                </div>
              </div>
            ) : (
              // Per Figma "State=Tidak Ada Interpretasi" (5993-113121) — PG
              // Esai and Survei aren't scored, so there's nothing to
              // interpret per-metric; show a single neutral message instead.
              <div className="flex flex-1 flex-col gap-4 rounded-lg border border-tertiary-500 bg-white p-5" style={{ minWidth: 360 }}>
                <div className="flex items-start gap-3">
                  <span className="flex shrink-0 items-center justify-center rounded bg-tertiary-25 p-2">
                    <Sparkles size={24} className="text-tertiary-600" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-base font-semibold text-tertiary-900">Interpretasi</span>
                    <span className="text-xs text-tertiary-600">Dibuat otomatis berdasarkan hasil analisis soal ini</span>
                  </div>
                </div>
                <p className="text-sm text-tertiary-900">Soal ini belum memiliki hasil analisis untuk diinterpretasikan.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-tertiary-200 bg-white px-6 py-6">
        <button
          type="button"
          onClick={() => navigate(backHref)}
          className="flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold text-primary-500 hover:bg-primary-25"
        >
          <ArrowLeft size={18} />
          Kembali ke Detail Analisis Butir Soal
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!prevQuestion}
            onClick={() => prevQuestion && goToSoal(prevQuestion.no)}
            className={`flex h-11 items-center gap-2 whitespace-nowrap rounded-lg border px-5 text-sm font-semibold ${
              prevQuestion
                ? "border-primary-500 text-primary-500 hover:bg-primary-25"
                : "border-tertiary-200 text-tertiary-300"
            }`}
          >
            <CircleArrowLeft size={18} />
            Soal Sebelumnya
          </button>

          <div ref={sortRef} className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="flex h-11 items-center gap-2 whitespace-nowrap rounded-lg border border-tertiary-300 px-4 text-sm text-tertiary-900"
            >
              <ArrowUpDown size={16} />
              Urutkan : {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
            </button>
            {sortOpen && (
              <div className="absolute bottom-full right-0 z-10 mb-1 w-48 rounded-lg border border-tertiary-200 bg-white py-1 shadow-lg">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.value);
                      setSortOpen(false);
                    }}
                    className={`flex w-full items-center px-4 py-2 text-left text-sm hover:bg-tertiary-50 ${
                      opt.value === sortBy ? "font-semibold text-primary-500" : "text-tertiary-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div ref={pickerRef} className="relative">
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              className="flex h-11 min-w-[220px] items-center justify-between gap-2 whitespace-nowrap rounded-lg border border-tertiary-300 px-4 text-sm text-tertiary-900"
            >
              <span>
                <strong>Soal No. {question.no}</strong> - {JENIS_STYLES[question.jenis].label}
              </span>
            </button>
            {pickerOpen && (
              <div className="absolute bottom-full right-0 z-10 mb-1 max-h-72 w-64 overflow-y-auto rounded-lg border border-tertiary-200 bg-white py-1 shadow-lg">
                {orderedQuestions.map((q) => (
                  <button
                    key={q.no}
                    type="button"
                    onClick={() => {
                      setPickerOpen(false);
                      goToSoal(q.no);
                    }}
                    className={`flex w-full items-center px-4 py-2 text-left text-sm hover:bg-tertiary-50 ${
                      q.no === question.no ? "font-semibold text-primary-500" : "text-tertiary-900"
                    }`}
                  >
                    Soal No. {q.no} - {JENIS_STYLES[q.jenis].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!nextQuestion}
            onClick={() => nextQuestion && goToSoal(nextQuestion.no)}
            className={`flex h-11 items-center gap-2 whitespace-nowrap rounded-lg px-5 text-sm font-semibold text-white ${
              nextQuestion ? "bg-primary-500 hover:bg-primary-400" : "bg-tertiary-300"
            }`}
          >
            Soal Berikutnya
            <CircleArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
