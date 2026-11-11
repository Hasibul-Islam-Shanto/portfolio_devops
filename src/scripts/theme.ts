import { createCleanup, prefersReducedMotion } from "./util";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

/**
 * Resolves the preferred theme:
 * 1. Explicit user choice stored in localStorage ("light" or "dark")
 * 2. System OS preference (prefers-color-scheme media query)
 * 3. Fallback to "dark"
 */
export function getPreferredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // localStorage unavailable (e.g. sandboxed iframe or private browsing)
  }

  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "dark";
}

/**
 * Applies the given theme to the document:
 * - sets data-theme attribute on <html>
 * - toggles .dark class on <html>
 * - persists to localStorage
 * - triggers a smooth cross-fade animation (~350ms) unless reduced motion is preferred
 */
export function applyTheme(theme: Theme, animate = false): void {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  const reduced = prefersReducedMotion();

  if (animate && !reduced) {
    html.classList.add("theme-transitioning");
  }

  html.setAttribute("data-theme", theme);
  html.classList.toggle("dark", theme === "dark");

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable
  }

  // Update theme toggle buttons aria-label and state
  const toggles = document.querySelectorAll<HTMLElement>("[data-theme-toggle]");
  toggles.forEach((btn) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    btn.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
    btn.setAttribute("title", `Switch to ${nextTheme} theme`);
    btn.setAttribute("data-current-theme", theme);
  });

  if (animate && !reduced) {
    window.setTimeout(() => {
      html.classList.remove("theme-transitioning");
    }, 400);
  }
}

/**
 * Initializes theme listeners and binds theme toggle buttons.
 * Returns a cleanup function removing all listeners and timeouts.
 */
export function initTheme(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const cleanup = createCleanup();

  // Ensure current theme matches preferred on startup if not already initialized
  const current =
    (document.documentElement.getAttribute("data-theme") as Theme) || getPreferredTheme();
  applyTheme(current, false);

  // Bind click handlers to theme toggle buttons
  const toggles = root.querySelectorAll<HTMLElement>("[data-theme-toggle]");
  const handleToggle = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const active =
      document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = active === "light" ? "dark" : "light";
    applyTheme(next, true);
  };

  toggles.forEach((btn) => {
    if (btn.dataset["themeBound"] === "true") return;
    btn.dataset["themeBound"] = "true";
    btn.addEventListener("click", handleToggle);
    cleanup.add(() => {
      delete btn.dataset["themeBound"];
      btn.removeEventListener("click", handleToggle);
    });
  });

  // Listen for OS scheme change if user hasn't set an explicit localStorage choice
  if (typeof window !== "undefined" && window.matchMedia) {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {
        stored = null;
      }
      if (!stored) {
        applyTheme(e.matches ? "dark" : "light", true);
      }
    };

    if (media.addEventListener) {
      media.addEventListener("change", handleMediaChange);
      cleanup.add(() => media.removeEventListener("change", handleMediaChange));
    }
  }

  return () => cleanup.run();
}
