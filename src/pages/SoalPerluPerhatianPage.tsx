import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, ListFilter, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { HASIL_STYLES, StatusPill } from "../components/detail/AnalisisSoalTable";
import { JenisPill } from "../components/detail/SoalTab";
import { getQuestionsForAssessment } from "../data/questionAnalysis";
import { usePageTitle } from "../hooks/usePageTitle";
import {
  getDistraktorPercent,
  getDistraktorStatus,
  getHasilAnalisis,
  HASIL_PRIORITY,
  type HasilAnalisis,
} from "../lib/itemAnalysisStats";
import { buildInterpretasi, HASIL_BANNER, type InterpretasiPoint } from "../lib/soalInterpretasi";
import { useAssessmentStore } from "../state/AssessmentStore";
import type { QuestionAnalysis } from "../types/assessment";

const SORT_OPTIONS = [
  { value: "prioritas", label: "Perlu Perhatian" },
  { value: "nomor", label: "No. Soal" },
] as const;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];

// Per-severity cell background — same tone every other "why is this
// flagged" surface in the app uses (banners, alerts): -25 shade background,
// dark text for anything actionable, muted tertiary for "not analyzed".
const TONE_BG: Record<InterpretasiPoint["severity"], string> = {
  success: "bg-success-25",
  warning: "bg-warning-25",
  error: "bg-error-25",
  neutral: "bg-tertiary-25",
};

// This page only ever lists "Perlu Ditinjau"/"Perlu Diperbaiki" soal, but
// keyed on the full HasilAnalisis type so it stays correct if that ever
// changes — same -25 tone as HASIL_BANNER's own bg, just keyed for the cell.
const HASIL_CELL_BG: Record<HasilAnalisis, string> = {
  "Layak Digunakan": TONE_BG.success,
  "Perlu Ditinjau": TONE_BG.warning,
  "Perlu Diperbaiki": TONE_BG.error,
  "Tidak Dianalisis": TONE_BG.neutral,
};

// One metric column's cell: value+label (when the metric was analyzed) plus
// the same interpretation sentence SoalDetailPage shows for this soal/metric
// — so "why it's flagged" reads identically in both places.
function MetricCell({ point, value }: { point: InterpretasiPoint; value: ReactNode | null }) {
  return (
    <td className={`border-b border-l border-tertiary-300 px-3 py-3 align-top text-sm break-words ${TONE_BG[point.severity]}`}>
      <div className="flex flex-col gap-1">
        {value ?? <span className="text-tertiary-600">Tidak Dianalisis</span>}
        <p className={point.severity === "neutral" ? "text-tertiary-600" : "text-tertiary-900"}>{point.text}</p>
      </div>
    </td>
  );
}

export function SoalPerluPerhatianPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortValue>("prioritas");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) setSortOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { getAssessment } = useAssessmentStore();
  const assessment = getAssessment(id ?? "");
  usePageTitle(assessment ? `Soal Perlu Perhatian - ${assessment.namaUjian}` : "Soal Perlu Perhatian");

  const questionAnalysis = getQuestionsForAssessment(id ?? "");
  const backHref = `/asesmen/${id}/analisis-butir-soal`;

  const rows = useMemo(() => {
    const withHasil = questionAnalysis.map((q) => ({ q, hasil: getHasilAnalisis(q) }));
    return withHasil
      .filter((r) => r.hasil === "Perlu Ditinjau" || r.hasil === "Perlu Diperbaiki")
      .sort((a, b) => {
        if (sortBy === "nomor") return a.q.no - b.q.no;
        const priorityDiff = HASIL_PRIORITY[a.hasil] - HASIL_PRIORITY[b.hasil];
        return priorityDiff !== 0 ? priorityDiff : a.q.no - b.q.no;
      });
  }, [questionAnalysis, sortBy]);

  if (!assessment) return <Navigate to="/" replace />;

  function goToSoal(q: QuestionAnalysis) {
    navigate(`/asesmen/${id}/analisis-butir-soal/soal/${q.no}`);
  }

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <div className="flex shrink-0 items-center justify-between border-b border-tertiary-200 bg-white px-6 py-6">
        <span className="text-xl font-semibold text-tertiary-900">Soal Perlu Perhatian</span>
        <button type="button" onClick={() => navigate(backHref)} aria-label="Tutup">
          <XCircle size={24} className="text-tertiary-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-[1392px] flex-col gap-5 rounded-[22px] bg-white p-5 shadow-[0_4px_10px_rgba(51,51,51,0.04)]">
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

          <div className="overflow-hidden rounded-xl border border-tertiary-300">
            <table className="w-full table-fixed border-separate border-spacing-0 text-left">
              <colgroup>
                <col style={{ width: "5%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <thead>
                <tr>
                  {["No", "Soal", "Validitas", "Tingkat Kesukaran", "Daya Pembeda", "Efektivitas Distraktor", "Hasil Analisis"].map((h, i) => (
                    <th
                      key={h}
                      className={`border-b border-tertiary-300 bg-tertiary-50 px-3 py-4 text-sm font-bold text-tertiary-900 ${
                        i > 1 ? "border-l" : ""
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ q, hasil }) => {
                  const interpretasi = buildInterpretasi(q);
                  const distraktorStatus = getDistraktorStatus(q);
                  const distraktorPercent = getDistraktorPercent(q);
                  return (
                    <tr key={q.no} className="group cursor-pointer" onClick={() => goToSoal(q)}>
                      <td className="border-b border-tertiary-300 bg-white px-3 py-3 align-top text-sm text-tertiary-900 transition-colors group-hover:bg-tertiary-100">
                        {q.no}
                      </td>
                      <td className="border-b border-tertiary-300 bg-white px-3 py-3 align-top break-words transition-colors group-hover:bg-tertiary-100">
                        <div className="flex flex-col gap-1">
                          <JenisPill jenis={q.jenis} />
                          <span className="line-clamp-3 text-sm text-tertiary-900">{q.cuplikanSoal}</span>
                        </div>
                      </td>
                      <MetricCell
                        point={interpretasi.validitas}
                        value={
                          q.validitas && (
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <span className="font-bold text-tertiary-900">{q.validitas.value.toFixed(2).replace(".", ",")}</span>
                              <span
                                className={`font-semibold ${
                                  q.validitas.label === "Valid" ? "text-success-500" : "text-error-500"
                                }`}
                              >
                                {q.validitas.label}
                              </span>
                            </div>
                          )
                        }
                      />
                      <MetricCell
                        point={interpretasi.kesukaran}
                        value={
                          q.tingkatKesukaran && (
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <span className="font-bold text-tertiary-900">
                                {q.tingkatKesukaran.value.toFixed(2).replace(".", ",")}
                              </span>
                              <span className="font-semibold text-tertiary-900">{q.tingkatKesukaran.label}</span>
                            </div>
                          )
                        }
                      />
                      <MetricCell
                        point={interpretasi.dayaPembeda}
                        value={
                          q.dayaPembeda && (
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <span className="font-bold text-tertiary-900">
                                {q.dayaPembeda.value.toFixed(2).replace(".", ",")}
                              </span>
                              <span className="font-semibold text-tertiary-900">{q.dayaPembeda.label}</span>
                            </div>
                          )
                        }
                      />
                      <MetricCell
                        point={interpretasi.distraktor}
                        value={
                          distraktorStatus !== "Tidak Dianalisis" && (
                            <div className="flex flex-wrap items-baseline gap-x-2">
                              <span className="font-bold text-tertiary-900">
                                {distraktorPercent?.toFixed(1).replace(".", ",")}%
                              </span>
                              <span
                                className={`font-semibold ${
                                  distraktorStatus === "Efektif" ? "text-success-500" : "text-error-500"
                                }`}
                              >
                                {distraktorStatus}
                              </span>
                            </div>
                          )
                        }
                      />
                      <td className={`border-b border-l border-tertiary-300 px-3 py-3 align-top text-sm break-words ${HASIL_CELL_BG[hasil]}`}>
                        <div className="flex flex-col gap-1.5">
                          <StatusPill label={hasil} className={HASIL_STYLES[hasil].className} icon={HASIL_STYLES[hasil].icon} />
                          <p className="text-tertiary-900">{HASIL_BANNER[hasil].desc}</p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-tertiary-600">Menampilkan {rows.length} soal</span>
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
      </div>
    </div>
  );
}

