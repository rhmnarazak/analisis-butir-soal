import { ChevronDown, type LucideIcon } from "lucide-react";

interface FilterFieldProps {
  label?: string;
  placeholder: string;
  value?: string;
  icon?: LucideIcon;
  width?: number;
}

export function FilterField({ label, placeholder, value, icon: Icon, width }: FilterFieldProps) {
  return (
    <div className="flex flex-col items-stretch gap-2" style={width ? { width } : { flex: 1 }}>
      {label && <span className="text-sm font-semibold text-tertiary-900">{label}</span>}
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-lg border border-tertiary-300 bg-white px-4"
      >
        {Icon && <Icon size={16} className="shrink-0 text-tertiary-500" />}
        <span
          className={`flex-1 truncate text-left text-xs ${value ? "text-tertiary-900" : "text-tertiary-500"}`}
        >
          {value ?? placeholder}
        </span>
        <ChevronDown size={16} className="shrink-0 text-tertiary-500" />
      </button>
    </div>
  );
}
