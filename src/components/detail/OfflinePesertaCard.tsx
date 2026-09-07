import { AlertTriangle, CircleCheck, ListFilter, Search, SquarePen, Upload } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useHorizontalWheelScroll } from "../../hooks/useHorizontalWheelScroll";
import { parsePesertaDinilai, statusFor } from "../../lib/participantStatus";
import type { Assessment, Participant } from "../../types/assessment";

function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-tertiary-300 bg-white px-1.5 py-0.5 text-xs font-semibold text-tertiary-700">
      {children}
    </span>
  );
}

// Matches the two ".alertPenilaian" variants from Figma: warning while
// grading is still pending, success once every participant is graded.
function GradingAlert({ variant }: { variant: "warning" | "success" }) {
  const isWarning = variant === "warning";
  const wrapClass = isWarning
    ? "border-warning-500 bg-warning-25"
    : "border-success-500 bg-success-25";
  const iconWrapClass = isWarning ? "bg-warning-500" : "bg-success-500";
  const textClass = isWarning ? "text-secondary-800" : "text-success-800";

  return (
    <div className={`flex items-start gap-3 rounded-lg border border-l-4 p-4 ${wrapClass}`}>
      <span className={`flex shrink-0 items-center justify-center rounded-full p-1 ${iconWrapClass}`}>
        {isWarning ? (
          <AlertTriangle size={14} className="text-white" />
        ) : (
          <CircleCheck size={14} className="text-white" />
        )}
      </span>
      <div className={`flex flex-col gap-1 text-sm ${textClass}`}>
        <p>
          {isWarning ? (
            <>
              Silakan masukkan <strong>nilai siswa</strong> untuk dapat mempublikasikan nilai
              asesmen siswa
            </>
          ) : (
            <>
              Semua siswa sudah dinilai. Nilai sudah siap untuk <strong>dipublikasikan</strong>.
            </>
          )}
        </p>
        <div className="h-px w-full bg-current opacity-20" />
        <p className="flex flex-wrap items-center gap-1.5 text-xs">
          <span>
            Cara isi/ubah nilai: <strong>Klik sel nilai</strong>, <strong>ketik angka</strong>, lalu
          </span>
          <Kbd>Enter</Kbd>
          <span>
            untuk <strong>pindah baris</strong>
          </span>
          <Kbd>Tab</Kbd>
          <span>
            <strong>pindah kolom</strong> atau <strong>klik di luar sel untuk menyimpan otomatis</strong>
          </span>
        </p>
      </div>
    </div>
  );
}

export function OfflinePesertaCard({
  assessment,
  participants,
  onRowClick,
}: {
  assessment: Assessment;
  participants: Participant[];
  // Set only while the assessment is still "Perlu Dinilai" — clicking any
  // row then opens the "skip grading, mark everyone Selesai" confirmation.
  onRowClick?: () => void;
}) {
  const isSelesai = assessment.status !== "Perlu Dinilai";
  const { dinilai, total } = parsePesertaDinilai(assessment.pesertaDinilai);
  const belumCount = Math.min(Math.max(0, total - dinilai), participants.length);

  const [showFilter, setShowFilter] = useState(false);
  const [nilai, setNilai] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    participants.forEach((p, index) => {
      initial[p.id] = index >= belumCount ? String(p.nilaiAsli) : "";
    });
    return initial;
  });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  useHorizontalWheelScroll(scrollRef);

  function handleNilaiKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === "Enter") {
      event.currentTarget.blur();
      inputRefs.current[index + 1]?.focus();
    }
  }

  return (
    <div className="flex flex-col gap-5 rounded-[22px] bg-white p-5 shadow-[0_4px_10px_rgba(51,51,51,0.04)]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-tertiary-900">Peserta</span>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-[280px] items-center gap-2 rounded-lg border border-tertiary-300 bg-white px-4">
              <Search size={16} className="text-tertiary-500" />
              <input
                type="text"
                placeholder="Cari siswa"
                className="w-full text-xs text-tertiary-900 placeholder:text-tertiary-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilter((prev) => !prev)}
              className={`flex h-9 items-center gap-1 rounded-lg border px-4 text-sm font-semibold transition-colors ${
                showFilter
                  ? "border-primary-400 bg-primary-100 text-primary-500"
                  : "border-tertiary-300 text-tertiary-700 hover:bg-tertiary-50"
              }`}
            >
              <ListFilter size={16} />
              Filter
            </button>
          </div>
        </div>

        {showFilter && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-9 min-w-[180px] items-center justify-between rounded-lg border border-tertiary-300 bg-white px-3 text-sm text-tertiary-500">
              Pilih kelas
            </div>
            <div className="flex h-9 min-w-[180px] items-center justify-between rounded-lg border border-tertiary-300 bg-white px-3 text-sm text-tertiary-500">
              Pilih status
            </div>
          </div>
        )}

        <div className="h-px w-full bg-tertiary-300" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-tertiary-600">
          Menampilkan {participants.length} data peserta ujian
        </span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-tertiary-600">
            ABN :{" "}
            {isSelesai ? (
              <span className="font-semibold text-tertiary-900">{assessment.kkm}</span>
            ) : (
              "Belum Diisi"
            )}
          </span>
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-primary-500 px-4 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50 active:bg-primary-100"
          >
            <SquarePen size={16} />
            {isSelesai ? "Ubah ABN" : "Masukkan ABN"}
          </button>
          <div className="h-6 w-px bg-tertiary-300" />
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-400"
          >
            <Upload size={16} />
            Unggah Nilai
          </button>
        </div>
      </div>

      <GradingAlert variant={isSelesai ? "success" : "warning"} />

      <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-tertiary-300">
        <table className="w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {["No", "Nama Siswa", "NISN", "Kelas", "Nilai", "Status"].map((header) => (
                <th
                  key={header}
                  className={`whitespace-nowrap border-b border-tertiary-300 bg-tertiary-50 px-4 py-4 text-sm font-bold text-tertiary-900 ${
                    header === "Nilai" ? "text-center" : ""
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {participants.map((p, index) => {
              const status = statusFor(index, belumCount);
              return (
                <tr
                  key={p.id}
                  className={`hover:bg-tertiary-100 ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={onRowClick}
                >
                  <td className="w-14 border-b border-tertiary-300 bg-white px-4 py-4 text-sm text-tertiary-900">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap border-b border-tertiary-300 bg-white px-4 py-4 text-sm text-tertiary-900">
                    {p.nama}
                  </td>
                  <td className="whitespace-nowrap border-b border-tertiary-300 bg-white px-4 py-4 text-sm text-tertiary-900">
                    {p.nomorPeserta}
                  </td>
                  <td className="whitespace-nowrap border-b border-tertiary-300 bg-white px-4 py-4 text-sm text-tertiary-900">
                    {p.kelas}
                  </td>
                  <td className="border-b border-tertiary-300 bg-white px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={nilai[p.id]}
                      onChange={(e) =>
                        setNilai((prev) => ({ ...prev, [p.id]: e.target.value.replace(/[^0-9]/g, "") }))
                      }
                      onKeyDown={(e) => handleNilaiKeyDown(e, index)}
                      className="h-9 w-[90px] rounded-lg border border-tertiary-300 bg-white px-3 text-center text-sm font-bold text-tertiary-800 focus:border-primary-500 focus:outline-none"
                    />
                  </td>
                  <td className="whitespace-nowrap border-b border-tertiary-300 bg-white px-4 py-4">
                    <span
                      className={`inline-flex items-center whitespace-nowrap rounded-[26px] border px-2.5 py-0.5 text-sm font-semibold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
