import { createCleanup, prefersReducedMotion } from "./util";

const STAGE_DURATION_MS = 1600;

/**
 * Loops the 7-stage status strip: stages 0..6 are active in turn, stage 7 is the all-done / HEALTHY
 * pass. Reduced motion renders the final all-done state without a timer.
 */
export function initDeployFlow(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const el = root.querySelector<HTMLElement>("[data-deploy-flow]");
  if (!el) return () => {};

  const cleanup = createCleanup();
  const count = Number(el.dataset["stageCount"] ?? 0);
  const tiles = Array.from(el.querySelectorAll<HTMLElement>("[data-stage]"));
  const connectors = Array.from(el.querySelectorAll<HTMLElement>("[data-connector-index]"));
  const labels = Array.from(el.querySelectorAll<HTMLElement>("[data-stage-label]"));
  const status = el.querySelector<HTMLElement>("[data-deploy-status]");
  const reduce = prefersReducedMotion();

  const render = (stage: number) => {
    const allDone = reduce || stage === count;
    tiles.forEach((tile, i) => {
      const active = !allDone && i === stage;
      const done = allDone || i < stage;
      tile.dataset["state"] = active ? "active" : done ? "done" : "pending";
    });
    connectors.forEach((c, i) => {
      c.dataset["connectorActive"] = String(allDone || stage >= i + 1);
    });
    labels.forEach((l, i) => {
      const active = !allDone && i === stage;
      const done = allDone || i < stage;
      l.dataset["labelState"] = active ? "active" : done ? "done" : "pending";
    });
    if (status) status.textContent = allDone || stage === count - 1 ? "HEALTHY" : "IN PROGRESS";
  };

  if (reduce) {
    render(count);
    return () => {};
  }

  let stage = 0;
  render(stage);
  const id = window.setInterval(() => {
    stage = stage >= count ? 0 : stage + 1;
    render(stage);
  }, STAGE_DURATION_MS);
  cleanup.add(() => window.clearInterval(id));
  return () => cleanup.run();
}
