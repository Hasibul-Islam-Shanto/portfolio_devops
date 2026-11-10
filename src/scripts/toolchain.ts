import { createCleanup } from "./util";

/**
 * Toolchain cards: the hovered/focused card is highlighted; with nothing hovered or focused the
 * default group ("Infrastructure", badged "Core") is highlighted.
 */
export function initToolchain(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const grid = root.querySelector<HTMLElement>("[data-toolchain]");
  if (!grid) return () => {};

  const cleanup = createCleanup();
  const fallback = grid.dataset["defaultGroup"] ?? "";
  const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-tool-card]"));

  const apply = (hot: string | null) => {
    cards.forEach((card) => {
      const on = (hot ?? fallback) === card.dataset["toolCard"];
      card.classList.toggle("is-on", on);
      card.classList.toggle("border-signal", on);
      card.classList.toggle("-translate-y-1", on);
      card.classList.toggle("hairline", !on);
      const icon = card.querySelector<HTMLElement>("[data-tool-icon]");
      icon?.classList.toggle("border-signal", on);
      icon?.classList.toggle("text-signal", on);
      icon?.classList.toggle("hairline", !on);
    });
  };

  cards.forEach((card) => {
    const name = card.dataset["toolCard"] ?? null;
    const enter = () => apply(name);
    card.addEventListener("mouseenter", enter);
    card.addEventListener("focus", enter);
    cleanup.add(() => {
      card.removeEventListener("mouseenter", enter);
      card.removeEventListener("focus", enter);
    });
  });

  const leave = () => apply(null);
  grid.addEventListener("mouseleave", leave);
  grid.addEventListener("focusout", (e) => {
    if (!grid.contains(e.relatedTarget as Node | null)) leave();
  });
  cleanup.add(() => grid.removeEventListener("mouseleave", leave));

  return () => cleanup.run();
}
