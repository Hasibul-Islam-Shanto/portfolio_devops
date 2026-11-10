import { prefersReducedMotion } from "./util";

/**
 * Scroll-reveal for every `[data-reveal]` element (the CSS hides them only when `html.js` is set and
 * motion is allowed). Elements marked `data-reveal-managed` are revealed by their own script
 * (e.g. project cards). Reduced motion shows everything immediately.
 */
export function initReveal(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const items = Array.from(
    root.querySelectorAll<HTMLElement>("[data-reveal]:not([data-reveal-managed])"),
  );
  if (!items.length) return () => {};

  if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
    items.forEach((el) => el.classList.add("is-in"));
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "-10% 0px" },
  );
  items.forEach((el) => io.observe(el));
  return () => io.disconnect();
}
