// Per-participant Status is driven by the assessment's own "Peserta
// Dinilai" ratio (e.g. "29/30"), not by each participant's own grading
// progress: the participants still awaiting grading are always the first
// ones in table order, and the rest are already "Selesai".
export function parsePesertaDinilai(value: string): { dinilai: number; total: number } {
  const [dinilaiStr, totalStr] = value.split("/");
  return { dinilai: Number(dinilaiStr), total: Number(totalStr) };
}

// Nilai Tertinggi/Terendah for the "Publikasi Nilai" popup: computed only
// over already-graded participants (index >= belumCount), using each one's
// "final" nilai (Nilai Penyesuaian when set, else Nilai Asli) — same
// resolution rule as nilaiStatusFor(). Returns null when nobody's graded yet.
export function getNilaiExtremes(
  participants: { nama: string; nilaiAsli: number; nilaiPenyesuaian: number | null }[],
  belumCount: number,
): {
  tertinggi: { nama: string; nilai: number } | null;
  terendah: { nama: string; nilai: number } | null;
} {
  const graded = participants
    .slice(belumCount)
    .map((p) => ({ nama: p.nama, nilai: p.nilaiPenyesuaian ?? p.nilaiAsli }));

  if (graded.length === 0) return { tertinggi: null, terendah: null };

  let tertinggi = graded[0];
  let terendah = graded[0];
  for (const p of graded) {
    if (p.nilai > tertinggi.nilai) tertinggi = p;
    if (p.nilai < terendah.nilai) terendah = p;
  }
  return { tertinggi, terendah };
}

export function statusFor(index: number, belumCount: number): { label: string; className: string } {
  if (index < belumCount) {
    return { label: "Perlu Dinilai", className: "bg-secondary-50 border-secondary-200 text-warning-500" };
  }
  return { label: "Selesai", className: "bg-success-50 border-success-200 text-success-500" };
}

// Nilai-table status: an ungraded participant is always "Perlu Dinilai"
// (Nilai Asli not yet available). Once graded, whichever score is the
// participant's "final" one decides Remedial (below ABN) vs Lulus
// (at/above) — Nilai Penyesuaian when it's been set (an absolute
// replacement score), otherwise Nilai Asli.
export function nilaiStatusFor(
  index: number,
  belumCount: number,
  nilaiAsli: number,
  nilaiPenyesuaian: number | null,
  kkm: number,
): { label: string; className: string } {
  if (index < belumCount) {
    return { label: "Perlu Dinilai", className: "bg-secondary-50 border-secondary-200 text-warning-500" };
  }
  const nilaiFinal = nilaiPenyesuaian ?? nilaiAsli;
  if (nilaiFinal < kkm) {
    return { label: "Remedial", className: "bg-error-50 border-error-200 text-error-500" };
  }
  return { label: "Lulus", className: "bg-success-50 border-success-200 text-success-500" };
}
