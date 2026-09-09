import type { Assessment } from "../../types/assessment";

const statusStyles: Record<Assessment["status"], string> = {
  "Perlu Dinilai": "bg-secondary-50 border-secondary-200 text-warning-500",
  "Siap Dipublikasi": "bg-information-50 border-information-200 text-information-500",
  Selesai: "bg-success-50 border-success-200 text-success-500",
};

const metodeStyles: Record<Assessment["metode"], string> = {
  Online: "bg-success-50 border-success-200 text-success-500",
  Offline: "bg-tertiary-50 border-tertiary-200 text-tertiary-600",
};

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-[26px] border px-2.5 py-0.5 text-sm font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

// A "Selesai" assessment whose nilai has been edited since it was last
// published reads as "Publikasi Ulang" wherever its status shows up — the
// assessment list (table/card) and the detail page's Ringkasan card alike
// — instead of just repeating "Selesai". Two independent triggers:
// - anbusoState "Perbarui Hasil Analisis": AnBuSo had already run and is
//   now stale.
// - perluPublikasiUlang: nilai was edited before AnBuSo ever ran (anbusoState
//   still "Analisis Sekarang" or similar) — nothing analysis-wise to go
//   stale, but the published nilai itself is. Set/cleared by
//   AssessmentStore's updateNilaiPeserta()/publishNilai(); intentionally
//   does NOT change anbusoState, so the AnBuSo tab chip stays as-is.
export function needsRepublish(
  assessment: Pick<Assessment, "status" | "anbusoState" | "perluPublikasiUlang">,
): boolean {
  return (
    assessment.status === "Selesai" &&
    (assessment.anbusoState === "Perbarui Hasil Analisis" || !!assessment.perluPublikasiUlang)
  );
}

export function StatusBadge({
  status,
  anbusoState,
  perluPublikasiUlang,
}: {
  status: Assessment["status"];
  anbusoState: Assessment["anbusoState"];
  perluPublikasiUlang?: boolean;
}) {
  if (needsRepublish({ status, anbusoState, perluPublikasiUlang })) {
    return <Pill label="Publikasi Ulang" className="bg-secondary-50 border-secondary-200 text-warning-500" />;
  }
  return <Pill label={status} className={statusStyles[status]} />;
}

export function MetodeBadge({ metode }: { metode: Assessment["metode"] }) {
  return <Pill label={metode} className={metodeStyles[metode]} />;
}
