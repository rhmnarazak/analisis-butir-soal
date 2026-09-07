import { Info } from "lucide-react";
import type { ReactNode } from "react";

// Shared building blocks for the chart-style summary cards used across the
// Analisis Butir Soal detail page (Ringkasan section + the Kualitas dan
// Distribusi Butir Soal section), kept in one place so every card stays
// visually consistent.

// Formats a percentage to at most one decimal place with an Indonesian comma
// separator (e.g. 87.5 -> "87,5%", 88 -> "88%").
export function formatPercent(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(".", ",");
  return `${text}%`;
}

export function Pill({ label, className, icon }: { label: string; className: string; icon?: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-[26px] border px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

export function LegendRow({
  dotClassName,
  label,
  count,
  unit = "Soal",
  percent,
}: {
  dotClassName: string;
  label: string;
  count?: number;
  unit?: string;
  percent?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className={`h-3 w-3 shrink-0 rounded-full ${dotClassName}`} />
      <span className="text-tertiary-800">{label}</span>
      {(count !== undefined || percent !== undefined) && (
        <span className="ml-auto flex items-center gap-1.5">
          {count !== undefined && (
            <span className="font-semibold text-tertiary-900">
              {count} {unit}
            </span>
          )}
          {percent !== undefined && (
            <>
              <span className="h-3 border-l border-tertiary-100" />
              <span className="text-tertiary-700">{percent}</span>
            </>
          )}
        </span>
      )}
    </div>
  );
}

// A single-color stacked bar segment, used by every distribution chart on
// this page. Zero-value segments are dropped so they don't leave a stray gap.
export function StackedSegments({ segments }: { segments: { className: string; percent: number }[] }) {
  return (
    <div className="flex h-6 w-full gap-0.5">
      {segments
        .filter((segment) => segment.percent > 0)
        .map((segment, i) => (
          <div key={i} className={`h-full rounded ${segment.className}`} style={{ width: `${segment.percent}%` }} />
        ))}
    </div>
  );
}

// A flush (no-gap, no-rounding) segmented number-line with a colored 1px
// divider at each boundary and a vertical marker at the actual value —
// pattern established for the Reliabilitas Tes card, reused for any
// threshold-style chart (a value classified into ordered bands).
export function ThresholdBar({
  bands,
  endDividerClassName,
  markerPercent,
  startLabel = "0",
  endLabel = "1",
}: {
  bands: { className: string; width: number; dividerClassName: string; tick?: string }[];
  endDividerClassName: string;
  markerPercent: number;
  startLabel?: string;
  endLabel?: string;
}) {
  const clampedMarker = Math.max(0, Math.min(100, markerPercent));
  let tickOffset = 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="relative flex h-6 w-full">
        {bands.map((band, i) => (
          <div key={i} className="flex" style={{ width: `${band.width}%` }}>
            <span className={`w-px shrink-0 self-stretch ${band.dividerClassName}`} />
            <span className={`h-full flex-1 ${band.className}`} />
          </div>
        ))}
        <span className={`w-px shrink-0 self-stretch ${endDividerClassName}`} />
        <div
          className="absolute top-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-black"
          style={{ left: `${clampedMarker}%` }}
        />
      </div>
      <div className="relative h-3 w-full text-[8px] text-tertiary-700">
        <span className="absolute left-0">{startLabel}</span>
        {bands.map((band, i) => {
          tickOffset += band.width;
          return band.tick ? (
            <span key={i} className="absolute -translate-x-1/2" style={{ left: `${tickOffset}%` }}>
              {band.tick}
            </span>
          ) : null;
        })}
        <span className="absolute right-0">{endLabel}</span>
      </div>
    </div>
  );
}

export function ChartCard({
  title,
  icon,
  iconBg,
  border,
  tooltip,
  children,
}: {
  title: string;
  icon?: ReactNode;
  iconBg?: string;
  border: string;
  tooltip?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-1 flex-col gap-4 rounded-lg border bg-white p-6 ${border}`} style={{ minWidth: 320 }}>
      <div className="flex items-center gap-2">
        {icon && <span className={`flex shrink-0 items-center justify-center rounded p-2 ${iconBg}`}>{icon}</span>}
        <span className="text-base font-semibold text-tertiary-900">{title}</span>
        {tooltip && <Info size={16} className="text-tertiary-400" />}
      </div>
      {children}
    </div>
  );
}
