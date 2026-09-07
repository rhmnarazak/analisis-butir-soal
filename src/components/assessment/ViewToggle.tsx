import { LayoutGrid, Table2 } from "lucide-react";

export type ViewMode = "table" | "card";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

const options: { value: ViewMode; label: string; icon: typeof Table2 }[] = [
  { value: "table", label: "Tabel", icon: Table2 },
  { value: "card", label: "Kartu", icon: LayoutGrid },
];

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-tertiary-300 bg-white p-1">
      {options.map(({ value, label, icon: Icon }) => {
        const active = value === view;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(value)}
            aria-pressed={active}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
              active
                ? "bg-primary-100 text-primary-500"
                : "text-tertiary-600 hover:bg-tertiary-50"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
