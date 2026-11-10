import { useEffect, useRef, useState } from "react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, summary, [data-cursor-interactive], [data-cursor-label], [data-cursor-cta]';

/**
 * Two-part custom animated cursor system:
 * 1. Solid 8px coral-red (#E8503A) dot tracking mouse position with near-zero lag.
 * 2. Soft 36px (56px on hover) coral-red glowing ring trailing via requestAnimationFrame lerp,
 *    morphing to display a warm-sand (#EFE6D8) label on primary interactive targets,
 *    with a 100ms squeeze on mouse-down, ease-out-back rebound on mouse-up, and
 *    a 400ms coral-red expanding ripple on primary CTA clicks.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [pressed, setPressed] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const dotOuterRef = useRef<HTMLDivElement>(null);
  const ringOuterRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const hasMoved = useRef(false);
  const rafId = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  const pressStartTime = useRef<number>(0);
  const releaseTimeoutRef = useRef<number>(0);
  const rippleIdRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const coarseQuery = window.matchMedia("(pointer: coarse), (hover: none)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateCapabilities = () => {
      const isCoarse = coarseQuery.matches;
      setEnabled(!isCoarse);
      setReducedMotion(motionQuery.matches);
    };

    updateCapabilities();

    const onTouchStart = () => {
      setEnabled(false);
    };

    coarseQuery.addEventListener("change", updateCapabilities);
    motionQuery.addEventListener("change", updateCapabilities);
    window.addEventListener("touchstart", onTouchStart, { passive: true });

    return () => {
      coarseQuery.removeEventListener("change", updateCapabilities);
      motionQuery.removeEventListener("change", updateCapabilities);
      window.removeEventListener("touchstart", onTouchStart);
    };
  }, []);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") {
      document.documentElement.classList.remove("has-custom-cursor");
      return;
    }

    document.documentElement.classList.add("has-custom-cursor");

    const evaluateTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        setHovered(false);
        setLabel(null);
        return;
      }
      const interactive = target.closest(INTERACTIVE_SELECTOR);
      if (interactive) {
        setHovered(true);
        const explicitLabel = interactive.getAttribute("data-cursor-label");
        if (explicitLabel) {
          setLabel(explicitLabel);
        } else if (interactive instanceof HTMLAnchorElement && interactive.target === "_blank") {
          setLabel("↗");
        } else {
          setLabel(null);
        }
      } else {
        setHovered(false);
        setLabel(null);
      }
    };

    const tick = (now: number) => {
      const dt = lastFrameTime.current ? Math.min(now - lastFrameTime.current, 64) : 16.67;
      lastFrameTime.current = now;

      // Frame-rate independent lerp (~0.18 per 60Hz frame)
      const alpha = 1 - Math.pow(1 - 0.18, dt / 16.67);
      const dx = mousePos.current.x - ringPos.current.x;
      const dy = mousePos.current.y - ringPos.current.y;

      ringPos.current.x += dx * alpha;
      ringPos.current.y += dy * alpha;

      if (ringOuterRef.current) {
        ringOuterRef.current.style.transform = `translate3d(${ringPos.current.x.toFixed(2)}px, ${ringPos.current.y.toFixed(2)}px, 0)`;
      }

      if (Math.hypot(dx, dy) > 0.15) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        ringPos.current.x = mousePos.current.x;
        ringPos.current.y = mousePos.current.y;
        if (ringOuterRef.current) {
          ringOuterRef.current.style.transform = `translate3d(${ringPos.current.x.toFixed(2)}px, ${ringPos.current.y.toFixed(2)}px, 0)`;
        }
        rafId.current = 0;
        lastFrameTime.current = 0;
      }
    };

    const startRingLoop = () => {
      if (reducedMotion) return;
      if (!rafId.current) {
        lastFrameTime.current = 0;
        rafId.current = requestAnimationFrame(tick);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      mousePos.current.x = x;
      mousePos.current.y = y;

      if (!hasMoved.current) {
        hasMoved.current = true;
        ringPos.current.x = x;
        ringPos.current.y = y;
        if (ringOuterRef.current) {
          ringOuterRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
        setVisible(true);
      } else if (!visible) {
        setVisible(true);
      }

      if (dotOuterRef.current) {
        dotOuterRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }

      evaluateTarget(e.target);
      startRingLoop();
    };

    let scrollRaf = 0;
    const onScroll = () => {
      if (!hasMoved.current || scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        const el = document.elementFromPoint(mousePos.current.x, mousePos.current.y);
        evaluateTarget(el);
      });
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      if (releaseTimeoutRef.current) {
        window.clearTimeout(releaseTimeoutRef.current);
        releaseTimeoutRef.current = 0;
      }
      pressStartTime.current = performance.now();
      setPressed(true);

      const target = e.target instanceof Element ? e.target : null;
      const cta = target?.closest("[data-cursor-cta]");
      if (cta && !reducedMotion) {
        const id = ++rippleIdRef.current;
        const x = e.clientX;
        const y = e.clientY;
        setRipples((prev) => [...prev, { id, x, y }]);
        window.setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 420);
      }
    };

    const onMouseUp = () => {
      const elapsed = performance.now() - pressStartTime.current;
      const remaining = Math.max(0, 100 - elapsed);
      if (releaseTimeoutRef.current) {
        window.clearTimeout(releaseTimeoutRef.current);
      }
      releaseTimeoutRef.current = window.setTimeout(() => {
        setPressed(false);
        releaseTimeoutRef.current = 0;
      }, remaining);
    };

    const onMouseLeaveDoc = () => {
      setVisible(false);
      setPressed(false);
    };

    const onMouseEnterDoc = () => {
      if (hasMoved.current) setVisible(true);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeaveDoc);
    document.documentElement.addEventListener("mouseenter", onMouseEnterDoc);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.documentElement.removeEventListener("mouseleave", onMouseLeaveDoc);
      document.documentElement.removeEventListener("mouseenter", onMouseEnterDoc);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
      if (scrollRaf) {
        cancelAnimationFrame(scrollRaf);
      }
      if (releaseTimeoutRef.current) {
        window.clearTimeout(releaseTimeoutRef.current);
      }
    };
  }, [enabled, reducedMotion, visible]);

  if (!enabled) return null;

  const hasLabel = Boolean(label) && hovered;

  return (
    <div
      className="custom-cursor-layer pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      aria-hidden="true"
    >
      {/* Expanding coral-red click ripples on primary CTA buttons */}
      {!reducedMotion &&
        ripples.map((r) => (
          <div
            key={r.id}
            className=" fixed left-0 top-0 pointer-events-none"
            style={{
              transform: `translate3d(${r.x}px, ${r.y}px, 0)`,
            }}
          >
            <span className="cursor-round cursor-cta-ripple block" />
          </div>
        ))}

      {/* Soft trailing coral-red ring / glow (skipped when prefers-reduced-motion is enabled) */}
      {!reducedMotion && (
        <div
          ref={ringOuterRef}
          className="fixed left-0 top-0 pointer-events-none will-change-transform"
          style={{
            transform: "translate3d(-100px, -100px, 0)",
          }}
        >
          <div
            className={[
              "cursor-round cursor-ring flex items-center justify-center",
              visible ? "is-visible" : "",
              hovered ? "is-hovered" : "",
              hasLabel ? "has-label" : "",
              pressed ? "is-pressed" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span
              className={`cursor-ring-label font-mono text-[9px] font-bold uppercase tracking-wider select-none ${
                hasLabel ? "is-shown" : ""
              }`}
            >
              {label}
            </span>
          </div>
        </div>
      )}

      {/* Precise 8px solid coral-red dot */}
      <div
        ref={dotOuterRef}
        className="fixed left-0 top-0 pointer-events-none will-change-transform"
        style={{
          transform: "translate3d(-100px, -100px, 0)",
        }}
      >
        <div
          className={[
            "cursor-round cursor-dot",
            visible ? "is-visible" : "",
            hovered ? "is-hovered" : "",
            hasLabel && !reducedMotion ? "has-label" : "",
            pressed && !reducedMotion ? "is-pressed" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
    </div>
  );
}
