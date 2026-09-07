import { AlertTriangle, Ban, CircleCheck, Info, Loader2, type LucideIcon } from "lucide-react";
import type { AnbusoState } from "../../types/assessment";

export type DetailTab = "Peserta" | "Soal" | "Analisis Butir Soal";

interface DetailTabBarProps {
  active: DetailTab;
  onChange: (tab: DetailTab) => void;
  anbusoState: AnbusoState;
  totalSoal: number;
  soalDapatDianalisis: number;
}

interface AnbusoChip {
  label: string;
  className: string;
  icon: LucideIcon;
  iconClassName?: string;
}

// Chip styles per Figma nodes 5978-195094/195122/195136/195146/195155. Every
// state but "Tidak Ada Analisis" (no design given) maps to one of these.
function getAnbusoChip(state: AnbusoState, totalSoal: number, soalDapatDianalisis: number): AnbusoChip | null {
  const warning = "bg-secondary-50 border-secondary-200 text-warning-500";
  const information = "bg-information-50 border-information-200 text-information-500";
  const success = "bg-success-50 border-success-200 text-success-500";
  const error = "bg-error-50 border-error-200 text-error-500";

  switch (state) {
    case "Menunggu Penilaian":
      return { label: state, className: warning, icon: Loader2, iconClassName: "animate-spin" };
    case "Menunggu Publikasi":
      return { label: state, className: warning, icon: Loader2, iconClassName: "animate-spin" };
    case "Analisis Sekarang":
      return { label: "Siap Dianalisis", className: information, icon: Info };
    case "Lihat Hasil Analisis":
      return { label: `${soalDapatDianalisis}/${totalSoal} Dianalisis`, className: success, icon: CircleCheck };
    case "Perbarui Hasil Analisis":
      return { label: "Perlu Diperbarui", className: warning, icon: AlertTriangle };
    case "Tidak Dapat Dianalisis":
      return { label: state, className: error, icon: Ban };
    default:
      return null;
  }
}

export function DetailTabBar({ active, onChange, anbusoState, totalSoal, soalDapatDianalisis }: DetailTabBarProps) {
  const tabs: DetailTab[] = ["Peserta", "Soal", "Analisis Butir Soal"];
  const chip = getAnbusoChip(anbusoState, totalSoal, soalDapatDianalisis);

  return (
    <div className="flex h-14 items-stretch gap-3 border-b border-tertiary-300 bg-white">
      {tabs.map((tab) => {
        const isActive = tab === active;
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
            {tab === "Analisis Butir Soal" &&
              (chip ? (
                <span
                  className={`flex h-6 items-center gap-1 whitespace-nowrap rounded-[26px] border px-2.5 text-sm font-semibold ${chip.className}`}
                >
                  <chip.icon size={14} className={chip.iconClassName} />
                  {chip.label}
                </span>
              ) : (
                anbusoState === "Tidak Ada Analisis" && (
                  <span className="flex h-5 items-center rounded-full bg-warning-50 px-2 text-xs font-semibold text-warning-500">
                    {anbusoState}
                  </span>
                )
              ))}
            {isActive && (
              <span className="absolute inset-x-0 bottom-0 h-1 rounded-t bg-primary-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
