import type { QuestionAnalysis } from "../types/assessment";

// A soal is analyzable exactly when its jenis can be scored at all (some
// types simply can't be — PG Esai, Survei — which shows up as null Validitas
// on the soal itself, since that's always the first metric computed).
export function isAnalyzable(q: QuestionAnalysis): boolean {
  return q.validitas !== null;
}

export function countAnalyzableSoal(questions: QuestionAnalysis[]): number {
  return questions.filter(isAnalyzable).length;
}
