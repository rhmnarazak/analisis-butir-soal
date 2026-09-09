import { useEffect } from "react";
import { createPortal } from "react-dom";
import { assetUrl } from "../../lib/assetUrl";

// Warning popup per Figma node 6018-117374 — shown instead of actually
// running AnBuSo when "Perbarui Hasil Analisis" is clicked while the
// assessment is still "Publikasi Ulang" (nilai edited but not republished
// yet): re-analyzing now would just analyze against nilai that are about
// to be superseded, so the admin has to publish first.
export function AnalisisBelumBisaDiperbaruiDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="analisis-belum-bisa-diperbarui-title"
        onClick={(event) => event.stopPropagation()}
        className="animate-fade-in flex flex-col items-center gap-[30px] rounded-[20px] bg-white px-10 pt-10 pb-[45px] shadow-[0px_0px_3px_0px_rgba(0,0,0,0.1),0px_4px_20px_0px_rgba(0,0,0,0.15)]"
      >
        <div className="flex w-[415px] max-w-full flex-col items-center gap-5">
          <img
            src={assetUrl("/images/icons/warning-hasil-analisis-belum-bisa-diperbarui.svg")}
            alt=""
            className="h-[210px] w-[210px]"
          />
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 id="analisis-belum-bisa-diperbarui-title" className="text-2xl leading-9 font-semibold text-tertiary-900">
              Hasil Analisis Belum Bisa Diperbarui
            </h2>
            <p className="text-base leading-6 text-tertiary-600">
              Untuk dapat memperbarui hasil analisis, Anda harus mempublikasi perubahan nilai asesmen.
            </p>
          </div>
        </div>

        <div className="flex w-[415px] max-w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 flex-1 items-center justify-center whitespace-nowrap rounded-xl bg-primary-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-400"
          >
            Oke, Mengerti
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
