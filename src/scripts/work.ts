import { createCleanup, prefersReducedMotion, typeInto } from "./util";

const MINI_STEP_MS = 220;
const CMD_SPEED = 22;
const RES_SPEED = 18;

/** Reveals project cards in view, types their CLI command/result, and runs hover/focus effects. */
export function initWork(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-work-card]"));
  if (!cards.length) return () => {};

  const cleanup = createCleanup();
  const reduce = prefersReducedMotion();

  cards.forEach((card) => {
    const cmdEl = card.querySelector<HTMLElement>("[data-work-cmd]")!;
    const resEl = card.querySelector<HTMLElement>("[data-work-res]")!;
    const caret = card.querySelector<HTMLElement>("[data-work-caret]")!;
    const cmdText = card.dataset["cmd"] ?? cmdEl.textContent ?? "";
    const resText = card.dataset["res"] ?? resEl.textContent ?? "";
    const wrapper = card.parentElement as HTMLElement;
    const canvas = card.querySelector<HTMLElement>('[data-constellation-canvas="card"]');
    const flow = card.querySelector<HTMLElement>("[data-mini-flow]")!;
    const nodes = Array.from(flow.querySelectorAll<HTMLElement>("[data-flow-node]"));
    const labels = Array.from(flow.querySelectorAll<HTMLElement>("[data-flow-label]"));
    const line = flow.querySelector<HTMLElement>("[data-flow-line]")!;
    const dot = flow.querySelector<HTMLElement>("[data-flow-dot]")!;

    // ---- in-view reveal + terminal typing (text is full in the HTML for crawlers / no-JS) ----
    let stopTyping = () => {};
    if (!reduce) {
      cmdEl.textContent = "";
      resEl.textContent = "";
      caret.hidden = false;
    }

    const revealTargets = [
      wrapper,
      ...Array.from(card.querySelectorAll<HTMLElement>("[data-reveal]")),
    ];
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        revealTargets.forEach((el) => el.classList.add("is-in"));
        const stopCmd = typeInto(cmdEl, cmdText, CMD_SPEED, reduce, () => {
          stopTyping = typeInto(resEl, resText, RES_SPEED, reduce, () => {
            caret.hidden = true;
          });
        });
        stopTyping = stopCmd;
        if (reduce) caret.hidden = true;
      },
      { rootMargin: "-15% 0px" },
    );
    io.observe(card);
    cleanup.add(() => {
      io.disconnect();
      stopTyping();
    });

    // ---- hover / focus: constellation + mini flow ----
    let step = -1;
    let timer = 0;

    const paint = () => {
      const n = nodes.length;
      const pos = step < 0 ? 0 : Math.max(0, Math.min(step, n - 1)) / Math.max(1, n - 1);
      line.style.transform = `scaleX(${step < 0 ? 0 : pos})`;
      const showDot = !reduce && step >= 0 && step < n;
      dot.hidden = !showDot;
      dot.style.left = `calc(0.875rem + (100% - 1.75rem) * ${pos})`;
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
