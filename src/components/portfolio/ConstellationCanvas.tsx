import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export interface ConstellationCanvasProps {
  variant?: "hero" | "card";
  /**
   * Whether the animation is active.
   * - Hero: always true (runs from page load).
   * - Project card: true only while hovered, so non-hovered cards never run a RAF loop at rest.
   */
  active?: boolean;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseRadius: number;
  baseAlpha: number;
}

// Strict design-system RGB triplets: warm sand (#EFE6D8) and coral-red (#E8503A)
const SAND_RGB = [239, 230, 216] as const;
const CORAL_RGB = [232, 80, 58] as const;

const HERO_DOT_COUNT = 52;
const CARD_DOT_COUNT = 18;

const HERO_LINK_DIST = 130;
const CARD_LINK_DIST = 105;
const CURSOR_RADIUS = 140;
const CURSOR_LERP = 0.16;

function getInitialReducedMotion(framerReduced: boolean | null): boolean {
  if (framerReduced) return true;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return false;
}

function isTouchOnlyDevice(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(pointer: coarse), (hover: none)").matches;
}

function createParticles(count: number, width: number, height: number): Particle[] {
  const safeW = Math.max(1, width);
  const safeH = Math.max(1, height);
  const list: Particle[] = [];

  for (let i = 0; i < count; i++) {
    // Deterministic-friendly pseudo-random seeded fallback if needed, with organic distribution
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.18 + Math.random() * 0.28; // slow, continuous organic drift
    list.push({
      x: Math.random() * safeW,
      y: Math.random() * safeH,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      baseRadius: 1.1 + Math.random() * 0.85, // 1–2px radius
      baseAlpha: 0.15 + Math.random() * 0.1, // 15–25% ambient sand opacity
    });
  }
  return list;
}

function mixChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

export function ConstellationCanvas({
  variant = "hero",
  active = true,
  className = "",
}: ConstellationCanvasProps) {
  const framerReduced = useReducedMotion();
  const [reduce, setReduce] = useState<boolean>(() => getInitialReducedMotion(framerReduced));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const sizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const rafRef = useRef<number | null>(null);

  const targetMouseRef = useRef<{ x: number; y: number; inside: boolean }>({
    x: -9999,
    y: -9999,
    inside: false,
  });
  const smoothMouseRef = useRef<{ x: number; y: number; presence: number }>({
    x: -9999,
    y: -9999,
    presence: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(Boolean(framerReduced) || mq.matches);
    update();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
  }, [framerReduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    // For card variant: do not run RAF loop or attach active listeners while not hovered
    if (!active) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      ctx = null;
    }

    const dotCount = variant === "hero" ? HERO_DOT_COUNT : CARD_DOT_COUNT;
    const linkDist = variant === "hero" ? HERO_LINK_DIST : CARD_LINK_DIST;
    const touchOnly = isTouchOnlyDevice();

    const syncSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width || container.clientWidth || 800));
      const height = Math.max(1, Math.floor(rect.height || container.clientHeight || 500));
      const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;

      sizeRef.current = { width, height };
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      if (particlesRef.current.length !== dotCount) {
        particlesRef.current = createParticles(dotCount, width, height);
      } else {
        // Keep existing particles within resized bounds
        for (const p of particlesRef.current) {
          p.x = ((p.x % width) + width) % width;
          p.y = ((p.y % height) + height) % height;
        }
      }
    };

    syncSize();

    const drawFrame = (shouldDrift: boolean) => {
      if (!ctx) return;
      const { width, height } = sizeRef.current;
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const sm = smoothMouseRef.current;
      const tm = targetMouseRef.current;

      // Update smooth mouse lerp when mouse reactivity is enabled
      if (!reduce && !touchOnly) {
        if (tm.inside) {
          if (sm.presence <= 0.01) {
            sm.x = tm.x;
            sm.y = tm.y;
          } else {
            sm.x += (tm.x - sm.x) * CURSOR_LERP;
            sm.y += (tm.y - sm.y) * CURSOR_LERP;
          }
          sm.presence += (1 - sm.presence) * 0.12;
        } else {
          sm.presence += (0 - sm.presence) * 0.1;
        }
      } else {
        sm.presence = 0;
      }

      const hasCursor = sm.presence > 0.01;

      // 1. Update positions (wrap around opposite edge)
      if (shouldDrift) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x += width;
          else if (p.x > width) p.x -= width;

          if (p.y < 0) p.y += height;
          else if (p.y > height) p.y -= height;
        }
      }

      // Precompute cursor proximity factor [0..1] for each particle
      const cursorFactors = new Float32Array(particles.length);
      if (hasCursor) {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]!;
          const dx = p.x - sm.x;
          const dy = p.y - sm.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CURSOR_RADIUS) {
            cursorFactors[i] = (1 - dist / CURSOR_RADIUS) * sm.presence;
          }
        }
      }

      // 2. Draw dot-to-dot proximity lines
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]!;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist < linkDist) {
            const distRatio = 1 - dist / linkDist;
            // Ambient line opacity ~8-15% cap
            const baseLineAlpha = 0.14 * distRatio;
            const pairBoost = Math.max(cursorFactors[i] ?? 0, cursorFactors[j] ?? 0);

            if (pairBoost > 0.02) {
              const r = mixChannel(SAND_RGB[0], CORAL_RGB[0], pairBoost);
              const g = mixChannel(SAND_RGB[1], CORAL_RGB[1], pairBoost);
              const bl = mixChannel(SAND_RGB[2], CORAL_RGB[2], pairBoost);
              const alpha = Math.min(0.52, baseLineAlpha + pairBoost * 0.36 * distRatio);
              ctx.strokeStyle = `rgba(${r}, ${g}, ${bl}, ${alpha.toFixed(3)})`;
            } else {
              ctx.strokeStyle = `rgba(${SAND_RGB[0]}, ${SAND_RGB[1]}, ${SAND_RGB[2]}, ${baseLineAlpha.toFixed(3)})`;
            }

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // 3. Draw cursor-to-dot constellation lines (coral-red, up to ~40-60% opacity)
      if (hasCursor) {
        for (let i = 0; i < particles.length; i++) {
          const cf = cursorFactors[i] ?? 0;
          if (cf > 0.02) {
            const p = particles[i]!;
            const alpha = Math.min(0.55, cf * 0.52);
            ctx.strokeStyle = `rgba(${CORAL_RGB[0]}, ${CORAL_RGB[1]}, ${CORAL_RGB[2]}, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(sm.x, sm.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
      }

      // 4. Draw dots
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!;
        const cf = cursorFactors[i] ?? 0;

        const radius = p.baseRadius * (1 + cf * 0.45); // ~1.3–1.5x scale near cursor
        const alpha = Math.min(0.6, p.baseAlpha + cf * 0.38);

        if (cf > 0.02) {
          const r = mixChannel(SAND_RGB[0], CORAL_RGB[0], cf);
          const g = mixChannel(SAND_RGB[1], CORAL_RGB[1], cf);
          const bl = mixChannel(SAND_RGB[2], CORAL_RGB[2], cf);
          ctx.fillStyle = `rgba(${r}, ${g}, ${bl}, ${alpha.toFixed(3)})`;
        } else {
          ctx.fillStyle = `rgba(${SAND_RGB[0]}, ${SAND_RGB[1]}, ${SAND_RGB[2]}, ${p.baseAlpha.toFixed(3)})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Reduced motion: render a single static constellation frame (no drift, no mouse reactivity)
    if (reduce) {
      drawFrame(false);
      const onResizeStatic = () => {
        syncSize();
        drawFrame(false);
      };
      window.addEventListener("resize", onResizeStatic);
      return () => {
        window.removeEventListener("resize", onResizeStatic);
      };
    }

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = container.getBoundingClientRect();
      targetMouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        inside: true,
      };
    };

    const handlePointerLeave = () => {
      targetMouseRef.current.inside = false;
    };

    if (!touchOnly) {
      container.addEventListener("pointermove", handlePointerMove, { passive: true });
      container.addEventListener("pointerleave", handlePointerLeave, { passive: true });
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        syncSize();
      });
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", syncSize);
    }

    const tick = () => {
      drawFrame(true);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (!touchOnly) {
        container.removeEventListener("pointermove", handlePointerMove);
        container.removeEventListener("pointerleave", handlePointerLeave);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", syncSize);
      }
    };
  }, [active, reduce, variant]);

  return (
    <canvas
      ref={canvasRef}
      data-constellation-canvas={variant}
      data-constellation-active={active ? "true" : "false"}
      data-constellation-static={reduce ? "true" : "false"}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0"
      } ${className}`}
    />
  );
}

