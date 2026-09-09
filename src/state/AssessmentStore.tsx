import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { assessments as seedAssessments } from "../data/assessments";
import { participants } from "../data/participants";
import { formatAnalisisTimestamp } from "../lib/analisisInfo";
import type { Assessment } from "../types/assessment";

const CHECKPOINT_KEY = "anbuso.checkpoint";
const CURRENT_KEY = "anbuso.current";
const ANALYSIS_DELAY_MS = 5000;
const SUCCESS_SNACKBAR_MS = 4000;
const RESET_SNACKBAR_MS = 3000;

export type SnackbarState =
  | { kind: "pending" | "success-run" | "success-update"; assessmentId: string }
  | { kind: "reset" };

// The checkpoint is the "data awal" the user can always return to — seeded
// once from the static mock data, then left alone (resetToCheckpoint reads
// it, nothing ever overwrites it after this first run).
function loadCheckpoint(): Assessment[] {
  try {
    const raw = localStorage.getItem(CHECKPOINT_KEY);
    if (raw) return JSON.parse(raw) as Assessment[];
  } catch {
    // localStorage unavailable/corrupt — fall through and reseed below.
  }
  const seeded = structuredClone(seedAssessments);
  try {
    localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(seeded));
  } catch {
    // Private-mode/quota errors: checkpoint just won't persist across reloads.
  }
  return seeded;
}

function loadCurrent(checkpoint: Assessment[]): Assessment[] {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    if (raw) return JSON.parse(raw) as Assessment[];
  } catch {
    // fall through
  }
  return structuredClone(checkpoint);
}

interface AssessmentStoreValue {
  assessments: Assessment[];
  getAssessment: (id: string) => Assessment | undefined;
  isAnalysisPending: (id: string) => boolean;
  /** C.1: bulk-completes every peserta and advances status to Siap Dipublikasi. */
  completeAllPeserta: (id: string) => void;
  /** C.2: advances status to Selesai and opens up the AnBuSo "Analisis Sekarang" gate. */
  publishNilai: (id: string) => void;
  /** C.3/C.4: simulates a 5s AnBuSo run — infers "run" vs "update" from the current anbusoState. */
  runAnalysis: (id: string) => void;
  resetToCheckpoint: () => void;
  snackbar: SnackbarState | null;
  dismissSnackbar: () => void;
}

const AssessmentStoreContext = createContext<AssessmentStoreValue | null>(null);

export function AssessmentStoreProvider({ children }: { children: ReactNode }) {
  const [assessments, setAssessments] = useState<Assessment[]>(() => loadCurrent(loadCheckpoint()));
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const snackbarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_KEY, JSON.stringify(assessments));
    } catch {
      // ignore persistence failures
    }
  }, [assessments]);

  // Timers are owned by the provider (not by whichever component triggered
  // them) so a 5s analysis run keeps counting down across navigation.
  useEffect(() => {
    const timerMap = timers.current;
    return () => {
      timerMap.forEach((t) => clearTimeout(t));
      if (snackbarTimer.current) clearTimeout(snackbarTimer.current);
    };
  }, []);

  const updateAssessment = useCallback((id: string, patch: Partial<Assessment>) => {
    setAssessments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const showSnackbar = useCallback((next: SnackbarState, autoHideMs?: number) => {
    if (snackbarTimer.current) clearTimeout(snackbarTimer.current);
    setSnackbar(next);
    snackbarTimer.current = autoHideMs ? setTimeout(() => setSnackbar(null), autoHideMs) : null;
  }, []);

  const getAssessment = useCallback((id: string) => assessments.find((a) => a.id === id), [assessments]);
  const isAnalysisPending = useCallback((id: string) => pendingIds.has(id), [pendingIds]);

  const completeAllPeserta = useCallback(
    (id: string) => {
      const assessment = assessments.find((a) => a.id === id);
      if (!assessment) return;
      const roster = participants.slice(0, assessment.jumlahPeserta);
      const avg = roster.length
        ? Math.round(roster.reduce((sum, p) => sum + p.nilaiPenyesuaian, 0) / roster.length)
        : undefined;
      updateAssessment(id, {
        status: "Siap Dipublikasi",
        anbusoState: "Menunggu Publikasi",
        pesertaDinilai: `${assessment.jumlahPeserta}/${assessment.jumlahPeserta}`,
        nilaiRataRata: avg !== undefined ? String(avg) : assessment.nilaiRataRata,
      });
    },
    [assessments, updateAssessment],
  );

  const publishNilai = useCallback(
    (id: string) => {
      updateAssessment(id, {
        status: "Selesai",
        anbusoState: "Analisis Sekarang",
        nilaiDipublikasikanPada: formatAnalisisTimestamp(new Date()),
        nilaiDipublikasikanOleh: "Abdul Razak",
      });
    },
    [updateAssessment],
  );

  const runAnalysis = useCallback(
    (id: string) => {
      if (pendingIds.has(id)) return;
      const assessment = assessments.find((a) => a.id === id);
      if (!assessment) return;
      const kind: "run" | "update" = assessment.anbusoState === "Perbarui Hasil Analisis" ? "update" : "run";

      setPendingIds((prev) => new Set(prev).add(id));
      showSnackbar({ kind: "pending", assessmentId: id });

      const timer = setTimeout(() => {
        updateAssessment(id, {
          anbusoState: "Lihat Hasil Analisis",
          dianalisisPada: formatAnalisisTimestamp(new Date()),
          dianalisisOleh: "Abdul Razak",
          analisisKind: kind,
        });
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        showSnackbar({ kind: kind === "update" ? "success-update" : "success-run", assessmentId: id }, SUCCESS_SNACKBAR_MS);
        timers.current.delete(id);
      }, ANALYSIS_DELAY_MS);
      timers.current.set(id, timer);
    },
    [assessments, pendingIds, showSnackbar, updateAssessment],
  );

  const resetToCheckpoint = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current.clear();
    setPendingIds(new Set());
    setAssessments(structuredClone(loadCheckpoint()));
    showSnackbar({ kind: "reset" }, RESET_SNACKBAR_MS);
  }, [showSnackbar]);

  const dismissSnackbar = useCallback(() => {
    if (snackbarTimer.current) clearTimeout(snackbarTimer.current);
    setSnackbar(null);
  }, []);

  const value: AssessmentStoreValue = {
    assessments,
    getAssessment,
    isAnalysisPending,
    completeAllPeserta,
    publishNilai,
    runAnalysis,
    resetToCheckpoint,
    snackbar,
    dismissSnackbar,
  };

  return <AssessmentStoreContext.Provider value={value}>{children}</AssessmentStoreContext.Provider>;
}

export function useAssessmentStore(): AssessmentStoreValue {
  const ctx = useContext(AssessmentStoreContext);
  if (!ctx) throw new Error("useAssessmentStore must be used within an AssessmentStoreProvider");
  return ctx;
}
