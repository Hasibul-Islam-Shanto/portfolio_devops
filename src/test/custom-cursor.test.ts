import { describe, expect, it, vi } from "vitest";
import { initCustomCursor } from "@/scripts/custom-cursor";
import { mockMatchMedia, mount, track } from "./helpers";

const mouse = (type: string, target: EventTarget, init: MouseEventInit = {}) =>
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, ...init }));

async function setup(withCta = true) {
  const body = mount("custom-cursor");
  if (withCta) {
    body.insertAdjacentHTML(
      "beforeend",
      '<a href="#test" data-cursor-cta="true" data-cursor-label="WORK ↓">View the work →</a>',
    );
  }
  track(initCustomCursor());
  return body;
}

describe("custom cursor", () => {
  it("tracks the mouse with the dot and ring via translate3d on fine pointers", async () => {
    const body = await setup();
    const dot = body.querySelector(".cursor-dot")!;
    const ring = body.querySelector(".cursor-ring")!;
    expect(document.documentElement).toHaveClass("has-custom-cursor");

    mouse("mousemove", window, { clientX: 120, clientY: 240 });

    expect(dot).toHaveClass("is-visible");
    expect(ring).toHaveClass("is-visible");
    expect((dot.parentElement as HTMLElement).style.transform).toBe("translate3d(120px, 240px, 0)");
  });

  it("expands the ring with a label over a CTA, squeezes on press and ripples on click", async () => {
    vi.useFakeTimers();
    try {
      const body = await setup();
      const cta = body.querySelector("a")!;
      const ring = body.querySelector(".cursor-ring")!;
      const dot = body.querySelector(".cursor-dot")!;

      mouse("mousemove", cta, { clientX: 200, clientY: 300 });
      expect(ring).toHaveClass("is-hovered");
      expect(ring).toHaveClass("has-label");
      expect(body.querySelector(".cursor-ring-label")?.textContent).toBe("WORK ↓");

      mouse("mousedown", cta, { button: 0, clientX: 200, clientY: 300 });
      expect(ring).toHaveClass("is-pressed");
      expect(dot).toHaveClass("is-pressed");
      expect(body.querySelector(".cursor-cta-ripple")).not.toBeNull();

      mouse("mouseup", cta, { button: 0 });
      vi.advanceTimersByTime(150);
      expect(ring).not.toHaveClass("is-pressed");
      expect(dot).not.toHaveClass("is-pressed");

      vi.advanceTimersByTime(350);
      expect(body.querySelector(".cursor-cta-ripple")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("holds the squeeze for at least 100ms even on a quick click", async () => {
    vi.useFakeTimers();
    try {
      const body = await setup();
      const ring = body.querySelector(".cursor-ring")!;
      mouse("mousedown", window, { button: 0 });
      mouse("mouseup", window, { button: 0 });
      vi.advanceTimersByTime(60);
      expect(ring).toHaveClass("is-pressed");
      vi.advanceTimersByTime(60);
      expect(ring).not.toHaveClass("is-pressed");
    } finally {
      vi.useRealTimers();
    }
  });

  it("removes the cursor and the root class when a touch event occurs", async () => {
    const body = await setup();
    expect(body.querySelector(".custom-cursor-layer")).not.toBeNull();

    window.dispatchEvent(new Event("touchstart"));

    expect(body.querySelector(".custom-cursor-layer")).toBeNull();
    expect(document.documentElement).not.toHaveClass("has-custom-cursor");
  });

  it("is never enabled on coarse-pointer / no-hover devices", async () => {
    mockMatchMedia("pointer: coarse");
    const body = await setup(false);
    expect(body.querySelector(".custom-cursor-layer")).toBeNull();
    expect(document.documentElement).not.toHaveClass("has-custom-cursor");
  });

  it("skips the trailing ring and ripple under prefers-reduced-motion", async () => {
    mockMatchMedia("prefers-reduced-motion");
    const body = await setup();
    expect(body.querySelector(".cursor-dot")).not.toBeNull();
    expect(body.querySelector(".cursor-ring")).toBeNull();

    const cta = body.querySelector("a")!;
    mouse("mousedown", cta, { button: 0 });
    expect(body.querySelector(".cursor-cta-ripple")).toBeNull();
  });

  it("removes all listeners and the root class on cleanup", async () => {
    const body = mount("custom-cursor");
    const cleanup = initCustomCursor();
    cleanup();
    expect(document.documentElement).not.toHaveClass("has-custom-cursor");

    mouse("mousemove", window, { clientX: 5, clientY: 5 });
    expect(body.querySelector(".cursor-dot")).not.toHaveClass("is-visible");
  });
});
