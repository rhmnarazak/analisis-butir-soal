import { AlertTriangle, Ban, CircleCheck, CircleX } from "lucide-react";
import { useRef } from "react";
import { useHorizontalWheelScroll } from "../../hooks/useHorizontalWheelScroll";
import {
  getAlasanPerluPerhatian,
  getAnalisisProgress,
  getDistraktorPercent,
  getDistraktorStatus,
  type AnalisisProgress,
  type HasilAnalisis,
} from "../../lib/itemAnalysisStats";
import type { DifficultyLevel, DiscriminationLevel, QuestionAnalysis } from "../../types/assessment";
import { JenisPill } from "./SoalTab";

// Per Figma nodes 5981-201734/733/735/736/737: the bar length is a fixed
// step per difficulty band, not the raw kesukaran value — a soal exactly on
// the easy/hard extremes (weak discrimination) is flagged red just like its
// opposite, with "Sedang" as the psychometric sweet spot.
export const KESUKARAN_STYLES: Record<DifficultyLevel, { textClass: string; barClass: string; percent: number }> = {
  "Sangat Mudah": { textClass: "text-error-500", barClass: "bg-error-500", percent: 100 },
  Mudah: { textClass: "text-warning-500", barClass: "bg-warning-500", percent: 75 },
  Sedang: { textClass: "text-success-500", barClass: "bg-primary-600", percent: 50 },
  Sukar: { textClass: "text-warning-500", barClass: "bg-warning-500", percent: 25 },
  "Sangat Sukar": { textClass: "text-error-500", barClass: "bg-error-500", percent: 0 },
};

// Per Figma nodes 5981-201777/778/779/780/781: same fixed-step-per-band
// pattern as Kesukaran, but here higher is always better (no U-shape).
export const DAYA_PEMBEDA_STYLES: Record<DiscriminationLevel, { textClass: string; barClass: string; percent: number }> = {
  "Tinggi Sekali": { textClass: "text-success-700", barClass: "bg-success-700", percent: 100 },
  Tinggi: { textClass: "text-success-500", barClass: "bg-success-500", percent: 75 },
  Sedang: { textClass: "text-warning-500", barClass: "bg-warning-500", percent: 50 },
  Rendah: { textClass: "text-error-500", barClass: "bg-error-500", percent: 25 },
  "Rendah Sekali": { textClass: "text-error-700", barClass: "bg-error-700", percent: 0 },
};

export const HASIL_STYLES: Record<HasilAnalisis, { className: string; icon: typeof AlertTriangle }> = {
  "Layak Digunakan": { className: "bg-success-50 border-success-200 text-success-500", icon: CircleCheck },
  "Perlu Ditinjau": { className: "bg-secondary-50 border-secondary-200 text-warning-500", icon: AlertTriangle },
  "Perlu Diperbaiki": { className: "bg-error-50 border-error-200 text-error-500", icon: CircleX },
  "Tidak Dianalisis": { className: "bg-tertiary-50 border-tertiary-200 text-tertiary-600", icon: Ban },
};

export const ANALISIS_STYLES: Record<AnalisisProgress, { className: string; icon: typeof AlertTriangle }> = {
  Lengkap: { className: "bg-success-50 border-success-200 text-success-500", icon: CircleCheck },
  Sebagian: { className: "bg-secondary-50 border-secondary-200 text-warning-500", icon: AlertTriangle },
  "Tidak Ada": { className: "bg-tertiary-50 border-tertiary-200 text-tertiary-600", icon: Ban },
};

export function StatusPill({
  label,
  className,
  icon: Icon,
}: {
  label: string;
  className: string;
  icon: typeof AlertTriangle;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-[26px] border px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

// Fixed column widths so the sticky No/Soal columns have a stable left
// offset — same technique as the sticky tables elsewhere in this app.
const NO_WIDTH = 64;
const SOAL_WIDTH = 210;
const ALASAN_WIDTH = 260;
const STICKY_SHADOW = "shadow-[3px_0px_5px_-3px_rgba(0,0,0,0.1)]";

// The per-soal analysis table shared by AnalisisDetailPage's own "Semua
// Soal" list and SoalPerluPerhatianDialog's filtered popup — one
// implementation so the two can never show different columns/values for the
// same soal. `showAlasan` adds the "Alasan" column (why a soal was flagged
// Perlu Ditinjau/Diperbaiki) that only the popup needs.
export function AnalisisSoalTable({
  rows,
  onRowClick,
  showAlasan = false,
}: {
  rows: { q: QuestionAnalysis; hasil: HasilAnalisis }[];
  onRowClick?: (q: QuestionAnalysis) => void;
  showAlasan?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useHorizontalWheelScroll(scrollRef);

  const headers = [
    "No",
    "Soal",
    "Jenis",
    "Validitas",
    "Kesukaran",
    "Daya Pembeda",
    "Distraktor",
    "Analisis",
    "Hasil Analisis",
    ...(showAlasan ? ["Alasan"] : []),
  ];

  return (
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
          {showAlasan && <col style={{ width: ALASAN_WIDTH, minWidth: ALASAN_WIDTH }} />}
        </colgroup>
        <thead>
          <tr>
            {headers.map((header, i) => (
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
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ q, hasil }) => {
            const distraktor = getDistraktorStatus(q);
            const distraktorPercent = getDistraktorPercent(q);
            const analisisProgress = getAnalisisProgress(q);
            const hasilStyle = HASIL_STYLES[hasil];
            const analisisStyle = ANALISIS_STYLES[analisisProgress];
            const alasan = showAlasan ? getAlasanPerluPerhatian(q) : [];
            return (
              <tr
                key={q.no}
                className={onRowClick ? "group cursor-pointer" : "group"}
                onClick={onRowClick ? () => onRowClick(q) : undefined}
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
                        className={`font-semibold ${distraktor === "Efektif" ? "text-success-500" : "text-error-500"}`}
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
                {showAlasan && (
                  <td className="border-b border-tertiary-300 bg-white px-4 py-4 text-sm text-tertiary-900 transition-colors group-hover:bg-tertiary-100">
                    {alasan.length > 0 ? (
                      <ul className="flex flex-col gap-1">
                        {alasan.map((a) => (
                          <li key={a.kriteria} className="whitespace-nowrap">
                            <span className="text-tertiary-600">{a.kriteria}:</span>{" "}
                            <span className="font-semibold text-error-500">{a.detail}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-tertiary-600">—</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
