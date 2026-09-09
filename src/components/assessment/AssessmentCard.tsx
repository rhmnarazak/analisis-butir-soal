import { SquarePen, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { Assessment } from "../../types/assessment";
import { AnbusoActionCell } from "./AnbusoActionCell";
import { MetodeBadge, needsRepublish, StatusBadge } from "./StatusBadge";

function Divider() {
  return <div className="h-px w-full bg-tertiary-300" />;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5">
      <span className="text-xs text-tertiary-600">{label}</span>
      <span className="text-sm font-semibold text-tertiary-900">{children}</span>
    </div>
  );
}

function FieldRow({ children }: { children: ReactNode }) {
  return <div className="flex items-start gap-6">{children}</div>;
}

export function AssessmentCard({ row, index }: { row: Assessment; index: number }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/asesmen/${row.id}`)}
      className="flex cursor-pointer flex-col gap-3 rounded-xl border border-tertiary-300 bg-white p-4 transition-colors hover:bg-[#F0F0F0]"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-tertiary-600">No. {index + 1}</span>
          <StatusBadge status={row.status} perluPublikasiUlang={row.perluPublikasiUlang} />
        </div>
        <h3 className="text-lg font-semibold text-tertiary-900">{row.namaUjian}</h3>
      </div>

      <Divider />

      <div className="flex flex-col gap-2">
        <FieldRow>
          <Field label="Waktu">
            <span className="whitespace-pre-line">{row.waktuUjian}</span>
          </Field>
          <Field label="Jenis">{row.jenis}</Field>
        </FieldRow>
        <FieldRow>
          <Field label="Mata Pelajaran">{row.mataPelajaran}</Field>
          <Field label="Tingkat">{row.tingkat}</Field>
        </FieldRow>
        <FieldRow>
          <Field label="Penilai">
            <span className="flex items-center gap-1">
              <UserRound size={14} className="shrink-0 text-tertiary-500" />
              <span className="flex-1 truncate">{row.penilai}</span>
              {row.status === "Perlu Dinilai" && (
                <button
                  type="button"
                  onClick={(event) => event.stopPropagation()}
                  className="shrink-0 text-primary-500"
                  aria-label={`Ubah penilai ${row.penilai}`}
                >
                  <SquarePen size={14} />
                </button>
              )}
            </span>
          </Field>
          <Field label="Metode">
            <MetodeBadge metode={row.metode} />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Peserta Dinilai">{row.pesertaDinilai}</Field>
          <Field label="Nilai Rata-Rata">{row.nilaiRataRata}</Field>
        </FieldRow>
      </div>

      <Divider />

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-tertiary-600">Analisis Butir Soal :</span>
        <AnbusoActionCell state={row.anbusoState} assessmentId={row.id} blocked={needsRepublish(row)} />
      </div>
    </div>
  );
}
