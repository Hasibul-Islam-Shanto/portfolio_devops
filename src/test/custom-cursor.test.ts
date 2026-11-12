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

  it("keeps the ring snapped without trailing lag and skips ripple under prefers-reduced-motion", async () => {
    mockMatchMedia("prefers-reduced-motion");
    const body = await setup();
    const dot = body.querySelector(".cursor-dot")!;
    const ring = body.querySelector(".cursor-ring")!;
    expect(dot).not.toBeNull();
    expect(ring).not.toBeNull();

    mouse("mousemove", window, { clientX: 150, clientY: 250 });
    expect((dot.parentElement as HTMLElement).style.transform).toBe("translate3d(150px, 250px, 0)");
    expect((ring.parentElement as HTMLElement).style.transform).toBe("translate3d(150px, 250px, 0)");

    const cta = body.querySelector("a")!;
    mouse("mousedown", cta, { button: 0 });
    expect(body.querySelector(".cursor-cta-ripple")).toBeNull();
  });

  it("handles event delegation and does not flicker when moving over child elements", async () => {
    const body = mount("custom-cursor");
    body.insertAdjacentHTML(
      "beforeend",
      '<button id="test-btn" data-cursor-label="CLICK"><span id="btn-icon">★</span><span id="btn-text">Action</span></button>',
    );
    track(initCustomCursor());

    const btn = body.querySelector<HTMLButtonElement>("#test-btn")!;
    const icon = body.querySelector<HTMLElement>("#btn-icon")!;
    const ring = body.querySelector(".cursor-ring")!;
    const label = body.querySelector(".cursor-ring-label")!;

    // Mouse over the button
    mouse("mouseover", btn, { relatedTarget: document.body });
    expect(ring).toHaveClass("is-hovered");
    expect(ring).toHaveClass("has-label");
    expect(label.textContent).toBe("CLICK");

    // Mouse moving from button to internal child icon
    mouse("mouseout", btn, { relatedTarget: icon });
    expect(ring).toHaveClass("is-hovered");
    expect(label.textContent).toBe("CLICK");

    mouse("mouseover", icon, { relatedTarget: btn });
    expect(ring).toHaveClass("is-hovered");
    expect(label.textContent).toBe("CLICK");

    // Mouse moving from child icon to non-interactive background
    mouse("mouseout", icon, { relatedTarget: body });
    expect(ring).not.toHaveClass("is-hovered");
    expect(ring).not.toHaveClass("has-label");
    expect(label.textContent).toBe("");
  });

  it("transitions cleanly between multiple interactive elements with no stuck label text", async () => {
    const body = mount("custom-cursor");
    body.insertAdjacentHTML(
      "beforeend",
      `
      <nav>
        <a id="nav-work" href="#work">Work</a>
        <a id="hire-btn" href="#contact" data-cursor-cta="true" data-cursor-label="HIRE">Hire me</a>
        <a id="social-link" href="https://linkedin.com" target="_blank">LinkedIn</a>
        <button id="theme-btn" type="button">Theme</button>
      </nav>
      `,
    );
    track(initCustomCursor());

    const navWork = body.querySelector<HTMLAnchorElement>("#nav-work")!;
    const hireBtn = body.querySelector<HTMLAnchorElement>("#hire-btn")!;
    const socialLink = body.querySelector<HTMLAnchorElement>("#social-link")!;
    const themeBtn = body.querySelector<HTMLButtonElement>("#theme-btn")!;
    const ring = body.querySelector(".cursor-ring")!;
    const label = body.querySelector(".cursor-ring-label")!;

    // 1. Hover "Hire me" (has custom label "HIRE")
    mouse("mouseover", hireBtn, { relatedTarget: document.body });
    expect(ring).toHaveClass("is-hovered");
    expect(ring).toHaveClass("has-label");
    expect(label.textContent).toBe("HIRE");

    // 2. Move directly from "Hire me" to social link (target="_blank" shows "↗")
    mouse("mouseout", hireBtn, { relatedTarget: socialLink });
    mouse("mouseover", socialLink, { relatedTarget: hireBtn });
    expect(ring).toHaveClass("is-hovered");
    expect(ring).toHaveClass("has-label");
    expect(label.textContent).toBe("↗");

    // 3. Move directly from social link to theme toggle (button with NO label)
    mouse("mouseout", socialLink, { relatedTarget: themeBtn });
    mouse("mouseover", themeBtn, { relatedTarget: socialLink });
    expect(ring).toHaveClass("is-hovered");
    expect(ring).not.toHaveClass("has-label");
    expect(label.textContent).toBe("");

    // 4. Move directly from theme toggle to nav link (nav link with NO label)
    mouse("mouseout", themeBtn, { relatedTarget: navWork });
    mouse("mouseover", navWork, { relatedTarget: themeBtn });
    expect(ring).toHaveClass("is-hovered");
    expect(ring).not.toHaveClass("has-label");
    expect(label.textContent).toBe("");

    // 5. Move off nav link into empty page
    mouse("mouseout", navWork, { relatedTarget: body });
    expect(ring).not.toHaveClass("is-hovered");
    expect(ring).not.toHaveClass("has-label");
    expect(label.textContent).toBe("");
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
