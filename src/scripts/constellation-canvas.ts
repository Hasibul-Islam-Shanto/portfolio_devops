import { createCleanup, isTouchOnlyDevice, prefersReducedMotion } from "./util";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  baseAlpha: number;
}

// Design-system RGB triplets: warm sand (#EFE6D8), ink navy (#10151F), and coral-red (#E8503A)
const SAND = [239, 230, 216] as const;
const INK = [16, 21, 31] as const;
const CORAL = [232, 80, 58] as const;

const CONFIG = {
  hero: { dots: 52, link: 130 },
  card: { dots: 18, link: 105 },
} as const;
const CURSOR_RADIUS = 140;
const CURSOR_LERP = 0.16;

// Tracks the currently active card canvas across the entire application to guarantee
// that only one card instance runs requestAnimationFrame at any time.
let activeCardCanvas: HTMLCanvasElement | null = null;

function activateCard(canvas: HTMLCanvasElement) {
  if (activeCardCanvas && activeCardCanvas !== canvas) {
    activeCardCanvas.dataset["constellationActive"] = "false";
  }
  activeCardCanvas = canvas;
  canvas.dataset["constellationActive"] = "true";
}

function deactivateCard(canvas: HTMLCanvasElement) {
  if (activeCardCanvas === canvas) {
    activeCardCanvas = null;
  }
  canvas.dataset["constellationActive"] = "false";
}

const mix = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

function createParticles(count: number, width: number, height: number): Particle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.18 + Math.random() * 0.28;
    return {
      x: Math.random() * Math.max(1, width),
      y: Math.random() * Math.max(1, height),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      baseRadius: 1.1 + Math.random() * 0.85,
      baseAlpha: 0.15 + Math.random() * 0.1,
    };
  });
}

/**
 * Drives one `<canvas data-constellation-canvas="hero|card">`. The animation runs only while
 * `data-constellation-active="true"` (always for the hero; hover/focus only for project cards), so idle
 * cards never run a rAF loop. Reduced motion draws a single static frame.
 */
function initCanvas(canvas: HTMLCanvasElement): () => void {
  const container = canvas.parentElement;
  if (!container) return () => {};
  const variant = canvas.dataset["constellationCanvas"] === "card" ? "card" : "hero";
  const { dots, link } = CONFIG[variant];
  const reduce = prefersReducedMotion();
  const touchOnly = isTouchOnlyDevice();

  let ctx: CanvasRenderingContext2D | null = null;
  try {
    ctx = canvas.getContext("2d");
  } catch {
    ctx = null;
  }

  let particles: Particle[] = [];
  let size = { width: 0, height: 0 };
  let raf = 0;
  let stopLoop: (() => void) | null = null;
  const target = { x: -9999, y: -9999, inside: false };
  const smooth = { x: -9999, y: -9999, presence: 0 };
  canvas.dataset["constellationStatic"] = String(reduce);

  const syncSize = () => {
    const rect = container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width || container.clientWidth || 800));
    const height = Math.max(1, Math.floor(rect.height || container.clientHeight || 500));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = { width, height };
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (particles.length !== dots) {
      particles = createParticles(dots, width, height);
    } else {
      for (const p of particles) {
        p.x = ((p.x % width) + width) % width;
        p.y = ((p.y % height) + height) % height;
      }
    }
  };

  const draw = (drift: boolean) => {
    if (!ctx) return;
    const { width, height } = size;
    ctx.clearRect(0, 0, width, height);

    if (!reduce && !touchOnly) {
      if (target.inside) {
        if (smooth.presence <= 0.01) {
          smooth.x = target.x;
          smooth.y = target.y;
        } else {
          smooth.x += (target.x - smooth.x) * CURSOR_LERP;
          smooth.y += (target.y - smooth.y) * CURSOR_LERP;
        }
        smooth.presence += (1 - smooth.presence) * 0.12;
      } else {
        smooth.presence += (0 - smooth.presence) * 0.1;
      }
    } else {
      smooth.presence = 0;
    }
    const hasCursor = smooth.presence > 0.01;

    if (drift) {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += width;
        else if (p.x > width) p.x -= width;
        if (p.y < 0) p.y += height;
        else if (p.y > height) p.y -= height;
      }
    }

    const factors = new Float32Array(particles.length);
    if (hasCursor) {
      particles.forEach((p, i) => {
        const dist = Math.hypot(p.x - smooth.x, p.y - smooth.y);
        if (dist < CURSOR_RADIUS) factors[i] = (1 - dist / CURSOR_RADIUS) * smooth.presence;
      });
    }

    const isLight =
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "light";
    const baseColor = isLight ? INK : SAND;

    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i]!;
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j]!;
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist >= link) continue;
        const ratio = 1 - dist / link;
        const base = 0.14 * ratio;
        const boost = Math.max(factors[i] ?? 0, factors[j] ?? 0);
        if (boost > 0.02) {
          const alpha = Math.min(0.52, base + boost * 0.36 * ratio);
          ctx.strokeStyle = `rgba(${mix(baseColor[0], CORAL[0], boost)}, ${mix(baseColor[1], CORAL[1], boost)}, ${mix(baseColor[2], CORAL[2], boost)}, ${alpha.toFixed(3)})`;
        } else {
          ctx.strokeStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${base.toFixed(3)})`;
        }
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    if (hasCursor) {
      particles.forEach((p, i) => {
        const cf = factors[i] ?? 0;
        if (cf <= 0.02) return;
        ctx!.strokeStyle = `rgba(${CORAL[0]}, ${CORAL[1]}, ${CORAL[2]}, ${Math.min(0.55, cf * 0.52).toFixed(3)})`;
        ctx!.beginPath();
        ctx!.moveTo(smooth.x, smooth.y);
        ctx!.lineTo(p.x, p.y);
        ctx!.stroke();
      });
    }

    particles.forEach((p, i) => {
      const cf = factors[i] ?? 0;
      const radius = p.baseRadius * (1 + cf * 0.45);
      if (cf > 0.02) {
        const alpha = Math.min(0.6, p.baseAlpha + cf * 0.38);
        ctx!.fillStyle = `rgba(${mix(baseColor[0], CORAL[0], cf)}, ${mix(baseColor[1], CORAL[1], cf)}, ${mix(baseColor[2], CORAL[2], cf)}, ${alpha.toFixed(3)})`;
      } else {
        ctx!.fillStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${p.baseAlpha.toFixed(3)})`;
      }
      ctx!.beginPath();
      ctx!.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx!.fill();
    });
  };

  const start = () => {
    if (stopLoop) return;
    const cleanup = createCleanup();
    syncSize();

    if (reduce) {
      draw(false);
      const onResize = () => {
        syncSize();
        draw(false);
      };
      window.addEventListener("resize", onResize);
      cleanup.add(() => window.removeEventListener("resize", onResize));
    } else {
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return;
        const rect = container.getBoundingClientRect();
        target.x = e.clientX - rect.left;
        target.y = e.clientY - rect.top;
        target.inside = true;
      };
      const onLeave = () => {
        target.inside = false;
      };
      if (!touchOnly) {
        container.addEventListener("pointermove", onMove, { passive: true });
        container.addEventListener("pointerleave", onLeave, { passive: true });
        cleanup.add(() => {
          container.removeEventListener("pointermove", onMove);
          container.removeEventListener("pointerleave", onLeave);
        });
      }
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(syncSize);
        ro.observe(container);
        cleanup.add(() => ro.disconnect());
      } else {
        window.addEventListener("resize", syncSize);
        cleanup.add(() => window.removeEventListener("resize", syncSize));
      }
      const tick = () => {
        draw(true);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      cleanup.add(() => {
        cancelAnimationFrame(raf);
        raf = 0;
      });
    }
    stopLoop = () => {
      cleanup.run();
      stopLoop = null;
    };
  };

  const sync = () => {
    if (canvas.dataset["constellationActive"] === "true") {
      if (variant === "card") {
        if (activeCardCanvas && activeCardCanvas !== canvas) {
          activeCardCanvas.dataset["constellationActive"] = "false";
        }
        activeCardCanvas = canvas;
      }
      start();
    } else {
      if (variant === "card" && activeCardCanvas === canvas) {
        activeCardCanvas = null;
      }
      stopLoop?.();
    }
  };

  sync();
  const observer = new MutationObserver(sync);
  observer.observe(canvas, { attributes: true, attributeFilter: ["data-constellation-active"] });

  let cardCleanup: (() => void) | null = null;
  if (variant === "card") {
    const onEnter = () => activateCard(canvas);
    const onLeave = (e?: Event) => {
      if (e?.type === "focusout") {
        const fe = e as FocusEvent;
        if (fe.relatedTarget && container.contains(fe.relatedTarget as Node)) {
          return;
        }
      }
      deactivateCard(canvas);
    };

    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    container.addEventListener("focusin", onEnter);
    container.addEventListener("focusout", onLeave);

    cardCleanup = () => {
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      container.removeEventListener("focusin", onEnter);
      container.removeEventListener("focusout", onLeave);
      deactivateCard(canvas);
    };
  }

  return () => {
    observer.disconnect();
    cardCleanup?.();
    stopLoop?.();
  };
}

export function initConstellationCanvases(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const cleanups = Array.from(
    root.querySelectorAll<HTMLCanvasElement>("canvas[data-constellation-canvas]"),
  ).map(initCanvas);
  return () => {
    cleanups.forEach((fn) => fn());
    activeCardCanvas = null;
  };
}
