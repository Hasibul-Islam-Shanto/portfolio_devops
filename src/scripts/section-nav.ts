import { createCleanup, prefersReducedMotion } from "./util";

export const SECTION_IDS = [
  "hero",
  "projects",
  "experience",
  "toolchain",
  "certifications",
  "process",
  "principles",
  "contact",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const TARGET_ALIASES: Record<string, SectionId> = {
  hero: "hero",
  build: "hero",
  projects: "projects",
  test: "projects",
  experience: "experience",
  toolchain: "toolchain",
  deploy: "toolchain",
  certifications: "certifications",
  process: "process",
  principles: "principles",
  monitor: "principles",
  contact: "contact",
  scale: "contact",
};

export function getTargetScrollY(targetEl: HTMLElement): number {
  const sectionEl = targetEl.closest<HTMLElement>("section") || targetEl;
  const computed = window.getComputedStyle(sectionEl);
  const scrollMarginTop = parseInt(computed.scrollMarginTop, 10);

  const header = document.querySelector<HTMLElement>("[data-site-header]");
  const fallbackOffset = header ? header.offsetHeight + 24 : 80;
  const offset = !isNaN(scrollMarginTop) && scrollMarginTop > 0 ? scrollMarginTop : fallbackOffset;

  const targetY = window.scrollY + sectionEl.getBoundingClientRect().top - offset;
  return Math.max(0, targetY);
}

export function smoothScrollTo(
  targetY: number,
  duration = 700,
  onComplete?: () => void,
): () => void {
  const reduce = prefersReducedMotion();
  if (reduce) {
    window.scrollTo(0, targetY);
    onComplete?.();
    return () => {};
  }

  const startY = window.scrollY;
  const distance = targetY - startY;

  if (Math.abs(distance) < 2) {
    onComplete?.();
    return () => {};
  }

  const prevScrollBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";

  let cancelled = false;
  let rafId = 0;
  const startTime = performance.now();

  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const restore = () => {
    document.documentElement.style.scrollBehavior = prevScrollBehavior;
    window.removeEventListener("wheel", onUserCancel);
    window.removeEventListener("touchstart", onUserCancel);
  };

  const onUserCancel = () => {
    cancelled = true;
    if (rafId) cancelAnimationFrame(rafId);
    restore();
  };

  window.addEventListener("wheel", onUserCancel, { passive: true, once: true });
  window.addEventListener("touchstart", onUserCancel, { passive: true, once: true });

  const step = (currentTime: number) => {
    if (cancelled) return;
    const elapsed = currentTime - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      restore();
      onComplete?.();
    }
  };

  rafId = requestAnimationFrame(step);

  return () => {
    cancelled = true;
    if (rafId) cancelAnimationFrame(rafId);
    restore();
  };
}

export function initSectionNav(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};

  const cleanup = createCleanup();
  const eyebrows = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-section-eyebrow]"));
  if (eyebrows.length === 0) return () => {};

  const sectionMap = new Map<SectionId, HTMLElement>();
  SECTION_IDS.forEach((id) => {
    const el = root.querySelector<HTMLElement>(`#${id}`);
    if (el) sectionMap.set(id, el);
  });

  let activeSectionId: SectionId = "hero";

  const setActiveEyebrow = (id: SectionId) => {
    activeSectionId = id;
    eyebrows.forEach((a) => {
      const match = a.dataset["sectionEyebrow"] === id;
      a.classList.toggle("is-active", match);
      if (match) {
        a.setAttribute("aria-current", "location");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  };

  const pulseEyebrow = (id: SectionId) => {
    const el = eyebrows.find((a) => a.dataset["sectionEyebrow"] === id);
    if (!el) return;
    el.classList.remove("is-highlighted");
    void el.offsetWidth;
    el.classList.add("is-highlighted");
    window.setTimeout(() => {
      el.classList.remove("is-highlighted");
    }, 400);
  };

  setActiveEyebrow("hero");

  if (typeof IntersectionObserver !== "undefined") {
    const visibleSections = new Set<SectionId>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id as SectionId;
          if (SECTION_IDS.includes(id)) {
            if (entry.isIntersecting) {
              visibleSections.add(id);
            } else {
              visibleSections.delete(id);
            }
          }
        });

        if (window.scrollY < 80) {
          setActiveEyebrow("hero");
          return;
        }

        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 50) {
          setActiveEyebrow("contact");
          return;
        }

        if (visibleSections.size > 0) {
          let closestId: SectionId = activeSectionId;
          let minDistance = Infinity;

          visibleSections.forEach((id) => {
            const el = sectionMap.get(id);
            if (!el) return;
            const top = el.getBoundingClientRect().top;
            const dist = Math.abs(top - 120);
            if (dist < minDistance) {
              minDistance = dist;
              closestId = id;
            }
          });

          setActiveEyebrow(closestId);
        }
      },
      {
        rootMargin: "-15% 0px -55% 0px",
        threshold: [0, 0.1, 0.25],
      },
    );

    sectionMap.forEach((el) => observer.observe(el));
    cleanup.add(() => observer.disconnect());
  }

  let activeScrollCancel: (() => void) | null = null;

  const onAnchorClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    const anchor = target?.closest<HTMLAnchorElement>("a[href^='#'], a[href^='/#']");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href || href === "#" || href === "/#") return;

    const isHomePage =
      typeof window !== "undefined"
        ? window.location.pathname === "/" || window.location.pathname === ""
        : true;
    if (href.startsWith("/#") && !isHomePage) {
      return;
    }

    const rawId = href.replace(/^\/?#/, "");
    const canonicalId = TARGET_ALIASES[rawId];
    if (!canonicalId) return;

    const targetSection =
      sectionMap.get(canonicalId) || root.querySelector<HTMLElement>(`#${rawId}`);
    if (!targetSection) return;

    e.preventDefault();

    if (activeScrollCancel) {
      activeScrollCancel();
      activeScrollCancel = null;
    }

    setActiveEyebrow(canonicalId);
    pulseEyebrow(canonicalId);

    const targetY = getTargetScrollY(targetSection);

    activeScrollCancel = smoothScrollTo(targetY, 700, () => {
      activeScrollCancel = null;
      pulseEyebrow(canonicalId);
      if (window.location.hash !== `#${rawId}`) {
        history.pushState(null, "", `#${rawId}`);
      }
    });
  };

  const scrollToInitialHash = () => {
    if (typeof window === "undefined") return;
    const rawId = window.location.hash.replace(/^\/?#/, "");
    if (!rawId) return;
    const canonicalId = TARGET_ALIASES[rawId];
    if (!canonicalId) return;
    const targetSection =
      sectionMap.get(canonicalId) || root.querySelector<HTMLElement>(`#${rawId}`);
    if (!targetSection) return;

    const execute = () => {
      const targetY = getTargetScrollY(targetSection);
      smoothScrollTo(targetY, 700, () => {
        setActiveEyebrow(canonicalId);
        pulseEyebrow(canonicalId);
      });
    };

    if (document.readyState === "complete") {
      setTimeout(execute, 80);
    } else {
      window.addEventListener("load", () => setTimeout(execute, 80), { once: true });
    }
  };

  scrollToInitialHash();

  root.addEventListener("click", onAnchorClick as EventListener);
  cleanup.add(() => {
    root.removeEventListener("click", onAnchorClick as EventListener);
    if (activeScrollCancel) activeScrollCancel();
  });

  return () => cleanup.run();
}
