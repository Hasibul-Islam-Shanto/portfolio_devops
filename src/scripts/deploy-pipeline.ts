import { createCleanup, prefersReducedMotion } from "./util";

const STEP_MS = 900;

/**
 * Steps the 11-node pipeline diagram every 900ms. A full pass (last node done) turns the feedback
 * loop and monitor dot active and the status to HEALTHY; the next tick restarts and bumps the
 * release number. Reduced motion renders the final all-done state and does not run a timer.
 */
export function initDeployPipeline(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const el = root.querySelector<HTMLElement>("[data-deploy-pipeline]");
  if (!el) return () => {};

  const cleanup = createCleanup();
  const reduce = prefersReducedMotion();
  const count = Number(el.dataset["nodeCount"] ?? 0);
  const nodes = Array.from(el.querySelectorAll<SVGGElement>("[data-pipeline-node]"));
  const connectors = Array.from(el.querySelectorAll<SVGLineElement>("[data-pipeline-connector]"));
  const feedback = el.querySelector<SVGPathElement>("[data-feedback-loop]");
  const dot = el.querySelector<SVGRectElement>("[data-monitor-dot]");
  const statusEl = el.querySelector<HTMLElement>("[data-pipeline-status]");
  const releaseEl = el.querySelector<HTMLElement>("[data-release-num]");

  let step = reduce ? count - 1 : 0;
  let release = 2463;

  const render = () => {
    const complete = reduce || step >= count - 1;
    nodes.forEach((n, idx) => {
      n.dataset["nodeState"] = reduce || idx <= step ? "done" : "pending";
    });
    connectors.forEach((c, idx) => {
      c.dataset["connectorDone"] = String(reduce || step >= idx + 1);
    });
    if (feedback) feedback.dataset["feedbackActive"] = String(complete);
    if (dot) {
      dot.dataset["dotActive"] = String(complete);
      dot.setAttribute("class", complete && !reduce ? "dp-dot monitor-pulse" : "dp-dot");
    }
    if (statusEl) statusEl.textContent = complete ? "HEALTHY" : "RUNNING";
    if (releaseEl) releaseEl.textContent = String(release);
  };

  render();
  if (reduce) return () => {};

  const id = window.setInterval(() => {
    if (step >= count) {
      release += 1;
      step = 0;
    } else {
      step += 1;
    }
    render();
  }, STEP_MS);
  cleanup.add(() => window.clearInterval(id));
  return () => cleanup.run();
}
