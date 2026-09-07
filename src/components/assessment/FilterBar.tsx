import { Calendar, FlaskConical, GraduationCap, ListFilter, NotebookPen, Search, Waypoints } from "lucide-react";
import { useState } from "react";
import { FilterField } from "./FilterField";

export function FilterBar() {
  const [showFilters, setShowFilters] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-9 w-[280px] items-center gap-2 rounded-lg border border-tertiary-300 bg-white px-4">
          <Search size={16} className="text-tertiary-500" />
          <input
            type="text"
            placeholder="Cari nama asesmen"
            className="w-full text-xs text-tertiary-900 placeholder:text-tertiary-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-[15px]">
          <FilterField placeholder="Urutkan : Terbaru" value="Urutkan : Terbaru" width={200} />
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className="flex h-9 items-center gap-1 rounded-lg border border-primary-400 bg-primary-100 px-4 text-sm font-semibold text-primary-500"
          >
            <ListFilter size={16} />
            Filter
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-end gap-5">
          <FilterField label="Tanggal" placeholder="dd/mm/yyyy - dd/mm/yyyy" value="09/10/2024 - 21/10/2024" icon={Calendar} />
          <FilterField label="Mata Pelajaran" placeholder="Pilih mata pelajaran" icon={FlaskConical} />
          <FilterField label="Jenis Asesmen" placeholder="Pilih jenis asesmen" icon={NotebookPen} />
          <FilterField label="Metode" placeholder="Pilih metode" icon={Waypoints} />
          <FilterField label="Tingkat" placeholder="Pilih tingkat kelas" icon={GraduationCap} />
        </div>
      )}

      <div className="h-px w-full bg-tertiary-300" />
    </div>
  );
}
