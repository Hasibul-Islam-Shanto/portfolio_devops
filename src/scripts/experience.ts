import { createCleanup, createSpring, prefersReducedMotion } from "./util";

/** Scroll-synced coral line draw on the experience timeline (spring: stiffness 140, damping 28). */
export function initExperience(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const timeline = root.querySelector<HTMLElement>("[data-timeline]");
  const bar = timeline?.querySelector<HTMLElement>("[data-timeline-progress]");
  if (!timeline || !bar) return () => {};

  const cleanup = createCleanup();
  const paint = (v: number) => {
    bar.style.transform = `scaleY(${Math.min(1, Math.max(0, v))})`;
  };

  if (prefersReducedMotion()) {
    paint(1);
    return () => {};
  }

  const spring = createSpring(140, 28, paint);
  let frame = 0;
  const measure = () => {
    frame = 0;
    const rect = timeline.getBoundingClientRect();
    const total = Math.max(1, rect.height);
    const triggerY = window.innerHeight * 0.65;
    spring.set(Math.min(1, Math.max(0, (triggerY - rect.top) / total)));
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(measure);
  };

  measure();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  cleanup.add(() => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (frame) cancelAnimationFrame(frame);
    spring.destroy();
  });
  return () => cleanup.run();
}
