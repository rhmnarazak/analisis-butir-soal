import { Eye, SquarePen, UserRound } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useNavigate, type NavigateFunction } from "react-router-dom";
import { useHorizontalWheelScroll } from "../../hooks/useHorizontalWheelScroll";
import type { Assessment } from "../../types/assessment";
import { AksiMenu } from "./AksiMenu";
import { AnbusoActionCell } from "./AnbusoActionCell";
import { MetodeBadge, StatusBadge } from "./StatusBadge";

interface Column {
  header: string;
  width: number;
  sticky?: "left" | "right";
  render: (row: Assessment, index: number) => ReactNode;
}

interface ScrollEdges {
  atLeft: boolean;
  atRight: boolean;
}

// The Aksi column is narrow (fit to the icon button) while sticky, and wider
// once it settles into its non-sticky "Lihat Detail" button at the right
// edge. The scroll-edge detection below is deliberately based on a fixed
// reference width rather than the live (and therefore varying) scrollWidth,
// so switching between these two widths can never feed back into the
// calculation that triggers the switch — that feedback loop is what caused
// the earlier flicker/oscillation.
const AKSI_WIDTH_COMPACT = 68;
const AKSI_WIDTH_EXPANDED = 152;

// Same shadow "feel" (blur/spread/opacity) on both sticky edges, but each
// offset toward the scrollable content only — not omnidirectional. An
// omnidirectional shadow on, say, the "Judul Asesmen" cell would also bleed
// left into the adjacent sticky "No" cell (and vertically into neighboring
// rows), since both sit in the same stacking order. A horizontal-only
// offset can't bleed into a neighboring cell it isn't offset toward.
const STICKY_LEFT_EDGE_SHADOW = "shadow-[3px_0px_5px_-3px_rgba(0,0,0,0.1)]";
const STICKY_RIGHT_EDGE_SHADOW = "shadow-[-3px_0px_5px_-3px_rgba(0,0,0,0.1)]";

function buildColumns({
  atLeft,
  atRight,
  navigate,
}: ScrollEdges & { navigate: NavigateFunction }): Column[] {
  const edgeSticky: "left" | undefined = atLeft ? undefined : "left";

  return [
    { header: "No", width: 56, sticky: edgeSticky, render: (_row, index) => index + 1 },
    { header: "Judul Asesmen", width: 220, sticky: edgeSticky, render: (row) => row.namaUjian },
    {
      header: "Waktu",
      width: 172,
      render: (row) => <span className="whitespace-pre-line">{row.waktuUjian}</span>,
    },
    { header: "Jenis", width: 90, render: (row) => row.jenis },
    { header: "Mata Pelajaran", width: 153, render: (row) => row.mataPelajaran },
    { header: "Tingkat", width: 96, render: (row) => row.tingkat },
    {
      header: "Penilai",
      width: 170,
      render: (row) => (
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
      ),
    },
    { header: "Peserta Dinilai", width: 142, render: (row) => row.pesertaDinilai },
    { header: "Nilai Rata-Rata", width: 150, render: (row) => row.nilaiRataRata },
    { header: "Metode", width: 110, render: (row) => <MetodeBadge metode={row.metode} /> },
    {
      header: "Status",
      width: 172,
      render: (row) => (
        <StatusBadge status={row.status} perluPublikasiUlang={row.perluPublikasiUlang} />
      ),
    },
    {
      header: "Analisis Butir Soal",
      width: 212,
      render: (row) => <AnbusoActionCell state={row.anbusoState} assessmentId={row.id} />,
    },
    {
      header: "Aksi",
      width: atRight ? AKSI_WIDTH_EXPANDED : AKSI_WIDTH_COMPACT,
      sticky: atRight ? undefined : "right",
      render: (row) =>
        atRight ? (
          <button
            type="button"
            onClick={() => navigate(`/asesmen/${row.id}`)}
            className="animate-fade-in flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border border-primary-500 px-3 text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50 active:bg-primary-100"
          >
            <Eye size={16} />
            Lihat Detail
          </button>
        ) : (
          <AksiMenu row={row} />
        ),
    },
  ];
}

// A stable reference for total table width, always using the compact Aksi
// width — see the note above AKSI_WIDTH_COMPACT for why this must not track
// whichever width is actually rendered.
const REFERENCE_TOTAL_WIDTH = buildColumns({
  atLeft: false,
  atRight: false,
  navigate: () => {},
}).reduce((sum, col) => sum + col.width, 0);

function stickyOffsets(columns: Column[]) {
  const left = new Map<string, number>();
  let leftAcc = 0;
  for (const col of columns) {
    if (col.sticky === "left") {
      left.set(col.header, leftAcc);
      leftAcc += col.width;
    }
  }

  const right = new Map<string, number>();
  let rightAcc = 0;
  for (let i = columns.length - 1; i >= 0; i -= 1) {
    const col = columns[i];
    if (col.sticky === "right") {
      right.set(col.header, rightAcc);
      rightAcc += col.width;
    }
  }

  return { left, right, lastLeft: [...left.keys()].pop(), firstRight: [...right.keys()][0] };
}

export function AssessmentTable({ rows }: { rows: Assessment[] }) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  useHorizontalWheelScroll(scrollRef);
  const edgesRef = useRef<ScrollEdges>({ atLeft: false, atRight: true });
  const rafRef = useRef<number | null>(null);
  const [edges, setEdges] = useState<ScrollEdges>(edgesRef.current);

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = REFERENCE_TOTAL_WIDTH - el.clientWidth;
    const next = {
      atLeft: el.scrollLeft <= 1,
      atRight: el.scrollLeft >= max - 1,
    };
    const prev = edgesRef.current;
    if (prev.atLeft !== next.atLeft || prev.atRight !== next.atRight) {
      edgesRef.current = next;
      setEdges(next);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      updateEdges();
    });
  }, [updateEdges]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth;
    updateEdges();
  }, [rows, updateEdges]);

  const columns = useMemo(() => buildColumns({ ...edges, navigate }), [edges, navigate]);
  const { left: leftOffsets, right: rightOffsets, lastLeft, firstRight } = useMemo(
    () => stickyOffsets(columns),
    [columns],
  );

  function stickyStyle(col: Column): CSSProperties {
    if (col.sticky === "left") {
      return { position: "sticky", left: leftOffsets.get(col.header), zIndex: 1 };
    }
    if (col.sticky === "right") {
      return { position: "sticky", right: rightOffsets.get(col.header), zIndex: 1 };
    }
    return {};
  }

  function stickyEdgeClass(col: Column): string {
    if (col.sticky === "left" && col.header === lastLeft) {
      return STICKY_LEFT_EDGE_SHADOW;
    }
    if (col.sticky === "right" && col.header === firstRight) {
      return STICKY_RIGHT_EDGE_SHADOW;
    }
    return "";
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="overflow-x-auto rounded-xl border border-tertiary-300"
    >
      <table className="w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                style={{ width: col.width, minWidth: col.width, ...stickyStyle(col) }}
                className={`whitespace-nowrap border-b border-tertiary-300 bg-tertiary-50 px-4 py-4 text-sm font-bold text-tertiary-900 ${stickyEdgeClass(col)}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id}
              className="group cursor-pointer"
              onClick={() => navigate(`/asesmen/${row.id}`)}
            >
              {columns.map((col) => (
                <td
                  key={col.header}
                  style={{ width: col.width, minWidth: col.width, ...stickyStyle(col) }}
                  className={`border-b border-tertiary-300 bg-white px-4 py-4 align-middle text-sm text-tertiary-900 transition-colors group-hover:bg-[#F0F0F0] ${stickyEdgeClass(col)}`}
                >
                  {col.render(row, index)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
