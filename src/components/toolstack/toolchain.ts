import { createCleanup, prefersReducedMotion } from "@/scripts/util";

/**
 * Filterable toolchain catalog:
 * - On load: "All" is active, all cards in full-color state.
 * - When a category tab is clicked:
 *   - Active tab gets coral background, ink text.
 *   - Live counter updates to matching tool count.
 *   - Matching cards stay/transition to full color.
 *   - Non-matching cards transition to ghost state (~15% opacity, grayscale, border muted).
 *   - Transition animates smoothly over ~300ms ease-out, staggered card-by-card (~18ms delay).
 * - Keyboard navigation (Arrow keys, Home, End, Enter, Space) with visible coral outline.
 * - Reduced motion: skips stagger and transition delay, snaps immediately.
 */
export function initToolchain(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const container = root.querySelector<HTMLElement>("[data-toolchain]");
  if (!container) return () => {};

  const cleanup = createCleanup();
  const tabs = Array.from(container.querySelectorAll<HTMLButtonElement>("[data-filter-tab]"));
  const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-tool-card]"));
  const counterNum = root.querySelector<HTMLElement>("[data-count-num]");
  const counterLabel = root.querySelector<HTMLElement>("[data-count-label]");

  let activeCategory = "All";

  const updateCounter = (count: number) => {
    if (counterNum) counterNum.textContent = String(count);
    if (counterLabel) counterLabel.textContent = count === 1 ? "tool" : "tools";
  };

  const applyFilter = (category: string, immediate = false) => {
    activeCategory = category;
    const reduced = immediate || prefersReducedMotion();

    // Update tab states
    tabs.forEach((tab) => {
      const match = tab.dataset["filterTab"] === category;
      tab.classList.toggle("is-active", match);
      tab.setAttribute("aria-selected", String(match));
      tab.tabIndex = match ? 0 : -1;
    });

    let matchCount = 0;

    cards.forEach((card, index) => {
      const cardCategory = card.dataset["toolCat"] ?? "";
      const isMatch = category === "All" || cardCategory === category;
      if (isMatch) matchCount++;

      // Stagger delay ~18ms per card (within 15-20ms range requested)
      const delayMs = reduced ? 0 : index * 18;
      card.style.setProperty("--filter-delay", `${delayMs}ms`);

      if (isMatch) {
        card.classList.remove("is-ghost-tool");
        card.classList.add("is-active-tool");
        card.setAttribute("aria-hidden", "false");
      } else {
        card.classList.remove("is-active-tool");
        card.classList.add("is-ghost-tool");
        card.setAttribute("aria-hidden", "true");
      }
    });

    updateCounter(matchCount);
  };

  // Attach tab events
  tabs.forEach((tab, index) => {
    const category = tab.dataset["filterTab"] ?? "All";

    const clickHandler = () => {
      if (tab.dataset["filterTab"] === activeCategory) return;
      applyFilter(category);
    };

    const keydownHandler = (e: KeyboardEvent) => {
      let targetIndex = -1;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        targetIndex = (index + 1) % tabs.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        targetIndex = tabs.length - 1;
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        clickHandler();
        return;
      }

      if (targetIndex >= 0 && tabs[targetIndex]) {
        tabs[targetIndex]?.focus();
        const nextCat = tabs[targetIndex]?.dataset["filterTab"] ?? "All";
        applyFilter(nextCat);
      }
    };

    tab.addEventListener("click", clickHandler);
    tab.addEventListener("keydown", keydownHandler);
    cleanup.add(() => {
      tab.removeEventListener("click", clickHandler);
      tab.removeEventListener("keydown", keydownHandler);
    });
  });

  // Initial state: "All" selected, all cards active, immediate
  applyFilter("All", true);

  return () => cleanup.run();
}
