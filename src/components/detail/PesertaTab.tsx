import { AlertTriangle, Check, CircleCheck, Info, ListFilter, MoreVertical, Search, SquarePen } from "lucide-react";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useHorizontalWheelScroll } from "../../hooks/useHorizontalWheelScroll";
import { parsePesertaDinilai, statusFor } from "../../lib/participantStatus";
import { InfoTooltip } from "../common/InfoTooltip";
import type { AssessmentStatus, Participant, QuestionTypeKey } from "../../types/assessment";

function ProgressPill({ done, total }: { done: number; total: number }) {
  const complete = done === total;
  return (
    <span
      className={`whitespace-nowrap text-sm font-semibold ${complete ? "text-success-500" : "text-tertiary-700"}`}
    >
      {done}/{total} soal telah dinilai
    </span>
  );
}

// Custom checkbox matching Figma "LgnCheckbox" (node 5976-194912 / 5976-194980):
// 20x20 box, 5px radius, tertiary-300 border on white when unchecked, primary-500
// fill with primary-300 border and a white check glyph when checked.
function Checkbox({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
        checked ? "border-primary-300 bg-primary-500" : "border-tertiary-300 bg-white"
      }`}
    >
      {checked && <Check size={16} className="text-white" strokeWidth={3} />}
    </button>
  );
}

// Every question-type group (Pilihan Ganda, Esai, Menjodohkan, ...) shares
// the same four sub-columns, so both the header and the body are built from
// this one list instead of repeating it eight times.
const QUESTION_TYPE_GROUPS: { key: QuestionTypeKey; label: string }[] = [
  { key: "pilihanGanda", label: "Pilihan Ganda" },
  { key: "pilihanGandaKompleks", label: "Pilihan Ganda Kompleks" },
  { key: "esai", label: "Esai" },
  { key: "menjodohkan", label: "Menjodohkan" },
  { key: "mengurutkan", label: "Mengurutkan" },
  { key: "benarSalah", label: "Benar/Salah" },
  { key: "pilihanGandaEsai", label: "Pilihan Ganda Esai" },
  { key: "survei", label: "Survei" },
];
const SCORE_SUBS = [
  { key: "benar", label: "Benar" },
  { key: "salah", label: "Salah" },
  { key: "kosong", label: "Kosong" },
  { key: "skor", label: "Skor" },
] as const;
const SUB_WIDTH = 76;

// The first sub-column of each question-type group gets a left divider so
// the eight groups stay visually distinguishable from each other.
const GROUP_START_IDS = new Set(QUESTION_TYPE_GROUPS.map((g) => `${g.key}.benar`));
const GROUP_DIVIDER_CLASS = "border-l border-tertiary-300";

interface LeafColumn {
  id: string;
  width: number;
  sticky?: "left" | "right";
  render: (p: Participant, index: number) => ReactNode;
}

interface HeaderGroup {
  label: string;
  colSpan: number;
  sticky?: "left" | "right";
  subLabels?: string[];
}

// A single source of truth for both the two-row header and the flat body
// columns, so widths and order can never drift apart between them.
const headerGroups: HeaderGroup[] = [
  { label: "", colSpan: 1, sticky: "left" },
  { label: "No", colSpan: 1 },
  { label: "Nama Peserta", colSpan: 1 },
  { label: "Nomor Peserta", colSpan: 1 },
  { label: "Kelas", colSpan: 1 },
  { label: "Progres Penilaian", colSpan: 1 },
  ...QUESTION_TYPE_GROUPS.map((g) => ({
    label: g.label,
    colSpan: SCORE_SUBS.length,
    subLabels: SCORE_SUBS.map((s) => s.label),
  })),
  { label: "Nilai", colSpan: 2, subLabels: ["Asli", "Penyesuaian"] },
  { label: "Status", colSpan: 1, sticky: "right" },
  { label: "Aksi", colSpan: 1, sticky: "right" },
];

function buildLeafColumns(
  selected: Set<string>,
  toggleOne: (id: string) => void,
  belumCount: number,
): LeafColumn[] {
  return [
    {
      id: "select",
      width: 49,
      sticky: "left",
      render: (p) => (
        <span onClick={(event) => event.stopPropagation()}>
          <Checkbox checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} ariaLabel={`Pilih ${p.nama}`} />
        </span>
      ),
    },
    { id: "no", width: 56, render: (_p, index) => index + 1 },
    { id: "nama", width: 200, render: (p) => p.nama },
    { id: "nomor", width: 160, render: (p) => p.nomorPeserta },
    { id: "kelas", width: 96, render: (p) => p.kelas },
    {
      id: "progres",
      width: 220,
      // Kept consistent with the Status column: a "Selesai" row is always
      // fully graded, and a "Perlu Dinilai" row can never show a full
      // done/total count.
      render: (p, index) => {
        const done = index >= belumCount ? p.totalSoal : Math.min(p.soalDinilai, p.totalSoal - 1);
        return <ProgressPill done={done} total={p.totalSoal} />;
      },
    },
    ...QUESTION_TYPE_GROUPS.flatMap((group) =>
      SCORE_SUBS.map((sub) => ({
        id: `${group.key}.${sub.key}`,
        width: SUB_WIDTH,
        render: (p: Participant) => p[group.key][sub.key],
      })),
    ),
    { id: "nilai.asli", width: 90, render: (p) => p.nilaiAsli },
    { id: "nilai.penyesuaian", width: 110, render: (p) => (p.nilaiPenyesuaian >= 0 ? `+${p.nilaiPenyesuaian}` : p.nilaiPenyesuaian) },
    {
      id: "status",
      width: 150,
      sticky: "right",
      render: (_p, index) => {
        const status = statusFor(index, belumCount);
        return (
          <span
            className={`inline-flex items-center whitespace-nowrap rounded-[26px] border px-2.5 py-0.5 text-sm font-semibold ${status.className}`}
          >
            {status.label}
          </span>
        );
      },
    },
    {
      id: "aksi",
      width: 72,
      sticky: "right",
      render: (p) => (
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary-500 text-primary-500"
          aria-label={`Aksi ${p.nama}`}
        >
          <MoreVertical size={16} />
        </button>
      ),
    },
  ];
}

// Same directional-shadow technique used by every other sticky table in the
// app: offset only toward the scrollable content, never omnidirectional, so
// it can't bleed into a neighboring sticky cell or into adjacent rows.
const STICKY_LEFT_EDGE_SHADOW = "shadow-[3px_0px_5px_-3px_rgba(0,0,0,0.1)]";
const STICKY_RIGHT_EDGE_SHADOW = "shadow-[-3px_0px_5px_-3px_rgba(0,0,0,0.1)]";

export function PesertaTab({
  participants,
  kkm,
  pesertaDinilai,
  status,
  publikasiInfo,
  onRowClick,
}: {
  participants: Participant[];
  kkm: number;
  pesertaDinilai: string;
  status: AssessmentStatus;
  publikasiInfo: { tanggal: string; oleh: string };
  // Set only while the assessment is still "Perlu Dinilai" — clicking any
  // row then opens the "skip grading, mark everyone Selesai" confirmation.
  onRowClick?: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { dinilai, total } = parsePesertaDinilai(pesertaDinilai);
  const belumCount = Math.min(Math.max(0, total - dinilai), participants.length);
  const incompleteCount = belumCount;
  const scrollRef = useRef<HTMLDivElement>(null);
  useHorizontalWheelScroll(scrollRef);

  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === participants.length ? new Set() : new Set(participants.map((p) => p.id)),
    );
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const leafColumns = buildLeafColumns(selected, toggleOne, belumCount);

  const rightOffsets = new Map<string, number>();
  {
    let acc = 0;
    for (let i = leafColumns.length - 1; i >= 0; i -= 1) {
      const col = leafColumns[i];
      if (col.sticky === "right") {
        rightOffsets.set(col.id, acc);
        acc += col.width;
      }
    }
  }
  // The sticky-right group (Status, Aksi) is frozen together, so the divider
  // shadow belongs on the left edge of the group as a whole — i.e. on the
  // first sticky-right column in left-to-right order ("status"), not on
  // whichever one happened to be visited first while accumulating offsets.
  const firstRightId = leafColumns.find((c) => c.sticky === "right")?.id;
  const lastLeftId = leafColumns.filter((c) => c.sticky === "left").pop()?.id;

  function stickyStyle(col: LeafColumn): CSSProperties {
    if (col.sticky === "left") return { position: "sticky", left: 0, zIndex: 1 };
    if (col.sticky === "right") return { position: "sticky", right: rightOffsets.get(col.id), zIndex: 1 };
    return {};
  }
  function stickyEdgeClass(col: LeafColumn): string {
    if (col.sticky === "left" && col.id === lastLeftId) return STICKY_LEFT_EDGE_SHADOW;
    if (col.sticky === "right" && col.id === firstRightId) return STICKY_RIGHT_EDGE_SHADOW;
    return "";
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
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
          className="flex h-9 items-center gap-1 rounded-lg border border-primary-400 bg-primary-100 px-4 text-sm font-semibold text-primary-500"
        >
          <ListFilter size={16} />
          Filter
        </button>
      </div>

      <div className="h-px w-full bg-tertiary-300" />

      {incompleteCount > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-warning-500 border-l-4 bg-warning-25 p-4">
          <span className="flex shrink-0 items-center justify-center rounded-full bg-warning-500 p-1">
            <AlertTriangle size={14} className="text-white" />
          </span>
          <p className="text-sm text-tertiary-900">
            Terdapat {incompleteCount} siswa yang belum selesai dinilai. Silakan selesaikan dan
            publikasi penilaian.
          </p>
        </div>
      )}

      {status === "Siap Dipublikasi" && (
        <div className="flex items-start gap-3 rounded-lg border border-information-500 border-l-4 bg-information-25 p-4">
          <span className="flex shrink-0 items-center justify-center rounded-full bg-information-500 p-1">
            <Info size={14} className="text-white" />
          </span>
          <p className="text-sm text-tertiary-900">
            Semua peserta sudah dinilai. Nilai sudah siap untuk dipublikasikan.
          </p>
        </div>
      )}

      {status === "Selesai" && (
        <div className="flex items-start gap-3 rounded-lg border border-success-500 border-l-4 bg-success-25 p-4">
          <span className="flex shrink-0 items-center justify-center rounded-full bg-success-500 p-1">
            <CircleCheck size={14} className="text-white" />
          </span>
          <p className="text-sm text-tertiary-900">
            Nilai telah dipublikasikan. Perubahan nilai dapat dipublikasikan kembali kapan saja.
            <br />
            Publikasi terakhir: <strong>{publikasiInfo.tanggal}</strong> oleh <strong>{publikasiInfo.oleh}</strong>
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-tertiary-600">
          Menampilkan {participants.length} data peserta ujian
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-tertiary-600">ABN : {kkm}</span>
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-primary-500 px-4 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50 active:bg-primary-100"
          >
            <SquarePen size={16} />
            Edit ABN
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="overflow-x-auto rounded-xl border border-tertiary-300">
        <table className="border-separate border-spacing-0 text-left">
          <colgroup>
            {leafColumns.map((col) => (
              <col key={col.id} style={{ width: col.width, minWidth: col.width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              {headerGroups.map((group, i) => {
                const leaf = leafColumns[
                  headerGroups.slice(0, i).reduce((sum, g) => sum + g.colSpan, 0)
                ];
                const sticky = group.sticky;
                const style: CSSProperties = sticky
                  ? sticky === "left"
                    ? { position: "sticky", left: 0, zIndex: 2 }
                    : { position: "sticky", right: rightOffsets.get(leaf.id), zIndex: 2 }
                  : {};
                const edgeClass = sticky
                  ? sticky === "left"
                    ? STICKY_LEFT_EDGE_SHADOW
                    : leaf.id === firstRightId
                      ? STICKY_RIGHT_EDGE_SHADOW
                      : ""
                  : "";
                const isQuestionGroup = QUESTION_TYPE_GROUPS.some((g) => g.label === group.label);
                const dividerClass = isQuestionGroup ? GROUP_DIVIDER_CLASS : "";
                return (
                  <th
                    key={i}
                    rowSpan={group.subLabels ? 1 : 2}
                    colSpan={group.colSpan}
                    style={style}
                    className={`whitespace-nowrap border-b border-tertiary-300 bg-tertiary-50 px-4 py-4 text-sm font-bold text-tertiary-900 ${edgeClass} ${dividerClass}`}
                  >
                    {i === 0 ? (
                      <Checkbox
                        checked={selected.size === participants.length && participants.length > 0}
                        onChange={toggleAll}
                        ariaLabel="Pilih semua peserta"
                      />
                    ) : group.label === "Nilai" ? (
                      <span className="inline-flex items-center gap-1.5">
                        {group.label}
                        <InfoTooltip text="Nilai Asli berlaku sebagai bawaan kecuali telah disesuaikan." size={14} />
                      </span>
                    ) : (
                      group.label
                    )}
                  </th>
                );
              })}
            </tr>
            <tr>
              {headerGroups.flatMap((group, i) => {
                if (!group.subLabels) return [];
                const startIndex = headerGroups.slice(0, i).reduce((sum, g) => sum + g.colSpan, 0);
                return group.subLabels.map((label, j) => {
                  const leaf = leafColumns[startIndex + j];
                  const dividerClass = GROUP_START_IDS.has(leaf.id) ? GROUP_DIVIDER_CLASS : "";
                  return (
                    <th
                      key={leaf.id}
                      className={`whitespace-nowrap border-b border-tertiary-300 bg-tertiary-50 px-4 py-3 text-xs font-bold text-tertiary-700 ${dividerClass}`}
                    >
                      {label === "Penyesuaian" ? (
                        <span className="inline-flex items-center gap-1.5">
                          {label}
                          <InfoTooltip text="Nilai Penyesuaian merupakan hasil dari ubah Nilai Asli." size={14} />
                        </span>
                      ) : (
                        label
                      )}
                    </th>
                  );
                });
              })}
            </tr>
          </thead>
          <tbody>
            {participants.map((p, index) => (
              <tr
                key={p.id}
                className={`group ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={onRowClick}
              >
                {leafColumns.map((col) => (
                  <td
                    key={col.id}
                    style={stickyStyle(col)}
                    className={`whitespace-nowrap border-b border-tertiary-300 bg-white px-4 py-4 align-middle text-sm text-tertiary-900 transition-colors group-hover:bg-tertiary-100 ${stickyEdgeClass(col)} ${GROUP_START_IDS.has(col.id) ? GROUP_DIVIDER_CLASS : ""}`}
                  >
                    {col.render(p, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
