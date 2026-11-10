import { createCleanup, createSpring, prefersReducedMotion } from "./util";

/** Scroll-synced coral line draw and accordion expand/collapse on the experience commit timeline. */
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

  let schedule = () => {};

  if (prefersReducedMotion()) {
    paint(1);
  } else {
    const spring = createSpring(140, 28, paint);
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = timeline.getBoundingClientRect();
      const total = Math.max(1, rect.height);
      const triggerY = window.innerHeight * 0.65;
      spring.set(Math.min(1, Math.max(0, (triggerY - rect.top) / total)));
    };
    schedule = () => {
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
  }

  // Commit-card accordion toggles
  const toggles = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-exp-toggle]"));
  toggles.forEach((btn) => {
    const card = btn.closest<HTMLElement>("[data-exp-card]");
    if (!card) return;

    const onToggle = () => {
      const isExpanded = card.classList.toggle("is-expanded");
      btn.setAttribute("aria-expanded", String(isExpanded));
      const role = card.getAttribute("data-role") || "[Job Title]";
      const company = card.getAttribute("data-company") || "[Company Name]";
      btn.setAttribute(
        "aria-label",
        `${isExpanded ? "Collapse" : "Expand"} details for ${role} at ${company}`,
      );

      // Re-measure timeline progress as card expands/collapses
      schedule();
      const timer = window.setTimeout(schedule, 320);
      cleanup.add(() => window.clearTimeout(timer));
    };

    btn.addEventListener("click", onToggle);
    cleanup.add(() => btn.removeEventListener("click", onToggle));
  });

  return () => cleanup.run();
}
