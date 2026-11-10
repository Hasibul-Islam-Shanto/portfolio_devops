import { act, fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CustomCursor } from "@/components/portfolio/CustomCursor";

describe("CustomCursor", () => {
  it("renders both dot and trailing ring on fine pointer devices and tracks mouse movement via translate3d", () => {
    const { container } = render(
      <div>
        <CustomCursor />
        <a href="#test" data-cursor-cta="true" data-cursor-label="WORK ↓">
          View the work →
        </a>
      </div>,
    );

    const dot = container.querySelector(".cursor-dot");
    const ring = container.querySelector(".cursor-ring");
    expect(dot).not.toBeNull();
    expect(ring).not.toBeNull();

    act(() => {
      fireEvent.mouseMove(window, { clientX: 120, clientY: 240 });
    });

    expect(dot).toHaveClass("is-visible");
    expect(ring).toHaveClass("is-visible");
    expect((dot?.parentElement as HTMLElement)?.style.transform).toBe(
      "translate3d(120px, 240px, 0)",
    );
  });

  it("expands ring and displays label on hover over labelled CTA, and spawns coral ripple on click", () => {
    vi.useFakeTimers();
    const { container, getByText } = render(
      <div>
        <CustomCursor />
        <a href="#test" data-cursor-cta="true" data-cursor-label="WORK ↓">
          View the work →
        </a>
      </div>,
    );

    const cta = getByText("View the work →");
    const ring = container.querySelector(".cursor-ring");
    const dot = container.querySelector(".cursor-dot");

    act(() => {
      fireEvent.mouseMove(cta, { clientX: 200, clientY: 300 });
    });

    expect(ring).toHaveClass("is-hovered");
    expect(ring).toHaveClass("has-label");
    expect(container.querySelector(".cursor-ring-label")?.textContent).toBe("WORK ↓");

    act(() => {
      fireEvent.mouseDown(cta, { button: 0, clientX: 200, clientY: 300 });
    });

    expect(ring).toHaveClass("is-pressed");
    expect(dot).toHaveClass("is-pressed");
    expect(container.querySelector(".cursor-cta-ripple")).not.toBeNull();

    act(() => {
      fireEvent.mouseUp(cta, { button: 0 });
      vi.advanceTimersByTime(150);
    });

    expect(ring).not.toHaveClass("is-pressed");
    expect(dot).not.toHaveClass("is-pressed");

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(container.querySelector(".cursor-cta-ripple")).toBeNull();
    vi.useRealTimers();
  });

  it("hides custom cursor when a touch event occurs", () => {
    const { container } = render(<CustomCursor />);
    expect(container.querySelector(".custom-cursor-layer")).not.toBeNull();

    act(() => {
      fireEvent.touchStart(window);
    });

    expect(container.querySelector(".custom-cursor-layer")).toBeNull();
  });

  it("skips trailing ring and ripple when prefers-reduced-motion is enabled", () => {
    const origMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });

    const { container } = render(<CustomCursor />);
    expect(container.querySelector(".cursor-dot")).not.toBeNull();
    expect(container.querySelector(".cursor-ring")).toBeNull();

    window.matchMedia = origMatchMedia;
  });
});
