import { Ban, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAssessmentStore } from "../../state/AssessmentStore";
import type { AnbusoState } from "../../types/assessment";

const RUNNABLE_STATES: AnbusoState[] = ["Analisis Sekarang", "Perbarui Hasil Analisis"];

const disabledStates: AnbusoState[] = ["Menunggu Penilaian", "Menunggu Publikasi"];
const mutedStates: AnbusoState[] = ["Tidak Ada Analisis", "Tidak Dapat Dianalisis"];

export function isAnbusoActionable(state: AnbusoState): boolean {
  return !disabledStates.includes(state) && !mutedStates.includes(state);
}

export function AnbusoStateIcon({ state, size = 16, className }: { state: AnbusoState; size?: number; className?: string }) {
  if (disabledStates.includes(state)) {
    return <Loader2 size={size} className={`animate-spin ${className ?? ""}`} />;
  }
  if (mutedStates.includes(state)) {
    return <Ban size={size} className={className} />;
  }
  return <Sparkles size={size} className={className} />;
}

export function AnbusoActionCell({
  state,
  assessmentId,
  // True when the assessment is "Publikasi Ulang" — its nilai haven't been
  // (re)published yet, so re-running AnBuSo now would just analyze against
  // nilai about to change again. Instead of silently running here, this
  // just navigates to the AnBuSo tab, where clicking the button surfaces
  // the actual "Hasil Analisis Belum Bisa Diperbarui" warning (AnbusoGate).
  blocked = false,
}: {
  state: AnbusoState;
  assessmentId: string;
  blocked?: boolean;
}) {
  const navigate = useNavigate();
  const { isAnalysisPending, runAnalysis } = useAssessmentStore();
  const pending = isAnalysisPending(assessmentId);

  if (pending) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-tertiary-500">
        <Loader2 size={16} className="shrink-0 animate-spin" />
        Menunggu Hasil Analisis
      </span>
    );
  }

  if (!isAnbusoActionable(state)) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-tertiary-500">
        <AnbusoStateIcon state={state} size={16} className="shrink-0" />
        {state}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        if (state === "Lihat Hasil Analisis") {
          navigate(`/asesmen/${assessmentId}/analisis-butir-soal`);
        } else if (state === "Perbarui Hasil Analisis" && blocked) {
          navigate(`/asesmen/${assessmentId}?tab=anbuso`);
        } else if (RUNNABLE_STATES.includes(state)) {
          runAnalysis(assessmentId);
          navigate(`/asesmen/${assessmentId}?tab=anbuso`);
        }
      }}
      className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-primary-500 underline-offset-2 hover:underline"
    >
      <AnbusoStateIcon state={state} size={16} className="shrink-0" />
      {state}
    </button>
  );
}
