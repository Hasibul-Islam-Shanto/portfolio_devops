import { createCleanup, prefersReducedMotion } from "./util";

export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export function getPreferredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {}

  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "dark";
}

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
  } catch {}

  const toggles = document.querySelectorAll<HTMLElement>("[data-theme-toggle]");
  toggles.forEach((btn) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    btn.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    btn.setAttribute("title", `Switch to ${nextTheme} mode`);
    btn.setAttribute("data-current-theme", theme);
  });

  if (animate && !reduced) {
    window.setTimeout(() => {
      html.classList.remove("theme-transitioning");
    }, 400);
  }
}

export function initTheme(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const cleanup = createCleanup();

  const current =
    (document.documentElement.getAttribute("data-theme") as Theme) || getPreferredTheme();
  applyTheme(current, false);

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
