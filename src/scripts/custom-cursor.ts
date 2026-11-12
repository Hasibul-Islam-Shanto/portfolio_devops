import { createCleanup, isTouchOnlyDevice, prefersReducedMotion } from "./util";

const INTERACTIVE_SELECTOR =
  'a, button, [data-cursor-hover], [role="button"], input, textarea, select, summary, [data-cursor-interactive], [data-cursor-label], [data-cursor-cta]';

export function initCustomCursor(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const layer = root.querySelector<HTMLElement>(".custom-cursor-layer");
  if (!layer) return () => {};

  const cleanup = createCleanup();
  const html = document.documentElement;
  const doc = root instanceof Document ? root : root.ownerDocument || document;
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

  html.classList.add("has-custom-cursor");

  let mouseX = -100;
  let mouseY = -100;
  let dotX = -100;
  let dotY = -100;
  let ringX = -100;
  let ringY = -100;
  let hasMoved = false;
  let visible = false;
  let rafId = 0;
  let isLoopRunning = false;
  let pressStart = 0;
  let releaseTimeout = 0;
  const timeouts = new Set<number>();

  let currentInteractive: HTMLElement | null = null;

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

  const place = (el: HTMLElement | null | undefined, x: number, y: number) => {
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
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
      label.textContent = hovered && text ? text : "";
      label.classList.toggle("is-shown", hasLabel);
    }
  };

  const clearHover = () => {
    currentInteractive = null;
    setTarget(false, false, null);
  };

  const applyHover = (interactive: HTMLElement) => {
    currentInteractive = interactive;
    void interactive.getBoundingClientRect();
    const inverted = Boolean(interactive.closest("[data-cursor-invert]"));
    const explicit = interactive.getAttribute("data-cursor-label");
    const text =
      explicit ??
      (interactive instanceof HTMLAnchorElement && interactive.target === "_blank" ? "↗" : null);
    setTarget(true, inverted, text);
  };

  const tick = () => {
    if (!isLoopRunning) return;

    if (hasMoved) {
      dotX = mouseX;
      dotY = mouseY;
      place(dotOuter, dotX, dotY);

      if (reduced) {
        ringX = dotX;
        ringY = dotY;
      } else {
        ringX += (dotX - ringX) * 0.15;
        ringY += (dotY - ringY) * 0.15;
      }
      place(ringOuter, Number(ringX.toFixed(2)), Number(ringY.toFixed(2)));
    }

    rafId = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (isLoopRunning) return;
    isLoopRunning = true;
    rafId = requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    isLoopRunning = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!hasMoved) {
      hasMoved = true;
      dotX = mouseX;
      dotY = mouseY;
      ringX = mouseX;
      ringY = mouseY;
      place(dotOuter, dotX, dotY);
      place(ringOuter, ringX, ringY);
    }

    if (!visible) setVisible(true);
    startLoop();

    // Fallback sync for synthetic events or fast moves if mouseover was bypassed
    const target = e.target instanceof Element ? e.target : null;
    if (target) {
      const interactive = target.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
      if (interactive !== currentInteractive) {
        if (interactive) {
          applyHover(interactive);
        } else {
          clearHover();
        }
      }
    }
  };

  const onMouseOver = (e: MouseEvent) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const interactive = target.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
    if (!interactive) return;

    if (interactive === currentInteractive) return;
    applyHover(interactive);
  };

  const onMouseOut = (e: MouseEvent) => {
    if (!currentInteractive) {
      if (!e.relatedTarget) onLeave();
      return;
    }

    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const interactive = target.closest(INTERACTIVE_SELECTOR);
    if (interactive !== currentInteractive) {
      if (!e.relatedTarget) onLeave();
      return;
    }

    // Check if the relatedTarget is still within the same interactive element
    const related = e.relatedTarget instanceof Element ? e.relatedTarget : null;
    if (related && related.closest(INTERACTIVE_SELECTOR) === currentInteractive) {
      return;
    }

    clearHover();

    if (!e.relatedTarget) {
      onLeave();
    }
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
    setVisible(false);
    setPressed(false);
    clearHover();
    stopLoop();
  };

  const onVisibility = () => {
    if (doc.visibilityState !== "visible") {
      onLeave();
    }
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
  listen(doc, "mouseover", onMouseOver as EventListener, { passive: true });
  listen(doc, "mouseout", onMouseOut as EventListener, { passive: true });
  listen(window, "mousedown", onMouseDown as EventListener, { passive: true });
  listen(window, "mouseup", onMouseUp, { passive: true });
  listen(window, "blur", onLeave);
  listen(window, "touchstart", onTouchStart, { passive: true });
  listen(doc, "visibilitychange", onVisibility);
  listen(html, "mouseleave", onLeave);
  listen(html, "pointerleave", onLeave);

  cleanup.add(() => {
    html.classList.remove("has-custom-cursor");
    stopLoop();
    window.clearTimeout(releaseTimeout);
    timeouts.forEach((id) => window.clearTimeout(id));
    timeouts.clear();
  });

  return () => cleanup.run();
}
