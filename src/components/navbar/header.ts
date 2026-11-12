import { initTheme } from "@/scripts/theme";
import { createCleanup } from "@/scripts/util";

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
      setHeaderVisibility(true);
    } else {
      mobileMenu?.classList.remove("flex");
      mobileMenu?.classList.add("hidden");
      iconOpen?.classList.remove("hidden");
      iconClose?.classList.add("hidden");
      const currentY = typeof window !== "undefined" ? Math.max(0, window.scrollY || 0) : 0;
      if (currentY > getHeroBoundary()) {
        startIdleTimer();
      }
    }
  };

  if (mobileToggle && mobileMenu) {
    const onToggleClick = (e: MouseEvent) => {
      e.stopPropagation();
      setMenuOpen(!isMenuOpen);
    };
    mobileToggle.addEventListener("click", onToggleClick);
    cleanup.add(() => mobileToggle.removeEventListener("click", onToggleClick));

    mobileLinks.forEach((link) => {
      const onLinkClick = () => setMenuOpen(false);
      link.addEventListener("click", onLinkClick);
      cleanup.add(() => link.removeEventListener("click", onLinkClick));
    });

    const onDocClick = (e: MouseEvent) => {
      if (isMenuOpen && !header.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    cleanup.add(() => document.removeEventListener("click", onDocClick));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setMenuOpen(false);
        mobileToggle.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    cleanup.add(() => document.removeEventListener("keydown", onKeyDown));
  }

  const SCROLL_DELTA_THRESHOLD = 5;
  const IDLE_HIDE_MS = 1800;

  let isHidden = false;
  let isHovered = false;
  let lastScrollY = typeof window !== "undefined" ? Math.max(0, window.scrollY || 0) : 0;
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  const clearIdleTimer = () => {
    if (idleTimer !== null) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
  };

  const getHeroBoundary = (): number => {
    const heroEl = document.getElementById("hero");
    if (heroEl) {
      return heroEl.offsetTop + heroEl.offsetHeight;
    }
    return typeof window !== "undefined" ? Math.max(200, window.innerHeight * 0.4) : 400;
  };

  const setHeaderVisibility = (visible: boolean) => {
    if (!visible && isMenuOpen) return;
    if (isHidden === !visible) return;
    isHidden = !visible;
    header.classList.toggle("header-hidden", !visible);
    header.setAttribute("aria-hidden", String(!visible));
  };

  const startIdleTimer = () => {
    clearIdleTimer();
    if (isHovered) return;
    const currentY = typeof window !== "undefined" ? Math.max(0, window.scrollY || 0) : 0;
    if (currentY <= getHeroBoundary() || isHidden) return;

    idleTimer = setTimeout(() => {
      const liveY = typeof window !== "undefined" ? Math.max(0, window.scrollY || 0) : 0;
      if (!isHovered && liveY > getHeroBoundary()) {
        setHeaderVisibility(false);
      }
    }, IDLE_HIDE_MS);
  };

  const updateScrolled = () => {
    const scrolled = window.scrollY > window.innerHeight * 0.6;
    pills.forEach((p) => p.classList.toggle("is-scrolled", scrolled));
  };

  const onScroll = () => {
    updateScrolled();

    const currentY = typeof window !== "undefined" ? Math.max(0, window.scrollY || 0) : 0;
    const heroBoundary = getHeroBoundary();

    if (currentY <= heroBoundary) {
      clearIdleTimer();
      setHeaderVisibility(true);
      lastScrollY = currentY;
      return;
    }

    const delta = currentY - lastScrollY;

    if (Math.abs(delta) < SCROLL_DELTA_THRESHOLD) {
      return;
    }

    if (delta > 0) {
      clearIdleTimer();
      if (!isHovered) {
        setHeaderVisibility(false);
      }
    } else {
      setHeaderVisibility(true);
      startIdleTimer();
    }

    lastScrollY = currentY;
  };

  const onHeaderEnter = () => {
    isHovered = true;
    clearIdleTimer();
  };

  const onHeaderLeave = (e: MouseEvent | FocusEvent) => {
    const next = (e as MouseEvent).relatedTarget as Node | null;
    if (next && header.contains(next)) return;
    isHovered = false;
    const currentY = typeof window !== "undefined" ? Math.max(0, window.scrollY || 0) : 0;
    if (currentY > getHeroBoundary() && !isHidden) {
      startIdleTimer();
    }
  };

  header.addEventListener("mouseover", onHeaderEnter);
  header.addEventListener("mouseout", onHeaderLeave);
  header.addEventListener("focusin", onHeaderEnter);
  header.addEventListener("focusout", onHeaderLeave);

  cleanup.add(() => {
    clearIdleTimer();
    header.removeEventListener("mouseover", onHeaderEnter);
    header.removeEventListener("mouseout", onHeaderLeave);
    header.removeEventListener("focusin", onHeaderEnter);
    header.removeEventListener("focusout", onHeaderLeave);
  });

  const updateActive = () => {
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    const hash = window.location.hash;
    links.forEach((a) => {
      const linkPath = a.dataset["navPath"] ?? "/";
      const linkHash = a.dataset["navHash"] ?? "";
      const active = linkPath === path && linkHash === hash;
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  };

  updateScrolled();
  updateActive();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("hashchange", updateActive);
  cleanup.add(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("hashchange", updateActive);
  });
  return () => cleanup.run();
}
