import { initTheme } from "@/scripts/theme";
import { createCleanup } from "@/scripts/util";

/**
 * Header behaviour:
 * - toggles `.is-scrolled` on every pill when scrollY > 60% of the viewport height
 * - keeps the active nav link in sync with pathname + hash (`/`, `/#test`, `/#scale`, `/blog`, ...)
 * - initializes the theme toggle button and synchronizes theme state
 * - controls the mobile drawer menu (hamburger toggle, auto-close on nav/click-outside/Escape)
 */
export function initHeader(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const header = root.querySelector<HTMLElement>("[data-site-header]");
  if (!header) return () => {};

  const cleanup = createCleanup();
  cleanup.add(initTheme(header));
  const pills = header.querySelectorAll<HTMLElement>(".header-pill");
  const links = header.querySelectorAll<HTMLAnchorElement>(".nav-link, [data-mobile-nav-link]");

  const mobileToggle = header.querySelector<HTMLButtonElement>("[data-mobile-menu-toggle]");
  const mobileMenu = header.querySelector<HTMLElement>("[data-mobile-menu]");
  const mobileLinks = header.querySelectorAll<HTMLAnchorElement>("[data-mobile-nav-link]");
  const iconOpen = mobileToggle?.querySelector<SVGElement>('[data-menu-icon="open"]');
  const iconClose = mobileToggle?.querySelector<SVGElement>('[data-menu-icon="close"]');

  let isMenuOpen = false;

  const setMenuOpen = (open: boolean) => {
    isMenuOpen = open;
    mobileToggle?.setAttribute("aria-expanded", String(open));
    mobileToggle?.setAttribute(
      "aria-label",
      open ? "Close navigation menu" : "Open navigation menu",
    );
    mobileMenu?.setAttribute("aria-hidden", String(!open));
    if (open) {
      mobileMenu?.classList.remove("hidden");
      mobileMenu?.classList.add("flex");
      iconOpen?.classList.add("hidden");
      iconClose?.classList.remove("hidden");
    } else {
      mobileMenu?.classList.remove("flex");
      mobileMenu?.classList.add("hidden");
      iconOpen?.classList.remove("hidden");
      iconClose?.classList.add("hidden");
    }
  };

  if (mobileToggle && mobileMenu) {
    const onToggleClick = (e: MouseEvent) => {
      e.stopPropagation();
      setMenuOpen(!isMenuOpen);
    };
    mobileToggle.addEventListener("click", onToggleClick);
    cleanup.add(() => mobileToggle.removeEventListener("click", onToggleClick));

    // Close menu when clicking any mobile nav link
    mobileLinks.forEach((link) => {
      const onLinkClick = () => setMenuOpen(false);
      link.addEventListener("click", onLinkClick);
      cleanup.add(() => link.removeEventListener("click", onLinkClick));
    });

    // Close menu when clicking outside the header
    const onDocClick = (e: MouseEvent) => {
      if (isMenuOpen && !header.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    cleanup.add(() => document.removeEventListener("click", onDocClick));

    // Close menu on Escape key
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setMenuOpen(false);
        mobileToggle.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    cleanup.add(() => document.removeEventListener("keydown", onKeyDown));
  }

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
