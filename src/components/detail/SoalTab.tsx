import { useRef } from "react";
import { useHorizontalWheelScroll } from "../../hooks/useHorizontalWheelScroll";
import type { QuestionAnalysis, QuestionTypeKey } from "../../types/assessment";

// "Jenis Soal" pill styles per Figma node 5978-194996.
export const JENIS_STYLES: Record<QuestionTypeKey, { label: string; className: string }> = {
  pilihanGanda: { label: "Pilihan Ganda", className: "bg-primary-50 border-primary-200 text-primary-600" },
  pilihanGandaKompleks: {
    label: "PG Kompleks",
    className: "bg-secondary-50 border-secondary-200 text-secondary-600",
  },
  esai: { label: "Esai", className: "bg-success-50 border-success-200 text-success-500" },
  menjodohkan: {
    label: "Menjodohkan",
    className: "bg-information-50 border-information-200 text-information-500",
  },
  mengurutkan: { label: "Mengurutkan", className: "bg-secondary-50 border-secondary-200 text-warning-500" },
  benarSalah: { label: "Benar/Salah", className: "bg-error-50 border-error-200 text-error-500" },
  pilihanGandaEsai: { label: "PG Esai", className: "bg-tertiary-50 border-tertiary-200 text-tertiary-600" },
  survei: { label: "Survei", className: "bg-purple-50 border-purple-200 text-purple-600" },
};

export function JenisPill({ jenis }: { jenis: QuestionTypeKey }) {
  const style = JENIS_STYLES[jenis];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-[26px] border px-2.5 py-0.5 text-sm font-semibold ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export function SoalTab({ questions }: { questions: QuestionAnalysis[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useHorizontalWheelScroll(scrollRef);

  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm text-tertiary-600">Menampilkan {questions.length} soal</span>

      <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-tertiary-300">
        <table className="w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              {["No", "Cuplikan Soal", "Jenis"].map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap border-b border-tertiary-300 bg-tertiary-50 px-4 py-4 text-sm font-bold text-tertiary-900"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.no} className="hover:bg-tertiary-100">
                <td className="w-14 border-b border-tertiary-300 bg-white px-4 py-4 text-sm text-tertiary-900">
                  {q.no}
                </td>
                <td className="border-b border-tertiary-300 bg-white px-4 py-4 text-sm text-tertiary-900">
                  {q.cuplikanSoal}
                </td>
                <td className="w-40 border-b border-tertiary-300 bg-white px-4 py-4">
                  <JenisPill jenis={q.jenis} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
