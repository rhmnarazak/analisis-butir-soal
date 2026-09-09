import { AlertOctagon, CircleCheck, CircleX, Sparkles, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { ChartCard, formatPercent, LegendRow, Pill, ThresholdBar } from "./ChartCardKit";
import { assetUrl } from "../../lib/assetUrl";
import {
  getAnalisisTier,
  getKualitasTone,
  getReliabilitasTone,
  MIN_PESERTA_ANALYSIS,
  type AnalisisStats,
  type KualitasTone,
  type ReliabilitasLabel,
} from "../../lib/itemAnalysisStats";
import { parsePesertaDinilai } from "../../lib/participantStatus";
import type { Assessment } from "../../types/assessment";

function StatusItem({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-tertiary-900">
      <CircleCheck size={20} className={`shrink-0 ${ok ? "text-success-500" : "text-error-500"}`} />
      {children}
    </div>
  );
}

// Card 4 — "Informasi Analisis" per Figma node 5980-199357: analysis-freshness
// banner plus the same 4 pass/fail indicators used to gate the tab itself.
function InfoAnalisisCard({
  assessment,
  stats,
  jumlahPeserta,
}: {
  assessment: Assessment;
  stats: AnalisisStats;
  jumlahPeserta: number;
}) {
  const { dinilai, total } = parsePesertaDinilai(assessment.pesertaDinilai);
  const semuaDinilai = total > 0 && dinilai >= total;
  const sudahDipublikasi = assessment.status === "Selesai";
  const pesertaCukup = jumlahPeserta >= MIN_PESERTA_ANALYSIS;
  const tier = getAnalisisTier(jumlahPeserta);

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-success-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex shrink-0 items-center justify-center rounded bg-success-25 p-2 text-success-500">
            <Sparkles size={24} />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-semibold text-tertiary-900">{tier.title}</span>
            <span className="text-base text-tertiary-900">{tier.description}</span>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-success-200" />

      <div className="flex flex-wrap items-center gap-6">
        <StatusItem ok={pesertaCukup}>
          Jumlah Peserta <strong className="font-bold">{jumlahPeserta}</strong>
        </StatusItem>
        <StatusItem ok={stats.totalAnalyzable > 0}>
          Jumlah Soal Dapat Dianalisis <strong className="font-bold">{stats.totalAnalyzable}</strong>
        </StatusItem>
        <StatusItem ok={semuaDinilai}>
          Seluruh Peserta{" "}
          <strong className="font-bold">{semuaDinilai ? "Selesai Dinilai" : "Belum Selesai Dinilai"}</strong>
        </StatusItem>
        <StatusItem ok={sudahDipublikasi}>
          Nilai <strong className="font-bold">{sudahDipublikasi ? "Sudah Dipublikasi" : "Belum Dipublikasi"}</strong>
        </StatusItem>
      </div>
    </div>
  );
}

// Per-tone visual spec for the ".ringkasanKualitasPaketSoal" Figma component
// set (node 5852:82877) — card border, header icon box, label color, the
// "Skor X%" pill, and the callout below all key off the same tone. Sangat
// Baik and Baik both read as success; only Sedang is warning; Buruk and
// Sangat Buruk are error.
const KUALITAS_TONE_STYLES: Record<
  KualitasTone,
  {
    cardBorder: string;
    iconBg: string;
    iconColor: string;
    labelColor: string;
    pill: string;
    // The small ".statusNew" label chip (chart-card badges) uses a
    // different, plainer icon set than the big alert callout below.
    chipIcon: typeof CircleCheck;
    alertBorder: string;
    alertBg: string;
    alertIconBg: string;
    alertIcon: typeof CircleCheck;
    buttonBg: string;
    coloredClause: "ditinjau" | "diperbaiki" | null;
  }
> = {
  success: {
    cardBorder: "border-success-200",
    iconBg: "bg-success-25",
    iconColor: "text-success-500",
    labelColor: "text-success-500",
    pill: "bg-success-50 border-success-200 text-success-500",
    chipIcon: CircleCheck,
    alertBorder: "border-success-500",
    alertBg: "bg-success-25",
    alertIconBg: "bg-success-500",
    alertIcon: CircleCheck,
    buttonBg: "bg-success-500",
    coloredClause: null,
  },
  warning: {
    cardBorder: "border-warning-200",
    iconBg: "bg-warning-25",
    iconColor: "text-warning-500",
    labelColor: "text-warning-500",
    pill: "bg-secondary-50 border-secondary-200 text-warning-500",
    chipIcon: TriangleAlert,
    alertBorder: "border-warning-500",
    alertBg: "bg-warning-25",
    alertIconBg: "bg-warning-500",
    alertIcon: TriangleAlert,
    buttonBg: "bg-warning-500",
    coloredClause: "ditinjau",
  },
  error: {
    cardBorder: "border-error-200",
    iconBg: "bg-error-25",
    iconColor: "text-error-500",
    labelColor: "text-error-500",
    pill: "bg-error-50 border-error-200 text-error-500",
    chipIcon: AlertOctagon,
    alertBorder: "border-error-500",
    alertBg: "bg-error-25",
    alertIconBg: "bg-error-500",
    alertIcon: CircleX,
    buttonBg: "bg-error-500",
    coloredClause: "diperbaiki",
  },
};

// Joins 1-3 clause nodes the Indonesian way: "A." / "A dan B." / "A, B, dan C."
function joinClauses(clauses: ReactNode[]): ReactNode {
  if (clauses.length === 0) return null;
  if (clauses.length === 1) return clauses[0];
  if (clauses.length === 2)
    return (
      <>
        {clauses[0]} dan {clauses[1]}
      </>
    );
  return (
    <>
      {clauses[0]}, {clauses[1]}, dan {clauses[2]}
    </>
  );
}

// Card 5 — "Rekomendasi" per Figma node 5980-199387 (structure) / component
// set 5852:82877 (the 7 Kualitas variants: 100%, Sangat Baik, Baik, Sedang,
// Buruk, SangatBuruk, 0%). The 100%/0% extremes aren't special-cased — they
// fall out naturally: 100% has 0 soal needing attention (no callout renders),
// and 0% has 0 soal layak (the "layak digunakan kembali" clause is dropped).
function RekomendasiCard({ stats }: { stats: AnalisisStats }) {
  const perluPerhatian = stats.diperbaiki + stats.ditinjau;
  const tone = KUALITAS_TONE_STYLES[getKualitasTone(stats.kualitasLabel)];
  const AlertIcon = tone.alertIcon;

  const soalClauses: ReactNode[] = [];
  if (stats.layak > 0) {
    soalClauses.push(
      <>
        <strong>{stats.layak} soal layak digunakan kembali</strong> tanpa revisi
      </>,
    );
  }
  if (stats.ditinjau > 0) {
    soalClauses.push(<strong key="ditinjau">{stats.ditinjau} soal perlu ditinjau</strong>);
  }
  if (stats.diperbaiki > 0) {
    soalClauses.push(
      <>
        <strong>{stats.diperbaiki} soal</strong> perlu diperbaiki
      </>,
    );
  }

  return (
    <div className={`flex flex-col gap-5 rounded-lg border bg-white p-5 ${tone.cardBorder}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className={`flex shrink-0 items-center justify-center rounded p-2 ${tone.iconBg} ${tone.iconColor}`}>
            <Sparkles size={24} />
          </span>
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-tertiary-900">
                Kualitas Paket Soal: <span className={tone.labelColor}>{stats.kualitasLabel}</span>
              </span>
              <Pill label={`Skor ${formatPercent(stats.skorKualitas)}`} className={tone.pill} />
            </div>
            <span className="text-xs text-tertiary-600">Dibuat otomatis berdasarkan hasil analisis soal ini</span>
          </div>
        </div>
        <p className="text-sm text-tertiary-900">
          Dari <strong>{stats.totalSoal} soal</strong>, <strong>{stats.totalAnalyzable} soal telah dianalisis</strong>.
          {soalClauses.length > 0 && <> Sebanyak {joinClauses(soalClauses)}.</>} Reliabilitas tes{" "}
          <strong>
            {stats.reliabilitasLabel.toLowerCase()} ({stats.reliabilitas.toFixed(2).replace(".", ",")})
          </strong>
          .
        </p>
      </div>

      {perluPerhatian > 0 && (
        <div
          className={`flex flex-wrap items-center justify-between gap-4 rounded-lg border border-l-4 p-4 ${tone.alertBorder} ${tone.alertBg}`}
        >
          <div className="flex items-start gap-3">
            <span className={`flex shrink-0 items-center justify-center rounded-full p-1 ${tone.alertIconBg}`}>
              <AlertIcon size={14} className="text-white" />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-base font-semibold text-tertiary-900">
                {perluPerhatian} dari {stats.totalAnalyzable} Soal Perlu Perhatian
              </span>
              <p className="text-sm text-tertiary-700">
                {stats.ditinjau > 0 && (
                  <strong className={tone.coloredClause === "ditinjau" ? tone.labelColor : undefined}>
                    {stats.ditinjau} Soal Perlu Ditinjau
                  </strong>
                )}
                {stats.ditinjau > 0 && stats.diperbaiki > 0 && " dan "}
                {stats.diperbaiki > 0 && (
                  <strong className={tone.coloredClause === "diperbaiki" ? tone.labelColor : undefined}>
                    {stats.diperbaiki} Soal Perlu Diperbaiki
                  </strong>
                )}{" "}
                dari {stats.totalAnalyzable}/{stats.totalSoal} soal yang dianalisis.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={`flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-5 text-sm font-semibold text-white ${tone.buttonBg}`}
          >
            Tinjau {perluPerhatian} Soal Yang Perlu Perhatian
            <img src={assetUrl("/images/icons/circle-arrow-right-filled.svg")} alt="" className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

// Inlined (not <img>) so its stroke can follow the card's status tone via
// currentColor — the source asset at public/images/icons/message-2-star.svg
// is a flat green file and an <img> can't be recolored from CSS.
function KualitasPaketSoalIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M8 9H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M10 19L9 18H6C5.20435 18 4.44129 17.6839 3.87868 17.1213C3.31607 16.5587 3 15.7956 3 15V7C3 6.20435 3.31607 5.44129 3.87868 4.87868C4.44129 4.31607 5.20435 4 6 4H18C18.7956 4 19.5587 4.31607 20.1213 4.87868C20.6839 5.44129 21 6.20435 21 7V11.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.8002 20.817L15.6282 21.955C15.5638 21.9885 15.4913 22.0035 15.4188 21.9982C15.3463 21.9929 15.2767 21.9676 15.2178 21.9251C15.1589 21.8826 15.113 21.8245 15.0851 21.7574C15.0573 21.6903 15.0487 21.6167 15.0602 21.545L15.4752 19.134L13.7182 17.427C13.6658 17.3763 13.6287 17.3119 13.6111 17.2411C13.5935 17.1703 13.5962 17.096 13.6188 17.0266C13.6414 16.9573 13.6831 16.8957 13.7391 16.8489C13.795 16.8021 13.863 16.772 13.9352 16.762L16.3632 16.41L17.4492 14.217C17.4817 14.1517 17.5318 14.0967 17.5938 14.0583C17.6558 14.0199 17.7273 13.9995 17.8002 13.9995C17.8732 13.9995 17.9447 14.0199 18.0067 14.0583C18.0687 14.0967 18.1188 14.1517 18.1512 14.217L19.2372 16.41L21.6652 16.762C21.7373 16.7723 21.805 16.8027 21.8607 16.8495C21.9164 16.8963 21.9579 16.9578 21.9805 17.027C22.003 17.0962 22.0058 17.1703 21.9885 17.241C21.9711 17.3117 21.9343 17.3761 21.8822 17.427L20.1252 19.134L20.5392 21.544C20.5517 21.6158 20.5437 21.6898 20.5162 21.7573C20.4887 21.8249 20.4429 21.8834 20.3838 21.9262C20.3248 21.969 20.2549 21.9944 20.1822 21.9995C20.1094 22.0046 20.0367 21.9891 19.9722 21.955L17.8002 20.817Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Summary card 6a per Figma component set 5852:83434 (".kualitasPaketSoal") —
// 5 tone variants (Sangat Baik/Baik/Sedang/Buruk/Sangat Buruk), same 3-tone
// mapping as the Ringkasan card above.
function KualitasPaketSoalCard({ stats }: { stats: AnalisisStats }) {
  const total = stats.totalAnalyzable || 1;
  const kualitasTone = getKualitasTone(stats.kualitasLabel);
  const tone = KUALITAS_TONE_STYLES[kualitasTone];
  const ToneIcon = tone.chipIcon;
  return (
    <ChartCard
      title="Kualitas Paket Soal"
      icon={<KualitasPaketSoalIcon className={`h-6 w-6 ${tone.iconColor}`} />}
      iconBg={tone.iconBg}
      border={tone.cardBorder}
      tooltip="Menunjukkan kualitas paket soal berdasarkan hasil analisis soal yang layak digunakan, perlu ditinjau, atau perlu diperbaiki."
    >
      <div className="flex items-center gap-2">
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold text-tertiary-900">
            {stats.layak}/{stats.totalAnalyzable}
          </span>
          <span className="pb-1 text-sm text-tertiary-700">Soal</span>
        </div>
        <Pill label={stats.kualitasLabel} icon={<ToneIcon size={14} />} className={tone.pill} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`rounded-full px-1.5 text-xs font-bold ${tone.iconBg} ${tone.labelColor}`}>
          {formatPercent(stats.skorKualitas)}
        </span>
        <span className="text-xs text-tertiary-700">
          <span className={`font-bold ${tone.labelColor}`}>Layak Digunakan</span> dari soal yang dianalisis
        </span>
      </div>
      <div className="flex h-6 w-full gap-0.5">
        {[
          { key: "layak", value: stats.layak, className: "bg-success-500" },
          { key: "ditinjau", value: stats.ditinjau, className: "bg-warning-500" },
          { key: "diperbaiki", value: stats.diperbaiki, className: "bg-error-500" },
        ]
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <div
              key={segment.key}
              className={`h-full rounded ${segment.className}`}
              style={{ width: `${(segment.value / total) * 100}%` }}
            />
          ))}
      </div>
      <div className="flex flex-col gap-2">
        <LegendRow
          dotClassName="bg-success-500"
          label="Layak Digunakan"
          count={stats.layak}
          percent={`${Math.round((stats.layak / total) * 100)}%`}
        />
        <LegendRow
          dotClassName="bg-warning-500"
          label="Perlu Ditinjau"
          count={stats.ditinjau}
          percent={`${Math.round((stats.ditinjau / total) * 100)}%`}
        />
        <LegendRow
          dotClassName="bg-error-500"
          label="Perlu Diperbaiki"
          count={stats.diperbaiki}
          percent={`${Math.round((stats.diperbaiki / total) * 100)}%`}
        />
      </div>
    </ChartCard>
  );
}

// Summary card 6b per Figma node 5980-199390.
function CakupanAnalisisCard({ stats }: { stats: AnalisisStats }) {
  const percentAnalyzed = (stats.totalAnalyzable / stats.totalSoal) * 100;
  return (
    <ChartCard
      title="Cakupan Analisis"
      icon={<img src={assetUrl("/images/icons/analyze.svg")} alt="" className="h-6 w-6" />}
      iconBg="bg-primary-25"
      border="border-tertiary-100"
      tooltip="Menunjukkan jumlah dan persentase soal yang sudah dianalisis dibandingkan dengan seluruh soal dalam asesmen."
    >
      <div className="flex flex-col items-center gap-1 py-2">
        <div
          className="relative flex h-[140px] w-[140px] items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--color-success-500) 0% ${percentAnalyzed}%, var(--color-tertiary-200) ${percentAnalyzed}% 100%)`,
          }}
        >
          <div className="flex h-[112px] w-[112px] flex-col items-center justify-center rounded-full bg-white text-center">
            <span className="text-3xl font-bold text-tertiary-900">{stats.totalAnalyzable}</span>
            <span className="text-xs leading-tight text-tertiary-900">
              Dari {stats.totalSoal} Soal
              <br />
              Dianalisis
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <LegendRow
          dotClassName="bg-success-500"
          label="Dianalisis"
          count={stats.totalAnalyzable}
          percent={`${Math.round(percentAnalyzed)}%`}
        />
        <LegendRow
          dotClassName="bg-tertiary-500"
          label="Tidak Dianalisis"
          count={stats.tidakDianalisis}
          percent={`${Math.round((stats.tidakDianalisis / stats.totalSoal) * 100)}%`}
        />
      </div>
    </ChartCard>
  );
}

// Summary card 6c per Figma node 5980-199391 (structure) / 5984-69846
// (chart) — the visible scale only spans the 4 bands a real test score can
// land in (Rendah/Dapat Diterima/Baik/Sangat Baik); "Tidak Reliabel" and
// "Sempurna" stay in the legend as the outer theoretical bounds of the
// classification but never render as bar segments. Bands sit flush against
// each other (no gap, no rounding) with a 1px divider — colored per the
// Figma spec — marking each boundary; the divider position lines up with
// the tick label below it.
const RELIABILITY_BANDS: { className: string; width: number; dividerClassName: string; tick?: string }[] = [
  { className: "bg-error-500", width: 70, dividerClassName: "bg-error-800", tick: "0,7" },
  { className: "bg-warning-500", width: 10, dividerClassName: "bg-secondary-700", tick: "0,8" },
  { className: "bg-success-500", width: 10, dividerClassName: "bg-success-700", tick: "0,9" },
  { className: "bg-success-700", width: 10, dividerClassName: "bg-success-900" },
];

// Reliabilitas Tes description copy per Figma's ".reliabilitasTes" component
// set (node 5856:84934) — each of the 6 labels has its own hand-written
// sentence, not a template substitution.
const RELIABILITAS_DESCRIPTION: Record<ReliabilitasLabel, string> = {
  Sempurna: "Soal dalam tes menunjukkan konsistensi yang sempurna.",
  "Sangat Baik": "Konsistensi soal dalam tes sangat baik.",
  Baik: "Konsistensi soal dalam tes sudah baik.",
  "Dapat Diterima": "Konsistensi soal dalam tes sudah cukup.",
  Rendah: "Konsistensi soal dalam tes masih rendah.",
  "Tidak Reliabel": "Konsistensi soal dalam tes belum terpenuhi.",
};

function ReliabilitasTesCard({ stats }: { stats: AnalisisStats }) {
  const tone = KUALITAS_TONE_STYLES[getReliabilitasTone(stats.reliabilitasLabel)];
  const ToneIcon = tone.chipIcon;
  return (
    <ChartCard
      title="Reliabilitas Tes"
      icon={<img src={assetUrl("/images/icons/timeline.svg")} alt="" className="h-6 w-6" />}
      iconBg="bg-primary-25"
      border="border-tertiary-100"
      tooltip="Menunjukkan konsistensi antar soal dalam mengukur kemampuan peserta."
    >
      <div className="flex items-center gap-2">
        <span className="text-3xl font-bold text-tertiary-900">{stats.reliabilitas.toFixed(2).replace(".", ",")}</span>
        <Pill label={stats.reliabilitasLabel} icon={<ToneIcon size={14} />} className={tone.pill} />
      </div>
      <p className="text-xs text-tertiary-700">{RELIABILITAS_DESCRIPTION[stats.reliabilitasLabel]}</p>
      <ThresholdBar bands={RELIABILITY_BANDS} endDividerClassName="bg-success-900" markerPercent={stats.reliabilitas * 100} />
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <div className="flex flex-col gap-2">
          <LegendRow dotClassName="bg-error-700" label="Tidak Reliabel" />
          <LegendRow dotClassName="bg-error-500" label="Rendah" />
          <LegendRow dotClassName="bg-warning-500" label="Dapat Diterima" />
        </div>
        <div className="flex flex-col gap-2">
          <LegendRow dotClassName="bg-success-500" label="Baik" />
          <LegendRow dotClassName="bg-success-700" label="Sangat Baik" />
          <LegendRow dotClassName="bg-success-900" label="Sempurna" />
        </div>
      </div>
    </ChartCard>
  );
}

export function RingkasanKualitasPaketSoal({
  assessment,
  stats,
  jumlahPeserta,
}: {
  assessment: Assessment;
  stats: AnalisisStats;
  jumlahPeserta: number;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[22px] bg-white p-5 shadow-[0_4px_10px_rgba(51,51,51,0.04)]">
      <div className="flex items-center gap-2">
        <span className="text-base font-semibold text-tertiary-900">Ringkasan Kualitas Paket Soal</span>
        <Pill
          label={`${stats.totalAnalyzable}/${stats.totalSoal} Dianalisis`}
          className="bg-success-50 border-success-200 text-success-500"
        />
      </div>

      <div className="h-px w-full bg-tertiary-300" />

      <InfoAnalisisCard assessment={assessment} stats={stats} jumlahPeserta={jumlahPeserta} />

      <RekomendasiCard stats={stats} />

      <div className="flex flex-wrap gap-4">
        <KualitasPaketSoalCard stats={stats} />
        <CakupanAnalisisCard stats={stats} />
        <ReliabilitasTesCard stats={stats} />
      </div>
    </div>
  );
}
