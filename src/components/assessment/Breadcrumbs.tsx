import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-2">
            {index > 0 && <ChevronRight size={14} className="text-tertiary-500" />}
            {item.to && !isLast ? (
              <Link to={item.to} className="text-tertiary-600 hover:text-tertiary-900">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-tertiary-900" : "text-tertiary-600"}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
