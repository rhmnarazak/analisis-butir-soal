import { ChevronDown } from "lucide-react";

export function PageHeader() {
  return (
    <div className="flex items-center gap-5">
      <h1 className="flex-1 text-2xl font-semibold text-tertiary-900">Nilai Asesmen</h1>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-tertiary-900">Tahun Ajaran</span>
        <button
          type="button"
          className="flex w-[140px] items-center justify-between gap-2 rounded-lg border border-tertiary-300 bg-white px-4 py-2"
        >
          <span className="text-xs text-tertiary-900">2024/2025</span>
          <ChevronDown size={16} className="text-tertiary-500" />
        </button>
      </div>
    </div>
  );
}
