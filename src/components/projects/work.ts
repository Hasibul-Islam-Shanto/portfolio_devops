import { createCleanup, prefersReducedMotion } from "@/scripts/util";

const MINI_STEP_MS = 220;

/** Reveals project cards in view and runs hover/focus effects on their mini pipeline flows and canvas. */
export function initWork(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-work-card]"));
  if (!cards.length) return () => {};

  const cleanup = createCleanup();
  const reduce = prefersReducedMotion();

  cards.forEach((card) => {
    const wrapper = card.parentElement as HTMLElement;
    const canvas = card.querySelector<HTMLElement>('[data-constellation-canvas="card"]');
    const flow = card.querySelector<HTMLElement>("[data-mini-flow]");
    if (!flow) return;

    const nodes = Array.from(flow.querySelectorAll<HTMLElement>("[data-flow-node]"));
    const labels = Array.from(flow.querySelectorAll<HTMLElement>("[data-flow-label]"));
    const line = flow.querySelector<HTMLElement>("[data-flow-line]");
    const dot = flow.querySelector<HTMLElement>("[data-flow-dot]");

    // ---- in-view reveal ----
    const revealTargets = [
      wrapper,
      ...Array.from(card.querySelectorAll<HTMLElement>("[data-reveal]")),
    ];
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        revealTargets.forEach((el) => el.classList.add("is-in"));
      },
      { rootMargin: "-15% 0px" },
    );
    io.observe(card);
    cleanup.add(() => {
      io.disconnect();
    });

    // ---- hover / focus: constellation + mini flow ----
    let step = -1;
    let timer = 0;

    const paint = () => {
      const n = nodes.length;
      const pos = step < 0 ? 0 : Math.max(0, Math.min(step, n - 1)) / Math.max(1, n - 1);
      if (line) line.style.transform = `scaleX(${step < 0 ? 0 : pos})`;
      const showDot = !reduce && step >= 0 && step < n;
      if (dot) {
        dot.hidden = !showDot;
        dot.style.left = `calc(0.875rem + (100% - 1.75rem) * ${pos})`;
      }
      nodes.forEach((node, idx) => {
        node.classList.toggle("is-on", idx === step);
        node.classList.toggle("is-done", step > idx);
      });
      labels.forEach((label, idx) => label.classList.toggle("is-lit", idx === step || step > idx));
    };

    const setHovered = (on: boolean) => {
      canvas?.setAttribute("data-constellation-active", String(on));
      window.clearInterval(timer);
      if (!on || reduce) {
        step = -1;
        paint();
        return;
      }
      step = 0;
      paint();
      timer = window.setInterval(() => {
        step += 1;
        paint();
        if (step >= nodes.length) window.clearInterval(timer);
      }, MINI_STEP_MS);
    };

    const on = () => setHovered(true);
    const off = () => setHovered(false);
    card.addEventListener("mouseenter", on);
    card.addEventListener("mouseleave", off);
    card.addEventListener("focusin", on);
    card.addEventListener("focusout", off);
    cleanup.add(() => {
      card.removeEventListener("mouseenter", on);
      card.removeEventListener("mouseleave", off);
      card.removeEventListener("focusin", on);
      card.removeEventListener("focusout", off);
      window.clearInterval(timer);
    });
  });

  return () => cleanup.run();
}
