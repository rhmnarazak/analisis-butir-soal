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
// — instead of just repeating "Selesai". perluPublikasiUlang is the sole
// source of truth for this: it's set/cleared by AssessmentStore's
// updateNilaiPeserta()/publishNilai(), deliberately independent of
// anbusoState — the AnBuSo tab chip can (and often does) disagree, e.g.
// still "Perlu Diperbarui" right after a republish that hasn't re-run
// AnBuSo yet, even though the assessment status itself is back to
// "Selesai".
export function needsRepublish(assessment: Pick<Assessment, "status" | "perluPublikasiUlang">): boolean {
  return assessment.status === "Selesai" && !!assessment.perluPublikasiUlang;
}

export function StatusBadge({
  status,
  perluPublikasiUlang,
}: {
  status: Assessment["status"];
  perluPublikasiUlang?: boolean;
}) {
  if (needsRepublish({ status, perluPublikasiUlang })) {
    return <Pill label="Publikasi Ulang" className="bg-secondary-50 border-secondary-200 text-warning-500" />;
  }
  return <Pill label={status} className={statusStyles[status]} />;
}

export function MetodeBadge({ metode }: { metode: Assessment["metode"] }) {
  return <Pill label={metode} className={metodeStyles[metode]} />;
}
