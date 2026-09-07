import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { assetUrl } from "../../lib/assetUrl";
import { useAssessmentStore } from "../../state/AssessmentStore";
import {
  AsesmenIcon,
  BerandaIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DashboardIcon,
  DataMasterIcon,
  KehadiranIcon,
  TugasIcon,
} from "./sidebarIcons";

const HOVER_PILL =
  "hover:bg-primary-400/80 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-2px_1px_rgba(0,0,0,0.18)]";
const ACTIVE_PILL =
  "bg-primary-400/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-2px_1px_rgba(0,0,0,0.18)]";

interface SubMenuItem {
  label: string;
  to?: string;
}

const assessmentSubMenu: SubMenuItem[] = [
  { label: "Soal" },
  { label: "Jadwal" },
  { label: "Monitoring" },
  { label: "Nilai", to: "/" },
];

export function Sidebar() {
  const [assessmentOpen, setAssessmentOpen] = useState(true);
  const location = useLocation();
  const { resetToCheckpoint } = useAssessmentStore();
  const isNilaiActive = location.pathname === "/" || location.pathname.startsWith("/asesmen/");

  return (
    <aside className="relative flex h-screen w-[253px] shrink-0 flex-col items-stretch gap-2 overflow-hidden border-r border-tertiary-200 bg-primary-500 pt-2">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-5 -top-12 h-[129px] w-[100px] rounded-[73px] bg-primary-300 opacity-30 blur-[10px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[133px] top-[1007px] h-[307px] w-[287px] rounded-[22px] opacity-60 blur-[7px]"
        style={{
          background: "linear-gradient(240deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 100%)",
        }}
      />

      <div className="flex h-[60px] shrink-0 items-center justify-center">
        <img
          src={assetUrl("/images/pijar-sekolah-logo.svg")}
          alt="Pijar Sekolah"
          className="h-[87px] w-[87px] rounded-[20px]"
        />
      </div>

      <nav className="flex flex-1 flex-col items-stretch gap-2 overflow-y-auto px-3">
        <button
          type="button"
          className={`group flex items-center gap-2 rounded-xl px-3 py-3 text-left transition-colors ${HOVER_PILL}`}
        >
          <BerandaIcon className="h-5 w-5 shrink-0 text-white transition-colors group-hover:text-[#FFC773]" />
          <span className="flex-1 text-sm font-semibold text-white">Beranda</span>
        </button>

        <button
          type="button"
          className={`group flex items-center gap-2 rounded-xl px-3 py-3 text-left transition-colors ${HOVER_PILL}`}
        >
          <DashboardIcon className="h-5 w-5 shrink-0 text-white transition-colors group-hover:text-[#FFC773]" />
          <span className="flex-1 text-sm font-semibold text-white">Dashboard</span>
        </button>

        <div className="flex h-8 items-center px-3">
          <span className="text-sm text-white/70">Menu Utama</span>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setAssessmentOpen((v) => !v)}
            className={`group flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left transition-colors ${
              assessmentOpen ? ACTIVE_PILL : HOVER_PILL
            }`}
          >
            <AsesmenIcon
              className={`h-5 w-5 shrink-0 transition-colors ${
                assessmentOpen ? "text-[#FFC773]" : "text-white group-hover:text-[#FFC773]"
              }`}
            />
            <span className="flex-1 text-sm font-semibold text-white">Asesmen</span>
            <ChevronDownIcon
              className={`h-4 w-4 text-white transition-transform ${assessmentOpen ? "rotate-180" : ""}`}
            />
          </button>

          {assessmentOpen && (
            <div className="mt-1 flex flex-col items-stretch">
              {assessmentSubMenu.map((item) => {
                const active = item.label === "Nilai" && isNilaiActive;
                const className = `rounded-xl py-3 pl-[52px] pr-3 text-left text-sm transition-colors ${
                  active
                    ? `font-semibold text-white ${ACTIVE_PILL}`
                    : `text-white/80 hover:text-white ${HOVER_PILL}`
                }`;

                if (item.to) {
                  return (
                    <Link key={item.label} to={item.to} className={className}>
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <button key={item.label} type="button" className={className}>
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          className={`group flex items-center gap-2 rounded-xl px-3 py-3 text-left transition-colors ${HOVER_PILL}`}
        >
          <KehadiranIcon className="h-5 w-5 shrink-0 text-white transition-colors group-hover:text-[#FFC773]" />
          <span className="flex-1 text-sm font-semibold text-white">Kehadiran</span>
          <ChevronDownIcon className="h-4 w-4 text-white/70" />
        </button>

        <button
          type="button"
          className={`group flex items-center gap-2 rounded-xl px-3 py-3 text-left transition-colors ${HOVER_PILL}`}
        >
          <TugasIcon className="h-5 w-5 shrink-0 text-white transition-colors group-hover:text-[#FFC773]" />
          <span className="flex-1 text-sm font-semibold text-white">Tugas</span>
          <ChevronDownIcon className="h-4 w-4 text-white/70" />
        </button>

        <button
          type="button"
          className={`group flex items-center gap-2 rounded-xl px-3 py-3 text-left transition-colors ${HOVER_PILL}`}
        >
          <DataMasterIcon className="h-5 w-5 shrink-0 text-white transition-colors group-hover:text-[#FFC773]" />
          <span className="flex-1 text-sm font-semibold text-white">Data Master</span>
          <ChevronUpIcon className="h-4 w-4 text-white/70" />
        </button>

        <div className="mt-2 flex h-8 items-center gap-2 px-3">
          <span className="flex-1 text-sm text-white/70">Menu Lainnya</span>
          <ChevronDownIcon className="h-4 w-4 text-white/70" />
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={resetToCheckpoint}
          className={`group flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left transition-colors ${HOVER_PILL}`}
        >
          <RotateCcw className="h-5 w-5 shrink-0 text-white transition-colors group-hover:text-[#FFC773]" />
          <span className="flex-1 text-sm font-semibold text-white">Reset Status ke Awal</span>
        </button>
      </div>
    </aside>
  );
}
