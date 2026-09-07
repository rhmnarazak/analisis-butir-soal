import type { AssessmentStatus } from "../../types/assessment";

export type TabValue = "Semua" | AssessmentStatus;

interface TabBarProps {
  active: TabValue;
  onChange: (tab: TabValue) => void;
  counts: Record<AssessmentStatus, number>;
}

const badgeStyles: Record<AssessmentStatus, string> = {
  "Perlu Dinilai": "bg-warning-50 text-warning-500",
  "Siap Dipublikasi": "bg-information-50 text-information-500",
  Selesai: "bg-success-50 text-success-500",
};

export function TabBar({ active, onChange, counts }: TabBarProps) {
  const tabs: TabValue[] = ["Semua", "Perlu Dinilai", "Siap Dipublikasi", "Selesai"];

  return (
    <div className="flex h-14 items-stretch gap-3 border-b border-tertiary-300 bg-white">
      {tabs.map((tab) => {
        const isActive = tab === active;
        const count = tab !== "Semua" ? counts[tab] : undefined;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`relative flex items-center gap-2 px-3 py-3 text-sm ${
              isActive ? "font-semibold text-primary-500" : "text-tertiary-700"
            }`}
          >
            {tab}
            {count !== undefined && count > 0 && (
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${badgeStyles[tab as AssessmentStatus]}`}
              >
                {count}
              </span>
            )}
            {isActive && (
              <span className="absolute inset-x-0 bottom-0 h-1 rounded-t bg-primary-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
