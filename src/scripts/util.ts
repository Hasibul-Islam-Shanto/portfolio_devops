export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function isTouchOnlyDevice(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse), (hover: none)").matches
  );
}

/** Collects teardown callbacks so each init function can return a single cleanup. */
export function createCleanup() {
  const fns: Array<() => void> = [];
  return {
    add(fn: () => void) {
      fns.push(fn);
    },
    run() {
      while (fns.length) fns.pop()?.();
    },
  };
}

/**
 * Types `text` into `el` once `start()` is called. Reduced motion shows the text instantly.
 * Resolves `onDone` after the last character.
 */
export function typeInto(
  el: HTMLElement,
  text: string,
  speed: number,
  reduce: boolean,
  onDone?: () => void,
): () => void {
  if (reduce) {
    el.textContent = text;
    onDone?.();
    return () => {};
  }
  el.textContent = "";
  let i = 0;
  const id = window.setInterval(() => {
    i++;
    el.textContent = text.slice(0, i);
    if (i >= text.length) {
      window.clearInterval(id);
      onDone?.();
    }
  }, speed);
  return () => window.clearInterval(id);
}

/** Critically-tuned damped spring matching framer-motion's useSpring(stiffness, damping), mass 1. */
export function createSpring(
  stiffness: number,
  damping: number,
  onUpdate: (value: number) => void,
  initial = 0,
) {
  let value = initial;
  let velocity = 0;
  let target = initial;
  let frame = 0;
  let last = 0;

  const step = (now: number) => {
    const dt = Math.min((now - (last || now)) / 1000, 0.05);
    last = now;
    const force = -stiffness * (value - target) - damping * velocity;
    velocity += force * dt;
    value += velocity * dt;
    onUpdate(value);
    if (Math.abs(value - target) < 0.0005 && Math.abs(velocity) < 0.0005) {
      value = target;
      velocity = 0;
      onUpdate(value);
      frame = 0;
      last = 0;
      return;
    }
    frame = requestAnimationFrame(step);
  };

  return {
    set(next: number, immediate = false) {
      target = next;
      if (immediate) {
        value = next;
        velocity = 0;
        onUpdate(value);
        return;
      }
      if (!frame) frame = requestAnimationFrame(step);
    },
    destroy() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}
