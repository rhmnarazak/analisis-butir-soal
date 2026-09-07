import { useEffect, type RefObject } from "react";

// A plain vertical mouse-wheel scroll does nothing on a horizontally-scrollable
// container in most browsers (only Shift+wheel or a trackpad's horizontal
// swipe moves it natively) — which reads as "scroll is broken" to anyone
// without a trackpad. This redirects vertical wheel input into horizontal
// movement, but only while there's still room to move that way; at either
// edge it lets the event fall through to the page's normal vertical scroll.
export function useHorizontalWheelScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleWheel(event: WheelEvent) {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

      const max = el!.scrollWidth - el!.clientWidth;
      if (max <= 0) return;

      const atStart = el!.scrollLeft <= 0;
      const atEnd = el!.scrollLeft >= max;
      if ((event.deltaY < 0 && atStart) || (event.deltaY > 0 && atEnd)) return;

      event.preventDefault();
      el!.scrollLeft = Math.max(0, Math.min(max, el!.scrollLeft + event.deltaY));
    }

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [ref]);
}
