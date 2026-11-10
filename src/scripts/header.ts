import { createCleanup } from "./util";

/**
 * Header behaviour:
 * - toggles `.is-scrolled` on every pill when scrollY > 60% of the viewport height
 * - keeps the active nav link in sync with pathname + hash (`/`, `/#test`, `/#scale`, `/blog`, ...)
 */
export function initHeader(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const header = root.querySelector<HTMLElement>("[data-site-header]");
  if (!header) return () => {};

  const cleanup = createCleanup();
  const pills = header.querySelectorAll<HTMLElement>(".header-pill");
  const links = header.querySelectorAll<HTMLAnchorElement>(".nav-link");

  const updateScrolled = () => {
    const scrolled = window.scrollY > window.innerHeight * 0.6;
    pills.forEach((p) => p.classList.toggle("is-scrolled", scrolled));
  };

  const updateActive = () => {
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    const hash = window.location.hash;
    links.forEach((a) => {
      const linkPath = a.dataset["navPath"] ?? "/";
      const linkHash = a.dataset["navHash"] ?? "";
      // "Home" is only active at the top of "/"; hash links are active when their hash matches.
      const active = linkPath === path && linkHash === hash;
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  };

  updateScrolled();
  updateActive();
  window.addEventListener("scroll", updateScrolled, { passive: true });
  window.addEventListener("hashchange", updateActive);
  cleanup.add(() => {
    window.removeEventListener("scroll", updateScrolled);
    window.removeEventListener("hashchange", updateActive);
  });
  return () => cleanup.run();
}
