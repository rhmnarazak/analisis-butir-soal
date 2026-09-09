import { CircleCheck, Info } from "lucide-react";
import { createPortal } from "react-dom";
import { useAssessmentStore, type SnackbarState } from "../../state/AssessmentStore";

type Content = {
  tone: "information" | "success";
  title: string;
  body: string;
  Icon: typeof Info;
  width: number;
  iconSize?: number;
  padding?: string;
};

// Bottom-right toast per Figma nodes 5859-339405 (pending), 5859-335806
// (success-run), 5859-336978 (success-update) — a "reset" variant (not in
// Figma) reuses the success card's look for the checkpoint-restore action.
// "nilai-updated" (Figma node 6018-92280) is handled separately below since
// its body embeds the edited participant's name.
const CONTENT: Record<"pending" | "success-run" | "success-update" | "reset", Content> = {
  // Card width follows Figma's own per-variant "Toast" frame width (frame
  // width minus its 30px right padding) — the success cards' longer body
  // copy gets a wider card (443px) so it still wraps to exactly 2 lines
  // instead of 3, while the title (never more than one line's worth of
  // text at that width) stays on a single line.
  pending: {
    tone: "information",
    title: "Menunggu Hasil Analisis",
    body: "Menyiapkan Hasil Analisis. Proses ini mungkin memerlukan beberapa saat.",
    Icon: Info,
    width: 378,
  },
  "success-run": {
    tone: "success",
    title: "Informasi Analisis Berhasil Dimuat",
    body: "Status analisis berhasil dimuat. Anda dapat melanjutkan untuk melihat hasil Analisis Butir Soal.",
    Icon: CircleCheck,
    width: 443,
  },
  "success-update": {
    tone: "success",
    title: "Informasi Analisis Berhasil Dimuat Ulang",
    body: "Status analisis berhasil dimuat ulang. Anda dapat melanjutkan untuk melihat hasil Analisis Butir Soal.",
    Icon: CircleCheck,
    width: 443,
  },
  reset: {
    tone: "success",
    title: "Status Berhasil Direset",
    body: "Seluruh status asesmen telah dikembalikan ke data awal (checkpoint).",
    Icon: CircleCheck,
    width: 378,
  },
};

const TONE_CLASSES: Record<"information" | "success", { bg: string; border: string; title: string }> = {
  information: { bg: "bg-information-100", border: "border-information-300", title: "text-information-600" },
  success: { bg: "bg-success-100", border: "border-success-300", title: "text-success-600" },
};

// Publish snackbars (Figma nodes 6028-117806 "publish-success" and
// 6018-116123 "publish-update-success") use a bigger 40px icon and the
// LgnSnackbar component's own "16px 24px" padding — both distinct from the
// other toasts' 24px icon / 5859-series padding, so they're kept as their
// own literal content here rather than folded into CONTENT.
function getContent(snackbar: SnackbarState): Content {
  if (snackbar.kind === "nilai-updated") {
    return {
      tone: "success",
      title: "Nilai Berhasil Diubah",
      body: `Nilai untuk ${snackbar.participantName} berhasil diperbarui.`,
      Icon: CircleCheck,
      width: 443,
    };
  }
  if (snackbar.kind === "publish-success") {
    return {
      tone: "success",
      title: "Berhasil Publikasi Nilai",
      body: "Nilai asesmen telah berhasil dipublikasikan",
      Icon: CircleCheck,
      width: 355,
      iconSize: 40,
      padding: "px-6 py-4",
    };
  }
  if (snackbar.kind === "publish-update-success") {
    return {
      tone: "success",
      title: "Berhasil Publikasi Perubahan Nilai",
      body: "Perubahan nilai asesmen telah berhasil dipublikasikan",
      Icon: CircleCheck,
      width: 355,
      iconSize: 40,
      padding: "px-6 py-4",
    };
  }
  return CONTENT[snackbar.kind];
}

export function SnackbarHost() {
  const { snackbar, dismissSnackbar } = useAssessmentStore();
  if (!snackbar) return null;

  const content = getContent(snackbar);
  const tone = TONE_CLASSES[content.tone];
  const Icon = content.Icon;

  return createPortal(
    <div className="fixed right-0 bottom-0 z-[200] p-[30px]">
      <div
        onClick={dismissSnackbar}
        style={{ width: content.width }}
        className={`max-w-[90vw] cursor-pointer rounded-xl border shadow-[0px_0px_3px_0px_rgba(0,0,0,0.1),0px_4px_20px_0px_rgba(0,0,0,0.15)] ${content.padding ?? "px-5 pt-3.5 pb-4"} ${tone.bg} ${tone.border}`}
      >
        <div className="flex items-start gap-3">
          <Icon size={content.iconSize ?? 24} className={`shrink-0 ${tone.title}`} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className={`whitespace-nowrap text-base font-bold ${tone.title}`}>{content.title}</span>
            <span className="text-sm text-tertiary-900">{content.body}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
