import { Send } from "lucide-react";
import { useState } from "react";
import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "../components/assessment/Breadcrumbs";
import { needsRepublish } from "../components/assessment/StatusBadge";
import { ConfirmDialog } from "../components/common/ConfirmDialog";
import { AnbusoGate } from "../components/detail/AnbusoGate";
import { DetailTabBar, type DetailTab } from "../components/detail/DetailTabBar";
import { OfflinePesertaCard } from "../components/detail/OfflinePesertaCard";
import { PesertaTab } from "../components/detail/PesertaTab";
import { PublikasiNilaiDialog } from "../components/detail/PublikasiNilaiDialog";
import { SoalTab } from "../components/detail/SoalTab";
import { SummaryCard } from "../components/detail/SummaryCard";
import { participants } from "../data/participants";
import { getQuestionsForAssessment } from "../data/questionAnalysis";
import { usePageTitle } from "../hooks/usePageTitle";
import { getPublikasiInfo } from "../lib/analisisInfo";
import { getNilaiExtremes, parsePesertaDinilai } from "../lib/participantStatus";
import { countAnalyzableSoal } from "../lib/soalAnalysis";
import { useAssessmentStore } from "../state/AssessmentStore";

type PendingConfirm = "completePeserta" | "publish" | null;

export function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<DetailTab>(() =>
    searchParams.get("tab") === "anbuso" ? "Analisis Butir Soal" : "Peserta",
  );
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);
  const { getAssessment, completeAllPeserta, publishNilai, runAnalysis, isAnalysisPending, nilaiOverrides } =
    useAssessmentStore();

  const assessment = getAssessment(id ?? "");
  usePageTitle(assessment ? assessment.namaUjian : "Detail Nilai Asesmen");

  if (!assessment) {
    return <Navigate to="/" replace />;
  }

  // The mock roster only has 30 entries; assessments with fewer peserta
  // (e.g. a small make-up exam) show just the first `jumlahPeserta` of them.
  const visibleParticipants = participants.slice(0, assessment.jumlahPeserta);
  const questionAnalysis = getQuestionsForAssessment(assessment.id);
  // Nilai already published, but a subsequent edit means the AnBuSo analysis
  // is now stale — re-publishing here is what unblocks re-running it.
  const isRepublishState = needsRepublish(assessment);

  // Same per-assessment Nilai Penyesuaian overrides PesertaTab applies, so
  // the Publikasi Nilai popup's Nilai Tertinggi/Terendah reflect any Ubah
  // Nilai edits made before publishing.
  const overridesForAssessment = nilaiOverrides[assessment.id];
  const effectiveParticipants = overridesForAssessment
    ? visibleParticipants.map((p) =>
        p.id in overridesForAssessment ? { ...p, nilaiPenyesuaian: overridesForAssessment[p.id] } : p,
      )
    : visibleParticipants;
  const { dinilai, total } = parsePesertaDinilai(assessment.pesertaDinilai);
  const belumCount = Math.min(Math.max(0, total - dinilai), effectiveParticipants.length);
  const { tertinggi: nilaiTertinggi, terendah: nilaiTerendah } = getNilaiExtremes(effectiveParticipants, belumCount);

  return (
    <>
      <div className="flex items-end justify-between gap-5">
        <div className="flex flex-1 flex-col gap-2.5">
          <Breadcrumbs
            items={[
              { label: "Asesmen" },
              { label: "Nilai Asesmen", to: "/" },
              { label: "Detail Nilai Asesmen" },
            ]}
          />
          <h1 className="text-2xl font-semibold text-tertiary-900">{assessment.namaUjian}</h1>
        </div>
        <button
          type="button"
          onClick={() => setPendingConfirm("publish")}
          className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-400"
        >
          <Send size={16} />
          {isRepublishState ? "Publikasi Perubahan Nilai" : "Publikasikan Nilai"}
        </button>
      </div>

      <SummaryCard assessment={assessment} />

      {assessment.metode === "Offline" ? (
        <OfflinePesertaCard
          assessment={assessment}
          participants={visibleParticipants}
          onRowClick={assessment.status === "Perlu Dinilai" ? () => setPendingConfirm("completePeserta") : undefined}
        />
      ) : (
        <div className="flex flex-col gap-5 rounded-[22px] bg-white p-5 shadow-[0_4px_10px_rgba(51,51,51,0.04)]">
          <DetailTabBar
            active={tab}
            onChange={setTab}
            anbusoState={assessment.anbusoState}
            totalSoal={questionAnalysis.length}
            soalDapatDianalisis={countAnalyzableSoal(questionAnalysis)}
          />

          {tab === "Peserta" && (
            <PesertaTab
              assessmentId={assessment.id}
              participants={visibleParticipants}
              kkm={assessment.kkm}
              pesertaDinilai={assessment.pesertaDinilai}
              status={assessment.status}
              needsRepublish={isRepublishState}
              publikasiInfo={getPublikasiInfo(assessment)}
              onRowClick={
                assessment.status === "Perlu Dinilai" ? () => setPendingConfirm("completePeserta") : undefined
              }
            />
          )}
          {tab === "Soal" && <SoalTab questions={questionAnalysis} />}
          {tab === "Analisis Butir Soal" && (
            <AnbusoGate
              assessment={assessment}
              participants={visibleParticipants}
              questions={questionAnalysis}
              isPending={isAnalysisPending(assessment.id)}
              onRunAnalysis={() => runAnalysis(assessment.id)}
            />
          )}
        </div>
      )}

      <ConfirmDialog
        open={pendingConfirm === "completePeserta"}
        title="Lewati Proses Penilaian"
        message="Lewati Proses Penilaian dan Ubah Semua Status Peserta jadi Selesai."
        onCancel={() => setPendingConfirm(null)}
        onConfirm={() => {
          completeAllPeserta(assessment.id);
          setPendingConfirm(null);
        }}
      />
      <PublikasiNilaiDialog
        open={pendingConfirm === "publish"}
        isRepublish={isRepublishState}
        assessment={assessment}
        nilaiTertinggi={nilaiTertinggi}
        nilaiTerendah={nilaiTerendah}
        onCancel={() => setPendingConfirm(null)}
        onConfirm={() => {
          publishNilai(assessment.id);
          setPendingConfirm(null);
        }}
      />
    </>
  );
}
