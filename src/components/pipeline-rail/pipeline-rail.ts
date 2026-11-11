import { createCleanup, createSpring, prefersReducedMotion } from "@/scripts/util";

const STAGE_IDS = ["build", "test", "deploy", "monitor", "scale"] as const;

/**
 * Fixed right-side scroll progress rail. A single rAF-throttled measure handles scroll + resize:
 * visible after scrolling 50% of the #build hero, active stage = last section whose top crossed the
 * viewport midpoint, progress interpolated between sections and eased with a spring
 * (stiffness 140, damping 26; direct under reduced motion).
 */
export function initPipelineRail(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const rail = root.querySelector<HTMLElement>("[data-pipeline-rail]");
  if (!rail) return () => {};

  const cleanup = createCleanup();
  const reduce = prefersReducedMotion();
  const bar = rail.querySelector<HTMLElement>("[data-rail-progress]");
  const links = Array.from(rail.querySelectorAll<HTMLAnchorElement>("[data-rail-link]"));

  const spring = createSpring(140, 26, (v) => {
    if (bar) bar.style.transform = `scaleY(${Math.min(1, Math.max(0, v))})`;
  });

  let visible = false;
  let active = -1;
  let frame = 0;

  const setVisible = (on: boolean) => {
    if (on === visible && rail.dataset["visible"] !== undefined) return;
    visible = on;
    rail.dataset["visible"] = String(on);
    rail.setAttribute("aria-hidden", String(!on));
    links.forEach((a) => a.setAttribute("tabindex", on ? "0" : "-1"));
  };

  const setActive = (idx: number) => {
    if (idx === active) return;
    active = idx;
    links.forEach((a, i) => {
      const on = i === idx;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
    });
  };

  const measure = () => {
    frame = 0;
    const els = STAGE_IDS.map((id) => document.getElementById(id));
    if (els.some((e) => !e)) return;
    const y = window.scrollY;
    const mid = y + window.innerHeight * 0.5;
    const tops = els.map((e) => e!.getBoundingClientRect().top + y);
    const hero = els[0]!.offsetHeight;
    setVisible(y > hero * 0.5);

    const atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 2;
    let idx = 0;
    tops.forEach((t, i) => {
      if (mid >= t) idx = i;
    });
    let progress: number;
    if (atBottom) {
      idx = STAGE_IDS.length - 1;
      progress = 1;
    } else if (idx >= STAGE_IDS.length - 1) {
      progress = 1;
    } else {
      const from = tops[idx] ?? 0;
      const to = tops[idx + 1] ?? from + 1;
      const part = Math.min(1, Math.max(0, (mid - from) / (to - from)));
      progress = (idx + part) / (STAGE_IDS.length - 1);
    }
    setActive(idx);
    spring.set(progress, reduce);
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
