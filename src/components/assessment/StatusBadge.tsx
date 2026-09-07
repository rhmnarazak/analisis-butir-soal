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

export function StatusBadge({ status }: { status: Assessment["status"] }) {
  return <Pill label={status} className={statusStyles[status]} />;
}

export function MetodeBadge({ metode }: { metode: Assessment["metode"] }) {
  return <Pill label={metode} className={metodeStyles[metode]} />;
}
