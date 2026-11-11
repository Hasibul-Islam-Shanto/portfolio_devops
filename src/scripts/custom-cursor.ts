import { createCleanup, isTouchOnlyDevice, prefersReducedMotion } from "./util";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, summary, [data-cursor-interactive], [data-cursor-label], [data-cursor-cta]';

/**
 * Custom cursor: 8px dot + trailing 36px ring (56px on interactive targets, with optional label),
 * 100ms minimum squeeze on mouse-down and a 400ms ripple on `[data-cursor-cta]` clicks.
 * Disabled on touch/coarse pointers; the trailing ring and ripple are skipped under reduced motion.
 * Returns a cleanup that removes every listener, timer and animation frame.
 */
export function initCustomCursor(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const layer = root.querySelector<HTMLElement>(".custom-cursor-layer");
  if (!layer) return () => {};

  const cleanup = createCleanup();
  const html = document.documentElement;
  const dotOuter = layer.querySelector<HTMLElement>("[data-cursor-dot-outer]");
  const ringOuter = layer.querySelector<HTMLElement>("[data-cursor-ring-outer]");
  const dot = layer.querySelector<HTMLElement>(".cursor-dot");
  const ring = layer.querySelector<HTMLElement>(".cursor-ring");
  const label = layer.querySelector<HTMLElement>(".cursor-ring-label");
  const rippleHost = layer.querySelector<HTMLElement>("[data-cursor-ripples]");

  const reduced = prefersReducedMotion();
  const disabled = isTouchOnlyDevice();

  const disable = () => {
    html.classList.remove("has-custom-cursor");
    layer.remove();
  };

  if (disabled) {
    disable();
    return () => {};
  }
  if (reduced) ring?.parentElement?.remove();

  html.classList.add("has-custom-cursor");

  const mouse = { x: -100, y: -100 };
  const ringPos = { x: -100, y: -100 };
  let hasMoved = false;
  let visible = false;
  let raf = 0;
  let lastFrame = 0;
  let pressStart = 0;
  let releaseTimeout = 0;
  let idleTimeout = 0;
  let scrollRaf = 0;
  const timeouts = new Set<number>();

  const toggle = (el: Element | null | undefined, cls: string, on: boolean) =>
    el?.classList.toggle(cls, on);

  const setVisible = (on: boolean) => {
    visible = on;
    toggle(dot, "is-visible", on);
    toggle(ring, "is-visible", on);
  };

  const setPressed = (on: boolean) => {
    toggle(dot, "is-pressed", on && !reduced);
    toggle(ring, "is-pressed", on);
  };

  const setTarget = (hovered: boolean, inverted: boolean, text: string | null) => {
    const hasLabel = Boolean(text) && hovered;
    toggle(dot, "is-hovered", hovered);
    toggle(ring, "is-hovered", hovered);
    toggle(dot, "is-inverted", inverted);
    toggle(ring, "is-inverted", inverted);
    toggle(ring, "has-label", hasLabel);
    toggle(dot, "has-label", hasLabel && !reduced);
    if (label) {
      label.textContent = text ?? "";
      label.classList.toggle("is-shown", hasLabel);
    }
  };

  const evaluateTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return setTarget(false, false, null);
    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (!interactive) return setTarget(false, false, null);
    const inverted = Boolean(interactive.closest("[data-cursor-invert]"));
    const explicit = interactive.getAttribute("data-cursor-label");
    if (explicit) return setTarget(true, inverted, explicit);
    if (interactive instanceof HTMLAnchorElement && interactive.target === "_blank") {
      return setTarget(true, inverted, "↗");
    }
    setTarget(true, inverted, null);
  };

  const place = (el: HTMLElement | null | undefined, x: number, y: number) => {
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const tick = (now: number) => {
    const dt = lastFrame ? Math.min(now - lastFrame, 64) : 16.67;
    lastFrame = now;
    // Frame-rate independent lerp (~0.18 per 60Hz frame)
    const alpha = 1 - Math.pow(1 - 0.18, dt / 16.67);
    const dx = mouse.x - ringPos.x;
    const dy = mouse.y - ringPos.y;
    ringPos.x += dx * alpha;
    ringPos.y += dy * alpha;
    place(ringOuter, Number(ringPos.x.toFixed(2)), Number(ringPos.y.toFixed(2)));
    if (Math.hypot(dx, dy) > 0.15) {
      raf = requestAnimationFrame(tick);
    } else {
      ringPos.x = mouse.x;
      ringPos.y = mouse.y;
      place(ringOuter, ringPos.x, ringPos.y);
      raf = 0;
      lastFrame = 0;
    }
  };

  const startRing = () => {
    if (reduced || !ringOuter || raf) return;
    lastFrame = 0;
    raf = requestAnimationFrame(tick);
  };

  const onMouseMove = (e: MouseEvent) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!hasMoved) {
      hasMoved = true;
      ringPos.x = e.clientX;
      ringPos.y = e.clientY;
      place(ringOuter, e.clientX, e.clientY);
    }
    if (!visible) setVisible(true);
    place(dotOuter, e.clientX, e.clientY);
    window.clearTimeout(idleTimeout);
    idleTimeout = window.setTimeout(() => setVisible(false), 600);
    evaluateTarget(e.target);
    startRing();
  };

  const onScroll = () => {
    if (!hasMoved || scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      evaluateTarget(document.elementFromPoint(mouse.x, mouse.y));
    });
  };

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    window.clearTimeout(releaseTimeout);
    pressStart = performance.now();
    setPressed(true);
    const target = e.target instanceof Element ? e.target : null;
    if (target?.closest("[data-cursor-cta]") && !reduced && rippleHost) {
      const ripple = document.createElement("div");
      ripple.className = "fixed left-0 top-0 pointer-events-none";
      ripple.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      ripple.innerHTML = '<span class="cursor-round cursor-cta-ripple block"></span>';
      rippleHost.appendChild(ripple);
      const id = window.setTimeout(() => {
        ripple.remove();
        timeouts.delete(id);
      }, 420);
      timeouts.add(id);
    }
  };

  const onMouseUp = () => {
    const remaining = Math.max(0, 100 - (performance.now() - pressStart));
    window.clearTimeout(releaseTimeout);
    releaseTimeout = window.setTimeout(() => setPressed(false), remaining);
  };

  const onLeave = () => {
    window.clearTimeout(idleTimeout);
    setVisible(false);
    setPressed(false);
  };
  const onMouseOut = (e: MouseEvent) => {
    if (!e.relatedTarget) onLeave();
  };
  const onVisibility = () => {
    if (document.visibilityState !== "visible") onLeave();
  };
  const onTouchStart = () => {
    cleanup.run();
    disable();
  };

  const listen = <T extends EventTarget>(
    target: T,
    type: string,
    fn: EventListener,
    options?: AddEventListenerOptions,
  ) => {
    target.addEventListener(type, fn, options);
    cleanup.add(() => target.removeEventListener(type, fn, options));
  };

  listen(window, "mousemove", onMouseMove as EventListener, { passive: true });
  listen(window, "scroll", onScroll, { passive: true });
  listen(window, "mousedown", onMouseDown as EventListener, { passive: true });
  listen(window, "mouseup", onMouseUp, { passive: true });
  listen(window, "mouseout", onMouseOut as EventListener, { passive: true });
  listen(window, "blur", onLeave);
  listen(window, "keydown", onLeave, { passive: true });
  listen(window, "touchstart", onTouchStart, { passive: true });
  listen(document, "visibilitychange", onVisibility);
  listen(document.documentElement, "mouseleave", onLeave);
  listen(document.documentElement, "pointerleave", onLeave);

  cleanup.add(() => {
    html.classList.remove("has-custom-cursor");
    if (raf) cancelAnimationFrame(raf);
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    window.clearTimeout(releaseTimeout);
    window.clearTimeout(idleTimeout);
    timeouts.forEach((id) => window.clearTimeout(id));
    timeouts.clear();
  });

  return () => cleanup.run();
}
