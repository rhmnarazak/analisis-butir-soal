import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpDown,
  Ban,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Download,
  FlaskConical,
  GraduationCap,
  ListFilter,
  Loader2,
  Search,
  User,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "../components/assessment/Breadcrumbs";
import { ChartCard, formatPercent, LegendRow, Pill, StackedSegments } from "../components/detail/ChartCardKit";
import { RingkasanKualitasPaketSoal } from "../components/detail/RingkasanKualitasPaketSoal";
import { JenisPill } from "../components/detail/SoalTab";
import { getQuestionsForAssessment, getReliabilitasForAssessment } from "../data/questionAnalysis";
import { useHorizontalWheelScroll } from "../hooks/useHorizontalWheelScroll";
import { usePageTitle } from "../hooks/usePageTitle";
import { getAnalisisRunInfo } from "../lib/analisisInfo";
import { assetUrl } from "../lib/assetUrl";
import { exportAnalisisToExcel } from "../lib/exportAnalisisExcel";
import {
  buildAnalisisStats,
  getAnalisisProgress,
  getDistraktorPercent,
  getDistraktorStatus,
  getHasilAnalisis,
  type AnalisisProgress,
  type HasilAnalisis,
} from "../lib/itemAnalysisStats";
import { useAssessmentStore } from "../state/AssessmentStore";
import type { DifficultyLevel, DiscriminationLevel, QuestionAnalysis } from "../types/assessment";

// Per Figma nodes 5981-201734/733/735/736/737: the bar length is a fixed
// step per difficulty band, not the raw kesukaran value — a soal exactly on
// the easy/hard extremes (weak discrimination) is flagged red just like its
// opposite, with "Sedang" as the psychometric sweet spot.
const KESUKARAN_STYLES: Record<DifficultyLevel, { textClass: string; barClass: string; percent: number }> = {
  "Sangat Mudah": { textClass: "text-error-500", barClass: "bg-error-500", percent: 100 },
  Mudah: { textClass: "text-warning-500", barClass: "bg-warning-500", percent: 75 },
  Sedang: { textClass: "text-success-500", barClass: "bg-primary-600", percent: 50 },
  Sukar: { textClass: "text-warning-500", barClass: "bg-warning-500", percent: 25 },
  "Sangat Sukar": { textClass: "text-error-500", barClass: "bg-error-500", percent: 0 },
};

// Per Figma nodes 5981-201777/778/779/780/781: same fixed-step-per-band
// pattern as Kesukaran, but here higher is always better (no U-shape).
const DAYA_PEMBEDA_STYLES: Record<DiscriminationLevel, { textClass: string; barClass: string; percent: number }> = {
  "Tinggi Sekali": { textClass: "text-success-700", barClass: "bg-success-700", percent: 100 },
  Tinggi: { textClass: "text-success-500", barClass: "bg-success-500", percent: 75 },
  Sedang: { textClass: "text-warning-500", barClass: "bg-warning-500", percent: 50 },
  Rendah: { textClass: "text-error-500", barClass: "bg-error-500", percent: 25 },
  "Rendah Sekali": { textClass: "text-error-700", barClass: "bg-error-700", percent: 0 },
};

const HASIL_STYLES: Record<HasilAnalisis, { className: string; icon: typeof AlertTriangle }> = {
  "Layak Digunakan": { className: "bg-success-50 border-success-200 text-success-500", icon: CircleCheck },
  "Perlu Ditinjau": { className: "bg-secondary-50 border-secondary-200 text-warning-500", icon: AlertTriangle },
  "Perlu Diperbaiki": { className: "bg-error-50 border-error-200 text-error-500", icon: CircleX },
  "Tidak Dianalisis": { className: "bg-tertiary-50 border-tertiary-200 text-tertiary-600", icon: Ban },
};

const ANALISIS_STYLES: Record<AnalisisProgress, { className: string; icon: typeof AlertTriangle }> = {
  Lengkap: { className: "bg-success-50 border-success-200 text-success-500", icon: CircleCheck },
  Sebagian: { className: "bg-secondary-50 border-secondary-200 text-warning-500", icon: AlertTriangle },
  "Tidak Ada": { className: "bg-tertiary-50 border-tertiary-200 text-tertiary-600", icon: Ban },
};

function StatusPill({ label, className, icon: Icon }: { label: string; className: string; icon: typeof AlertTriangle }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-[26px] border px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

// Status-chip styling for each distribution card's headline pill. Kesukaran
// is U-shaped (per Figma nodes 5924-126463/740/855/978/127082): every tier
// gets an icon, not just the "good" one — Sedang the checkmark, Mudah/Sukar
// a triangle-alert, and both extremes an octagon-alert.
const KESUKARAN_PILL: Record<DifficultyLevel, { className: string; icon: typeof CircleCheck }> = {
  "Sangat Mudah": { className: "bg-error-50 border-error-200 text-error-500", icon: AlertOctagon },
  Mudah: { className: "bg-secondary-50 border-secondary-200 text-warning-500", icon: AlertTriangle },
  Sedang: { className: "bg-success-50 border-success-200 text-success-500", icon: CircleCheck },
  Sukar: { className: "bg-secondary-50 border-secondary-200 text-warning-500", icon: AlertTriangle },
  "Sangat Sukar": { className: "bg-error-50 border-error-200 text-error-500", icon: AlertOctagon },
};
// Daya Pembeda is monotonic (higher is always better), per Figma nodes
// 5998-116043/052/061/070/078 — every tier gets an icon (Tinggi(Sekali) a
// checkmark, Sedang a triangle-alert, Rendah(Sekali) an octagon-alert), and
// the "Sekali" extremes get a darker shade of the same color (700 vs 500)
// to read as more intense than their non-"Sekali" neighbor.
const DAYA_PEMBEDA_PILL: Record<DiscriminationLevel, { className: string; icon: typeof CircleCheck }> = {
  "Tinggi Sekali": { className: "bg-success-50 border-success-200 text-success-700", icon: CircleCheck },
  Tinggi: { className: "bg-success-50 border-success-200 text-success-500", icon: CircleCheck },
  Sedang: { className: "bg-secondary-50 border-secondary-200 text-warning-500", icon: AlertTriangle },
  Rendah: { className: "bg-error-50 border-error-200 text-error-500", icon: AlertOctagon },
  "Rendah Sekali": { className: "bg-error-50 border-error-200 text-error-700", icon: AlertOctagon },
};

// Picks the most-populated tier (first one wins ties) to headline a
// distribution card's status pill.
function dominantTier<T extends string>(counts: Record<T, number>): T {
  const entries = Object.entries(counts) as [T, number][];
  return entries.reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0];
}

// U-shaped for Kesukaran (both extremes are weak discriminators), monotonic
// for Daya Pembeda (higher is always better) — same semantics as the table's
// per-question styles, reused here for the distribution bar segments.
const KESUKARAN_BAR_COLOR: Record<DifficultyLevel, string> = {
  "Sangat Mudah": "bg-error-500",
  Mudah: "bg-warning-500",
  Sedang: "bg-success-500",
  Sukar: "bg-warning-500",
  "Sangat Sukar": "bg-error-500",
};
const DAYA_PEMBEDA_BAR_COLOR: Record<DiscriminationLevel, string> = {
  "Tinggi Sekali": "bg-success-700",
  Tinggi: "bg-success-500",
  Sedang: "bg-warning-500",
  Rendah: "bg-error-500",
  "Rendah Sekali": "bg-error-700",
};

// Shared shell for the 4 "Kualitas dan Distribusi Butir Soal" cards — big
// number + status pill, a short caption, a divider, the distribution label,
// then the stacked-bar chart and its legend (1 or 2 columns).
function DistributionCard({
  title,
  iconSrc,
  tooltip,
  mainValue,
  mainSuffix,
  pillLabel,
  pillClassName,
  pillIcon,
  captionBold,
  captionRest,
  distributionLabel,
  segments,
  legendColumns,
  legend,
}: {
  title: string;
  iconSrc: string;
  tooltip: string;
  mainValue: string;
  mainSuffix?: string;
  pillLabel: string;
  pillClassName: string;
  pillIcon?: ReactNode;
  captionBold?: string;
  captionRest: string;
  distributionLabel: string;
  segments: { className: string; percent: number }[];
  legendColumns: 1 | 2;
  legend: { dotClassName: string; label: string; count: number; percent: string }[];
}) {
  const mid = Math.ceil(legend.length / 2);
  const columns = legendColumns === 2 ? [legend.slice(0, mid), legend.slice(mid)] : [legend];
  return (
    <ChartCard
      title={title}
      icon={<img src={iconSrc} alt="" className="h-6 w-6" />}
      iconBg="bg-primary-25"
      border="border-tertiary-100"
      tooltip={tooltip}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold text-tertiary-900">{mainValue}</span>
            {mainSuffix && <span className="pb-1 text-sm text-tertiary-700">{mainSuffix}</span>}
          </div>
          <Pill label={pillLabel} className={pillClassName} icon={pillIcon} />
        </div>
        <p className="text-xs text-tertiary-700">
          {captionBold && <strong className="text-tertiary-900">{captionBold}</strong>}
          {captionBold && " · "}
          {captionRest}
        </p>
      </div>
      <div className="h-px w-full bg-tertiary-300" />
      <span className="text-sm font-semibold text-tertiary-900">{distributionLabel}</span>
      <StackedSegments segments={segments} />
      <div className="flex flex-wrap gap-x-10 gap-y-2">
        {columns.map((col, i) => (
          <div key={i} className="flex flex-1 flex-col gap-2" style={{ minWidth: 200 }}>
            {col.map((item, j) => (
              <LegendRow key={j} {...item} />
            ))}
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

const TABS = ["Semua", "Perlu Diperbaiki", "Perlu Ditinjau", "Layak Digunakan", "Tidak Dianalisis"] as const;
type TabValue = (typeof TABS)[number];

// Default sort: most urgent status first (Perlu Diperbaiki > Perlu Ditinjau >
// Layak Digunakan), with non-analyzable soal pushed to the very end.
const HASIL_PRIORITY: Record<HasilAnalisis, number> = {
  "Perlu Diperbaiki": 0,
  "Perlu Ditinjau": 1,
  "Layak Digunakan": 2,
  "Tidak Dianalisis": 3,
};

const SORT_OPTIONS = [
  { value: "prioritas", label: "Perlu Perhatian" },
  { value: "nomor", label: "No. Soal" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

// Fixed column widths so the sticky No/Soal columns have a stable left
// offset — same technique as the sticky tables elsewhere in this app.
const NO_WIDTH = 64;
const SOAL_WIDTH = 210;
const STICKY_SHADOW = "shadow-[3px_0px_5px_-3px_rgba(0,0,0,0.1)]";

export function AnalisisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>("Semua");
  const [sortBy, setSortBy] = useState<SortValue>("prioritas");
  const [sortOpen, setSortOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  useHorizontalWheelScroll(scrollRef);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { getAssessment } = useAssessmentStore();
  const assessment = getAssessment(id ?? "");
  usePageTitle(assessment ? `Analisis Butir Soal - ${assessment.namaUjian}` : "Analisis Butir Soal");

  if (!assessment) {
    return <Navigate to="/" replace />;
  }

  const runInfo = getAnalisisRunInfo(assessment);
  const questionAnalysis = getQuestionsForAssessment(assessment.id);
  const stats = buildAnalisisStats(questionAnalysis, getReliabilitasForAssessment(assessment.id));

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      await exportAnalisisToExcel({ assessment, stats, questions: questionAnalysis });
    } finally {
      setIsExporting(false);
    }
  };

  const rows = useMemo(() => {
    const withHasil = questionAnalysis.map((q) => ({ q, hasil: getHasilAnalisis(q) }));
    const filtered = activeTab === "Semua" ? withHasil : withHasil.filter((r) => r.hasil === activeTab);
    return [...filtered].sort((a, b) => {
      if (sortBy === "nomor") return a.q.no - b.q.no;
      const priorityDiff = HASIL_PRIORITY[a.hasil] - HASIL_PRIORITY[b.hasil];
      return priorityDiff !== 0 ? priorityDiff : a.q.no - b.q.no;
    });
  }, [activeTab, sortBy, questionAnalysis]);

  const tabCounts: Record<TabValue, number> = {
    Semua: stats.totalSoal,
    "Perlu Diperbaiki": stats.diperbaiki,
    "Perlu Ditinjau": stats.ditinjau,
    "Layak Digunakan": stats.layak,
    "Tidak Dianalisis": stats.tidakDianalisis,
  };
  const tabBadgeClass: Record<TabValue, string> = {
    Semua: "bg-information-50 text-information-500",
    "Perlu Diperbaiki": "bg-error-50 text-error-500",
    "Perlu Ditinjau": "bg-secondary-50 text-warning-500",
    "Layak Digunakan": "bg-success-50 text-success-500",
    "Tidak Dianalisis": "bg-tertiary-50 text-tertiary-600",
  };

  return (
    <>
      <div className="flex flex-col gap-2.5">
        <Breadcrumbs
          items={[
            { label: "Asesmen" },
            { label: "Nilai Asesmen", to: "/" },
            { label: "Detail Nilai Asesmen", to: `/asesmen/${assessment.id}` },
            { label: "Analisis Butir Soal" },
          ]}
        />
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold text-tertiary-900">
              Analisis Butir Soal: {assessment.namaUjian}
            </h1>
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownload}
              className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-primary-500 px-4 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50 active:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isExporting ? "Menyiapkan Unduhan..." : "Unduh Hasil Analisis"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-tertiary-700">
            <span className="flex items-center gap-1">
              <FlaskConical size={16} />
              {assessment.mataPelajaran}
            </span>
            <div className="h-4 w-px bg-tertiary-300" />
            <span className="flex items-center gap-1">
              <GraduationCap size={16} />
              {assessment.kelas}
            </span>
            <div className="h-4 w-px bg-tertiary-300" />
            <span className="flex items-center gap-1">
              <Users size={16} />
              {assessment.jumlahPeserta} Peserta
            </span>
            <div className="h-4 w-px bg-tertiary-300" />
            <span className="flex items-center gap-1.5">
              {runInfo.label}
              <span className="flex items-center gap-1">
                <CalendarDays size={16} />
                {runInfo.tanggal}
              </span>
            </span>
            <div className="h-4 w-px bg-tertiary-300" />
            <span className="flex items-center gap-1.5">
              Oleh :
              <span className="flex items-center gap-1">
                <User size={16} />
                {runInfo.oleh}
              </span>
            </span>
          </div>
        </div>
      </div>

      <RingkasanKualitasPaketSoal assessment={assessment} stats={stats} jumlahPeserta={assessment.jumlahPeserta} />

      <div className="flex flex-col gap-4 rounded-[22px] bg-white p-5 shadow-[0_4px_10px_rgba(51,51,51,0.04)]">
        <span className="text-base font-semibold text-tertiary-900">Kualitas dan Distribusi Butir Soal</span>
        <div className="h-px w-full bg-tertiary-300" />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {(() => {
            const validPercent = stats.totalAnalyzable > 0 ? (stats.validCount / stats.totalAnalyzable) * 100 : 0;
            const tidakValidPercent = 100 - validPercent;
            const isValid = validPercent >= 50;
            const kesukaranTier = dominantTier(stats.kesukaranCount);
            const kesukaranPill = KESUKARAN_PILL[kesukaranTier];
            const dayaPembedaTier = dominantTier(stats.dayaPembedaCount);
            const dayaPembedaPill = DAYA_PEMBEDA_PILL[dayaPembedaTier];
            const efektifPercent =
              stats.distraktorApplicableCount > 0 ? (stats.efektifCount / stats.distraktorApplicableCount) * 100 : 0;
            const tidakEfektifPercent = 100 - efektifPercent;
            const isEfektif = efektifPercent >= 50;

            return (
              <>
                <DistributionCard
                  title="Validitas"
                  tooltip="Menunjukkan hubungan jawaban pada soal dengan hasil tes peserta secara keseluruhan pada semua soal yang dianalisis."
                  iconSrc={assetUrl("/images/icons/list-check.svg")}
                  mainValue={`${Math.round(validPercent)}`}
                  mainSuffix="%"
                  pillLabel={isValid ? "Valid" : "Tidak Valid"}
                  pillClassName={
                    isValid
                      ? "bg-success-50 border-success-200 text-success-500"
                      : "bg-error-50 border-error-200 text-error-500"
                  }
                  pillIcon={isValid ? <CircleCheck size={14} /> : undefined}
                  captionBold={`${stats.validCount} Soal Valid`}
                  captionRest={`Berdasarkan ${stats.totalAnalyzable} soal yang dapat dianalisis`}
                  distributionLabel="Distribusi Validitas"
                  segments={[
                    { className: "bg-success-500", percent: validPercent },
                    { className: "bg-error-500", percent: tidakValidPercent },
                  ]}
                  legendColumns={1}
                  legend={[
                    { dotClassName: "bg-success-500", label: "Valid", count: stats.validCount, percent: formatPercent(validPercent) },
                    {
                      dotClassName: "bg-error-500",
                      label: "Tidak Valid",
                      count: stats.tidakValidCount,
                      percent: formatPercent(tidakValidPercent),
                    },
                  ]}
                />

                <DistributionCard
                  title="Rata-Rata Tingkat Kesukaran"
                  tooltip="Menunjukkan tingkat kesulitan soal berdasarkan jumlah peserta yang menjawab dengan benar pada semua soal yang dianalisis."
                  iconSrc={assetUrl("/images/icons/trending-up.svg")}
                  mainValue={stats.avgKesukaran.toFixed(2).replace(".", ",")}
                  pillLabel={kesukaranTier}
                  pillClassName={kesukaranPill.className}
                  pillIcon={<kesukaranPill.icon size={14} />}
                  captionRest={`Berdasarkan ${stats.totalAnalyzable} soal yang dapat dianalisis`}
                  distributionLabel="Distribusi Tingkat Kesukaran"
                  segments={(Object.keys(stats.kesukaranCount) as DifficultyLevel[]).map((label) => ({
                    className: KESUKARAN_BAR_COLOR[label],
                    percent: stats.totalAnalyzable > 0 ? (stats.kesukaranCount[label] / stats.totalAnalyzable) * 100 : 0,
                  }))}
                  legendColumns={2}
                  legend={(Object.keys(stats.kesukaranCount) as DifficultyLevel[]).map((label) => ({
                    dotClassName: KESUKARAN_BAR_COLOR[label],
                    label,
                    count: stats.kesukaranCount[label],
                    percent: formatPercent(
                      stats.totalAnalyzable > 0 ? (stats.kesukaranCount[label] / stats.totalAnalyzable) * 100 : 0,
                    ),
                  }))}
                />

                <DistributionCard
                  title="Rata-Rata Daya Pembeda"
                  tooltip="Menunjukkan kemampuan soal dalam membedakan peserta berdasarkan tingkat kemampuannya pada semua soal yang dianalisis."
                  iconSrc={assetUrl("/images/icons/layers-difference.svg")}
                  mainValue={stats.avgDayaPembeda.toFixed(2).replace(".", ",")}
                  pillLabel={dayaPembedaTier}
                  pillClassName={dayaPembedaPill.className}
                  pillIcon={<dayaPembedaPill.icon size={14} />}
                  captionRest={`Berdasarkan ${stats.totalAnalyzable} soal yang dapat dianalisis`}
                  distributionLabel="Distribusi Daya Pembeda"
                  segments={(Object.keys(stats.dayaPembedaCount) as DiscriminationLevel[]).map((label) => ({
                    className: DAYA_PEMBEDA_BAR_COLOR[label],
                    percent: stats.totalAnalyzable > 0 ? (stats.dayaPembedaCount[label] / stats.totalAnalyzable) * 100 : 0,
                  }))}
                  legendColumns={2}
                  legend={(Object.keys(stats.dayaPembedaCount) as DiscriminationLevel[]).map((label) => ({
                    dotClassName: DAYA_PEMBEDA_BAR_COLOR[label],
                    label,
                    count: stats.dayaPembedaCount[label],
                    percent: formatPercent(
                      stats.totalAnalyzable > 0 ? (stats.dayaPembedaCount[label] / stats.totalAnalyzable) * 100 : 0,
                    ),
                  }))}
                />

                <DistributionCard
                  title="Efektivitas Distraktor"
                  tooltip="Menunjukkan efektivitas pilihan jawaban salah sebagai pengecoh pada semua soal yang dianalisis."
                  iconSrc={assetUrl("/images/icons/equal-not.svg")}
                  mainValue={`${Math.round(efektifPercent)}`}
                  mainSuffix="%"
                  pillLabel={isEfektif ? "Efektif" : "Tidak Efektif"}
                  pillClassName={
                    isEfektif
                      ? "bg-success-50 border-success-200 text-success-500"
                      : "bg-error-50 border-error-200 text-error-500"
                  }
                  pillIcon={isEfektif ? <CircleCheck size={14} /> : undefined}
                  captionBold={`${stats.efektifCount} Soal Efektif`}
                  captionRest={`Berdasarkan ${stats.distraktorApplicableCount} soal yang dapat dianalisis`}
                  distributionLabel="Distribusi Efektifitas Distraktor"
                  segments={[
                    { className: "bg-success-500", percent: efektifPercent },
                    { className: "bg-error-500", percent: tidakEfektifPercent },
                  ]}
                  legendColumns={1}
                  legend={[
                    {
                      dotClassName: "bg-success-500",
                      label: "Efektif",
                      count: stats.efektifCount,
                      percent: formatPercent(efektifPercent),
                    },
                    {
                      dotClassName: "bg-error-500",
                      label: "Tidak Efektif",
                      count: stats.tidakEfektifCount,
                      percent: formatPercent(tidakEfektifPercent),
                    },
                  ]}
                />
              </>
            );
          })()}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[22px] bg-white p-5 shadow-[0_4px_10px_rgba(51,51,51,0.04)]">
        <span className="text-base font-semibold text-tertiary-900">Daftar Analisis Soal</span>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex h-9 w-[280px] items-center gap-2 rounded-lg border border-tertiary-300 bg-white px-4">
            <Search size={16} className="text-tertiary-500" />
            <input
              type="text"
              placeholder="Cari nomor soal atau kata kunci soal"
              className="w-full text-xs text-tertiary-900 placeholder:text-tertiary-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <div ref={sortRef} className="relative">
              <button
                type="button"
                onClick={() => setSortOpen((open) => !open)}
                className="flex h-9 w-[248px] items-center gap-2 rounded-lg border border-tertiary-300 bg-white px-4 text-xs text-tertiary-900"
              >
                <ArrowUpDown size={16} className="text-tertiary-500" />
                <span className="flex-1 truncate text-left">
                  Urutkan : {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
                </span>
                <ChevronDown size={16} className="text-tertiary-500" />
              </button>
              {sortOpen && (
                <div className="absolute right-0 z-10 mt-1 w-full rounded-lg border border-tertiary-300 bg-white p-1 shadow-lg">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                      className={`flex w-full items-center rounded-md px-3 py-2 text-left text-xs ${
                        sortBy === opt.value
                          ? "bg-primary-50 font-semibold text-primary-500"
                          : "text-tertiary-900 hover:bg-tertiary-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className="flex h-9 items-center gap-1 rounded-lg border border-primary-400 bg-primary-100 px-4 text-sm font-semibold text-primary-500"
            >
              <ListFilter size={16} />
              Filter
            </button>
          </div>
        </div>

        <div className="flex items-stretch gap-3 overflow-x-auto border-b border-tertiary-300">
          {TABS.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`relative flex items-center gap-2 whitespace-nowrap px-3 py-3 text-sm ${
                  isActive ? "font-semibold text-primary-500" : "text-tertiary-700"
                }`}
              >
                {tab}
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${tabBadgeClass[tab]}`}
                >
                  {tabCounts[tab]}
                </span>
                {isActive && <span className="absolute inset-x-0 bottom-0 h-1 rounded-t bg-primary-500" />}
              </button>
            );
          })}
        </div>

        <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-tertiary-300">
          <table className="border-separate border-spacing-0 text-left">
            <colgroup>
              <col style={{ width: NO_WIDTH, minWidth: NO_WIDTH }} />
              <col style={{ width: SOAL_WIDTH, minWidth: SOAL_WIDTH }} />
              <col style={{ width: 150, minWidth: 150 }} />
              <col style={{ width: 140, minWidth: 140 }} />
              <col style={{ width: 150, minWidth: 150 }} />
              <col style={{ width: 150, minWidth: 150 }} />
              <col style={{ width: 150, minWidth: 150 }} />
              <col style={{ width: 140, minWidth: 140 }} />
              <col style={{ width: 170, minWidth: 170 }} />
            </colgroup>
            <thead>
              <tr>
                {["No", "Soal", "Jenis", "Validitas", "Kesukaran", "Daya Pembeda", "Distraktor", "Analisis", "Hasil Analisis"].map(
                  (header, i) => (
                    <th
                      key={header}
                      style={
                        i === 0
                          ? { position: "sticky", left: 0, zIndex: 2 }
                          : i === 1
                            ? { position: "sticky", left: NO_WIDTH, zIndex: 2 }
                            : undefined
                      }
                      className={`whitespace-nowrap border-b border-tertiary-300 bg-tertiary-50 px-4 py-4 text-sm font-bold text-tertiary-900 ${
                        i === 1 ? STICKY_SHADOW : ""
                      }`}
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ q, hasil }: { q: QuestionAnalysis; hasil: HasilAnalisis }) => {
                const distraktor = getDistraktorStatus(q);
                const distraktorPercent = getDistraktorPercent(q);
                const analisisProgress = getAnalisisProgress(q);
                const hasilStyle = HASIL_STYLES[hasil];
                const analisisStyle = ANALISIS_STYLES[analisisProgress];
                return (
                  <tr
                    key={q.no}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/asesmen/${assessment.id}/analisis-butir-soal/soal/${q.no}`)}
                  >
                    <td
                      style={{ position: "sticky", left: 0, zIndex: 1 }}
                      className="whitespace-nowrap border-b border-tertiary-300 bg-white px-4 py-4 text-sm text-tertiary-900 transition-colors group-hover:bg-tertiary-100"
                    >
                      {q.no}
                    </td>
                    <td
                      style={{ position: "sticky", left: NO_WIDTH, zIndex: 1 }}
                      className={`border-b border-tertiary-300 bg-white px-4 py-4 text-sm text-tertiary-900 transition-colors group-hover:bg-tertiary-100 ${STICKY_SHADOW}`}
                    >
                      <span className="line-clamp-2">{q.cuplikanSoal}</span>
                    </td>
                    <td className="border-b border-tertiary-300 bg-white px-4 py-4 transition-colors group-hover:bg-tertiary-100">
                      <JenisPill jenis={q.jenis} />
                    </td>
                    <td className="whitespace-nowrap border-b border-tertiary-300 bg-white px-4 py-4 text-sm text-tertiary-900 transition-colors group-hover:bg-tertiary-100">
                      {q.validitas ? (
                        <div className="flex items-center gap-2">
                          <span>{q.validitas.value.toFixed(2)}</span>
                          <span
                            className={`font-semibold ${
                              q.validitas.label === "Valid" ? "text-success-500" : "text-error-500"
                            }`}
                          >
                            {q.validitas.label}
                          </span>
                        </div>
                      ) : (
                        <span className="text-tertiary-600">Tidak Dianalisis</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap border-b border-tertiary-300 bg-white px-4 py-4 text-sm text-tertiary-900 transition-colors group-hover:bg-tertiary-100">
                      {q.tingkatKesukaran ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span>{q.tingkatKesukaran.value.toFixed(2)}</span>
                            <span className={`font-semibold ${KESUKARAN_STYLES[q.tingkatKesukaran.label].textClass}`}>
                              {q.tingkatKesukaran.label}
                            </span>
                          </div>
                          <div className="h-0.5 w-[72px] overflow-hidden rounded-full bg-tertiary-100">
                            <div
                              className={`h-full rounded-full ${KESUKARAN_STYLES[q.tingkatKesukaran.label].barClass}`}
                              style={{ width: `${KESUKARAN_STYLES[q.tingkatKesukaran.label].percent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-tertiary-600">Tidak Dianalisis</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap border-b border-tertiary-300 bg-white px-4 py-4 text-sm text-tertiary-900 transition-colors group-hover:bg-tertiary-100">
                      {q.dayaPembeda ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span>{q.dayaPembeda.value.toFixed(2)}</span>
                            <span className={`font-semibold ${DAYA_PEMBEDA_STYLES[q.dayaPembeda.label].textClass}`}>
                              {q.dayaPembeda.label}
                            </span>
                          </div>
                          <div className="h-0.5 w-[72px] overflow-hidden rounded-full bg-tertiary-100">
                            <div
                              className={`h-full rounded-full ${DAYA_PEMBEDA_STYLES[q.dayaPembeda.label].barClass}`}
                              style={{ width: `${DAYA_PEMBEDA_STYLES[q.dayaPembeda.label].percent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-tertiary-600">Tidak Dianalisis</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap border-b border-tertiary-300 bg-white px-4 py-4 text-sm text-tertiary-900 transition-colors group-hover:bg-tertiary-100">
                      {distraktor === "Tidak Dianalisis" ? (
                        <span className="text-tertiary-600">Tidak Dianalisis</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{distraktorPercent?.toFixed(1).replace(".", ",")}%</span>
                          <span
                            className={`font-semibold ${
                              distraktor === "Efektif" ? "text-success-500" : "text-error-500"
                            }`}
                          >
                            {distraktor}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap border-b border-tertiary-300 bg-white px-4 py-4 transition-colors group-hover:bg-tertiary-100">
                      <StatusPill label={analisisProgress} className={analisisStyle.className} icon={analisisStyle.icon} />
                    </td>
                    <td className="whitespace-nowrap border-b border-tertiary-300 bg-white px-4 py-4 transition-colors group-hover:bg-tertiary-100">
                      <StatusPill label={hasil} className={hasilStyle.className} icon={hasilStyle.icon} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-tertiary-600">
            Menampilkan {rows.length} dari total {stats.totalSoal} soal
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-tertiary-300 text-tertiary-500"
              disabled
            >
              <ChevronLeft size={16} />
            </button>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-sm font-semibold text-white">
              1
            </span>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-tertiary-300 text-tertiary-500"
              disabled
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
