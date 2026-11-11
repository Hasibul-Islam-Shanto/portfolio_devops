import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme, getPreferredTheme, initTheme } from "../scripts/theme";
import { initHeader } from "../components/navbar/header";
import { fixture, mockMatchMedia, mount, track } from "./helpers";

describe("Theme System", () => {
  beforeEach(() => {
    window.localStorage?.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.classList.remove("dark", "theme-transitioning");
  });

  describe("Theme Resolution & Defaults", () => {
    it("defaults to OS prefers-color-scheme when no user preference is stored", () => {
      mockMatchMedia("prefers-color-scheme: dark");
      expect(getPreferredTheme()).toBe("dark");

      mockMatchMedia("prefers-color-scheme: light");
      expect(getPreferredTheme()).toBe("light");
    });

    it("respects localStorage override over OS preference", () => {
      mockMatchMedia("prefers-color-scheme: dark");
      window.localStorage.setItem("theme", "light");
      expect(getPreferredTheme()).toBe("light");

      mockMatchMedia("prefers-color-scheme: light");
      window.localStorage.setItem("theme", "dark");
      expect(getPreferredTheme()).toBe("dark");
    });
  });

  describe("Theme Application", () => {
    it("applies dark theme to <html> element", () => {
      applyTheme("dark", false);
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(window.localStorage.getItem("theme")).toBe("dark");
    });

    it("applies light theme to <html> element", () => {
      applyTheme("light", false);
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      expect(document.documentElement.classList.contains("dark")).toBe(false);
      expect(window.localStorage.getItem("theme")).toBe("light");
    });

    it("adds theme-transitioning class during animated theme change and clears it", () => {
      vi.useFakeTimers();
      try {
        applyTheme("light", true);
        expect(document.documentElement.classList.contains("theme-transitioning")).toBe(true);

        vi.advanceTimersByTime(400);
        expect(document.documentElement.classList.contains("theme-transitioning")).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it("skips theme-transitioning under prefers-reduced-motion", () => {
      mockMatchMedia("prefers-reduced-motion");
      applyTheme("light", true);
      expect(document.documentElement.classList.contains("theme-transitioning")).toBe(false);
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    });
  });

  describe("Header Theme Toggle Control", () => {
    it("renders the theme toggle button in the header with sun and moon icons", () => {
      const body = mount("header");
      const toggle = body.querySelector<HTMLButtonElement>("[data-theme-toggle]");
      expect(toggle).not.toBeNull();
      expect(toggle?.querySelector('[data-theme-icon="sun"]')).not.toBeNull();
      expect(toggle?.querySelector('[data-theme-icon="moon"]')).not.toBeNull();
    });

    it("toggles active theme when clicked and saves preference to localStorage", () => {
      const body = mount("header");
      track(initHeader(body));

      applyTheme("dark", false);
      const toggle = body.querySelector<HTMLButtonElement>("[data-theme-toggle]")!;
      expect(toggle).not.toBeNull();

      // Click to toggle from dark to light
      toggle.click();
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      expect(window.localStorage.getItem("theme")).toBe("light");
      expect(toggle.getAttribute("aria-label")).toContain("dark");

      // Click again to toggle from light to dark
      toggle.click();
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(window.localStorage.getItem("theme")).toBe("dark");
      expect(toggle.getAttribute("aria-label")).toContain("light");
    });

    it("does not double-toggle when both initTheme and initHeader initialize", () => {
      const body = mount("header");
      track(initTheme(body));
      track(initHeader(body));

      applyTheme("dark", false);
      const toggle = body.querySelector<HTMLButtonElement>("[data-theme-toggle]")!;
      expect(toggle).not.toBeNull();

      // Click to toggle from dark to light
      toggle.click();
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      expect(window.localStorage.getItem("theme")).toBe("light");

      // Click again to toggle from light to dark
      toggle.click();
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
      expect(window.localStorage.getItem("theme")).toBe("dark");
    });
  });

  describe("Terminal-Style Widgets Are Fully Theme-Aware", () => {
    it("hero terminal uses terminal tokens and retains traffic light dots", () => {
      const html = fixture("hero-terminal");
      expect(html).toContain("bg-[var(--terminal-bg)]");
      expect(html).toContain("text-[var(--terminal-fg)]");
      expect(html).toContain("text-signal");
      expect(html).toContain("bg-[var(--terminal-chip-bg)]");
      expect(html).toContain("text-[var(--terminal-dim)]");
      // Window chrome dots retain universal traffic-light colors
      expect(html).toContain("bg-[#FF5F56]");
      expect(html).toContain("bg-[#FFBD2E]");
      expect(html).toContain("bg-[#27C93F]");
    });

    it("how-i-work mini-terminal flow cards use terminal tokens and contrast-aware success green", () => {
      const html = fixture("how-i-work");
      expect(html).toContain("bg-[var(--terminal-bg)]");
      expect(html).toContain("text-[var(--terminal-fg)]");
      expect(html).toContain("text-[var(--terminal-success)]");
      expect(html).toContain("border-[var(--terminal-border)]");
      // Window chrome dots retain universal colors
      expect(html).toContain("bg-[#FF5F56]/85");
      expect(html).toContain("bg-[#FFBD2E]/85");
      expect(html).toContain("bg-[#27C93F]/85");
    });

    it("contact terminal card uses terminal tokens and universal chrome dots", () => {
      const html = fixture("contact");
      expect(html).toContain("bg-[var(--terminal-bg)]");
      expect(html).toContain("border-[var(--terminal-border)]");
      expect(html).toContain("shanto@portfolio:~");
      // Universal chrome dots
      expect(html).toContain("bg-[#FF5F57]");
      expect(html).toContain("bg-[#FEBC2E]");
      expect(html).toContain("bg-[#28C840]");
    });

    it("toolchain icons retain their original colors without turning black or white", () => {
      const html = fixture("toolchain");
      expect(html).toContain("bg-white");
      expect(html).toContain('fill="#326CE5"');
      expect(html).toContain('fill="#2496ED"');
      expect(html).toContain('fill="#844FBA"');
      expect(html).not.toContain('fill="currentColor"');
    });
  });
});
