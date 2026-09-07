import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
}

export function Pagination({ total, page, pageSize }: PaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-1 rounded-full border border-tertiary-200 bg-white py-2 pl-[18px] pr-2.5 text-sm font-semibold text-tertiary-900"
        >
          {pageSize} Data
          <ChevronDown size={16} />
        </button>
        <span className="text-sm text-tertiary-700">dari total {total} data</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center gap-1 rounded-full text-tertiary-500 disabled:opacity-40"
          disabled={page <= 1}
        >
          <ChevronLeft size={20} />
        </button>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
          {page}
        </span>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center gap-1 rounded-full text-tertiary-500 disabled:opacity-40"
          disabled={page * pageSize >= total}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
