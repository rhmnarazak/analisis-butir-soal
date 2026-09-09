// Per-participant Status is driven by the assessment's own "Peserta
// Dinilai" ratio (e.g. "29/30"), not by each participant's own grading
// progress: the participants still awaiting grading are always the first
// ones in table order, and the rest are already "Selesai".
export function parsePesertaDinilai(value: string): { dinilai: number; total: number } {
  const [dinilaiStr, totalStr] = value.split("/");
  return { dinilai: Number(dinilaiStr), total: Number(totalStr) };
}

export function statusFor(index: number, belumCount: number): { label: string; className: string } {
  if (index < belumCount) {
    return { label: "Perlu Dinilai", className: "bg-secondary-50 border-secondary-200 text-warning-500" };
  }
  return { label: "Selesai", className: "bg-success-50 border-success-200 text-success-500" };
}

// Nilai-table status: an ungraded participant is always "Perlu Dinilai"
// (Nilai Asli not yet available); once graded, Nilai Asli vs the
// assessment's ABN (kkm) decides Remedial (below ABN) vs Lulus (at/above).
export function nilaiStatusFor(
  index: number,
  belumCount: number,
  nilaiAsli: number,
  kkm: number,
): { label: string; className: string } {
  if (index < belumCount) {
    return { label: "Perlu Dinilai", className: "bg-secondary-50 border-secondary-200 text-warning-500" };
  }
  if (nilaiAsli < kkm) {
    return { label: "Remedial", className: "bg-error-50 border-error-200 text-error-500" };
  }
  return { label: "Lulus", className: "bg-success-50 border-success-200 text-success-500" };
}
