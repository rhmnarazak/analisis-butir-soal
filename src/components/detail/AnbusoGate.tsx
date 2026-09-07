import { CalendarDays, CircleCheck, CircleX, Loader2, Sparkles, User } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { getAnalisisRunInfo } from "../../lib/analisisInfo";
import { getAnalisisTier, MIN_PESERTA_ANALYSIS } from "../../lib/itemAnalysisStats";
import { parsePesertaDinilai } from "../../lib/participantStatus";
import { countAnalyzableSoal } from "../../lib/soalAnalysis";
import type { AnbusoState, Assessment, Participant, QuestionAnalysis } from "../../types/assessment";

type ColorKey = "warning" | "information" | "success" | "error";

interface PanelConfig {
  colorKey: ColorKey;
  title: string;
  description: string;
  button: { label: string; enabled: boolean; variant: "primary" | "warning" } | null;
  showLastUpdate: boolean;
  // Overrides the computed "Jumlah Soal Dapat Dianalisis" count — used when
  // the state itself implies none of the soal qualify (e.g. "Tidak Dapat
  // Dianalisis" says every soal is PG Esai/Survei), regardless of the mock
  // question bank's real composition.
  soalDapatDianalisisOverride?: number;
}

// Content per Figma nodes 5711-164438/5857-242455/5857-243038/5858-254064/
// 5857-244557/5857-249951 (base states), plus the sub-variants below:
// "Tidak Dapat Dianalisis" splits into 3 reasons (5857-249953/250818/251254)
// and "Lihat Hasil Analisis" splits into 3 peserta-count tiers
// (5858-254066/254176/254920). "Tidak Ada Analisis" (no design given) reuses
// the "Menunggu Penilaian" gate copy as a reasonable fallback.
function getPanelConfig(state: AnbusoState, jumlahPeserta: number, allNonAnalyzable: boolean): PanelConfig {
  switch (state) {
    case "Menunggu Penilaian":
      return {
        colorKey: "warning",
        title: "Paket Soal Belum Bisa Dianalisis",
        description:
          "Segera selesaikan penilaian seluruh peserta terlebih dahulu dan publikasikan nilai ke peserta.",
        button: { label: "Analisis Sekarang", enabled: false, variant: "primary" },
        showLastUpdate: false,
      };
    case "Menunggu Publikasi":
      return {
        colorKey: "warning",
        title: "Paket Soal Belum Bisa Dianalisis",
        description: "Silakan publikasikan nilai ke peserta terlebih dahulu.",
        button: { label: "Analisis Sekarang", enabled: false, variant: "primary" },
        showLastUpdate: false,
      };
    case "Analisis Sekarang":
      return {
        colorKey: "information",
        title: "Paket Soal Siap Dianalisis",
        description:
          "Silakan analisis butir soal untuk mengetahui hasil evaluasi kualitas paket soal dan rekomendasinya.",
        button: { label: "Analisis Sekarang", enabled: true, variant: "primary" },
        showLastUpdate: false,
      };
    case "Lihat Hasil Analisis": {
      const tier = getAnalisisTier(jumlahPeserta);
      return {
        colorKey: "success",
        title: tier.title,
        description: tier.description,
        button: { label: "Lihat Hasil Analisis", enabled: true, variant: "primary" },
        showLastUpdate: true,
      };
    }
    case "Perbarui Hasil Analisis":
      return {
        colorKey: "warning",
        title: "Hasil Analisis Perlu Diperbarui",
        description: "Perubahan nilai pada peserta menyebabkan hasil analisis perlu diperbarui.",
        button: { label: "Perbarui Hasil Analisis", enabled: true, variant: "warning" },
        showLastUpdate: true,
      };
    case "Tidak Dapat Dianalisis":
      if (jumlahPeserta < MIN_PESERTA_ANALYSIS && allNonAnalyzable) {
        return {
          colorKey: "error",
          title: "Paket Soal Tidak Dapat Dianalisis",
          description:
            "Jumlah peserta belum mencukupi untuk analisis yang valid, minimal diperlukan 10 peserta, dan seluruh soal pada paket ini tidak memenuhi syarat untuk dianalisis  karena semua soal termasuk jenis soal PG Esai/Survei.",
          button: null,
          showLastUpdate: false,
          soalDapatDianalisisOverride: 0,
        };
      }
      if (jumlahPeserta < MIN_PESERTA_ANALYSIS) {
        return {
          colorKey: "error",
          title: "Paket Soal Tidak Dapat Dianalisis",
          description: "Jumlah peserta belum mencukupi untuk analisis yang valid, minimal diperlukan 10 peserta.",
          button: null,
          showLastUpdate: false,
        };
      }
      return {
        colorKey: "error",
        title: "Paket Soal Tidak Dapat Dianalisis",
        description:
          "Seluruh soal pada paket ini tidak memenuhi syarat untuk dianalisis  karena semua soal termasuk jenis soal PG Esai/Survei.",
        button: null,
        showLastUpdate: false,
        soalDapatDianalisisOverride: 0,
      };
    default:
      return {
        colorKey: "warning",
        title: "Paket Soal Belum Bisa Dianalisis",
        description:
          "Segera selesaikan penilaian seluruh peserta terlebih dahulu dan publikasikan nilai ke peserta.",
        button: { label: "Analisis Sekarang", enabled: false, variant: "primary" },
        showLastUpdate: false,
      };
  }
}

const COLOR_CLASSES: Record<ColorKey, { border: string; iconBg: string; iconText: string; divider: string }> = {
  warning: { border: "border-warning-200", iconBg: "bg-warning-25", iconText: "text-warning-500", divider: "bg-warning-200" },
  information: {
    border: "border-information-200",
    iconBg: "bg-information-25",
    iconText: "text-information-500",
    divider: "bg-information-200",
  },
  success: { border: "border-success-200", iconBg: "bg-success-25", iconText: "text-success-500", divider: "bg-success-200" },
  error: { border: "border-error-200", iconBg: "bg-error-25", iconText: "text-error-500", divider: "bg-error-200" },
};

function StatusItem({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-tertiary-900">
      {ok ? (
        <CircleCheck size={20} className="shrink-0 text-success-500" />
      ) : (
        <CircleX size={20} className="shrink-0 text-error-500" />
      )}
      {children}
    </div>
  );
}

export function AnbusoGate({
  assessment,
  questions,
  isPending = false,
  onRunAnalysis,
}: {
  assessment: Assessment;
  participants: Participant[];
  questions: QuestionAnalysis[];
  // True for the 5s window after clicking "Analisis Sekarang"/"Perbarui
  // Hasil Analisis" — swaps the button for the Figma loading variant.
  isPending?: boolean;
  onRunAnalysis?: () => void;
}) {
  const navigate = useNavigate();
  // The mock roster tops out at 30 real participants, but "Jumlah Peserta"
  // has to reflect the assessment's actual peserta count (some test cases
  // go up to 100+) — so this reads the assessment field, not the roster
  // array length.
  const jumlahPeserta = assessment.jumlahPeserta;
  const allNonAnalyzable = questions.every((q) => q.jenis === "pilihanGandaEsai" || q.jenis === "survei");
  const config = getPanelConfig(assessment.anbusoState, jumlahPeserta, allNonAnalyzable);
  const colors = COLOR_CLASSES[config.colorKey];
  const canViewResults = assessment.anbusoState === "Lihat Hasil Analisis";
  const canRunAnalysis =
    assessment.anbusoState === "Analisis Sekarang" || assessment.anbusoState === "Perbarui Hasil Analisis";
  const runInfo = getAnalisisRunInfo(assessment);

  const soalDapatDianalisis = config.soalDapatDianalisisOverride ?? countAnalyzableSoal(questions);
  const { dinilai, total } = parsePesertaDinilai(assessment.pesertaDinilai);
  const semuaDinilai = total > 0 && dinilai >= total;
  const sudahDipublikasi = assessment.status === "Selesai";
  const pesertaCukup = jumlahPeserta >= MIN_PESERTA_ANALYSIS;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-base font-semibold text-tertiary-900">Analisis Butir Soal</span>
        {config.showLastUpdate && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-tertiary-700">
            <span className="flex items-center gap-1.5">
              {runInfo.label}
              <span className="flex items-center gap-1">
                <CalendarDays size={16} />
                {runInfo.tanggal}
              </span>
            </span>
            <div className="h-4 w-px bg-tertiary-300" />
            <span className="flex items-center gap-1.5">
              Oleh :
              <span className="flex items-center gap-1">
                <User size={16} />
                {runInfo.oleh}
              </span>
            </span>
          </div>
        )}
      </div>

      <div className={`flex flex-col gap-5 rounded-lg border bg-white p-5 ${colors.border}`}>
        <div className="flex flex-nowrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className={`flex shrink-0 items-center justify-center rounded p-2 ${colors.iconBg}`}>
              <Sparkles size={24} className={colors.iconText} />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-lg font-semibold text-tertiary-900">{config.title}</span>
              <span className="text-base text-tertiary-900">{config.description}</span>
            </div>
          </div>
          {isPending && config.button ? (
            <button
              type="button"
              disabled
              className={`flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-5 text-sm font-semibold text-white ${
                config.button.variant === "warning" ? "bg-warning-700" : "bg-primary-700"
              }`}
            >
              <Loader2 size={20} className="animate-spin" />
              Menunggu Hasil Analisis
            </button>
          ) : (
            config.button && (
              <button
                type="button"
                disabled={!config.button.enabled}
                onClick={
                  canViewResults
                    ? () => navigate(`/asesmen/${assessment.id}/analisis-butir-soal`)
                    : canRunAnalysis && config.button.enabled
                      ? onRunAnalysis
                      : undefined
                }
                className={`flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-5 text-sm font-semibold transition-colors ${
                  !config.button.enabled
                    ? "bg-tertiary-300 text-tertiary-500"
                    : config.button.variant === "warning"
                      ? "bg-warning-500 text-white hover:bg-warning-500/90"
                      : "bg-primary-500 text-white hover:bg-primary-400"
                }`}
              >
                <Sparkles size={20} />
                {config.button.label}
              </button>
            )
          )}
        </div>

        <div className={`h-px w-full ${colors.divider}`} />

        <div className="flex flex-wrap items-center gap-6">
          <StatusItem ok={pesertaCukup}>
            Jumlah Peserta <strong className="font-bold">{jumlahPeserta}</strong>
          </StatusItem>
          <StatusItem ok={soalDapatDianalisis > 0}>
            Jumlah Soal Dapat Dianalisis <strong className="font-bold">{soalDapatDianalisis}</strong>
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

    </div>
  );
}
