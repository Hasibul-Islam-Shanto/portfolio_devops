import type { CredentialItem } from "./credential-types";

export function initCredentialModal(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const modal = root.querySelector<HTMLElement>("#credential-modal");
  if (!modal) return () => {};

  const scriptData = root.querySelector<HTMLScriptElement>("#credentials-data");
  const itemsMap: Record<string, CredentialItem> = {};

  if (scriptData?.textContent) {
    try {
      const parsed: CredentialItem[] = JSON.parse(scriptData.textContent);
      for (const it of parsed) {
        itemsMap[it.id] = it;
      }
    } catch {}
  }

  const titleEl = modal.querySelector<HTMLElement>("#credential-modal-title");
  const rankWrap = modal.querySelector<HTMLElement>("#credential-modal-rank-wrapper");
  const rankEl = modal.querySelector<HTMLElement>("#credential-modal-rank");
  const descEl = modal.querySelector<HTMLElement>("#credential-modal-desc");
  const imagesWrap = modal.querySelector<HTMLElement>("#credential-modal-images-wrapper");
  const linksWrap = modal.querySelector<HTMLElement>("#credential-modal-links-wrapper");
  const issuerEl = modal.querySelector<HTMLElement>("#credential-modal-issuer");
  const yearEl = modal.querySelector<HTMLElement>("#credential-modal-year");
  const dialogEl = modal.querySelector<HTMLElement>(".credential-modal-dialog");

  let previouslyFocused: HTMLElement | null = null;
  let isOpen = false;
  let closeTimeout: number | undefined;

  const isReducedMotion = () => {
    return (
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  };

  const getFocusables = (): HTMLElement[] => {
    if (!dialogEl) return [];
    return Array.from(
      dialogEl.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null || el.classList.contains("credential-modal-close"));
  };

  const openModal = (itemId: string, triggerEl?: HTMLElement) => {
    const item = itemsMap[itemId];
    if (!item) return;

    if (closeTimeout) {
      clearTimeout(closeTimeout);
      closeTimeout = undefined;
    }

    previouslyFocused = triggerEl || (document.activeElement as HTMLElement | null);

    if (titleEl) {
      titleEl.textContent = item.title;
    }

    if (rankWrap && rankEl) {
      const rank = item.rank?.trim();
      if (rank) {
        rankEl.textContent = rank;
        rankWrap.hidden = false;
        rankWrap.style.display = "";
      } else {
        rankEl.textContent = "";
        rankWrap.hidden = true;
        rankWrap.style.display = "none";
      }
    }

    if (descEl) {
      descEl.textContent = item.fullDescription || item.shortDescription;
    }

    if (imagesWrap) {
      imagesWrap.innerHTML = "";
      const images = item.images && item.images.length > 0 ? item.images : [];
      if (images.length > 0) {
        imagesWrap.hidden = false;
        imagesWrap.style.display = "";
        for (const imgUrl of images) {
          const figure = document.createElement("figure");
          figure.className = "overflow-hidden rounded-2xl border hairline bg-surface/50 p-2 sm:p-3";

          const img = document.createElement("img");
          img.src = imgUrl;
          img.alt = `Scanned certificate for ${item.title}`;
          img.loading = "lazy";
          img.className =
            "w-full h-auto max-h-[55vh] object-contain rounded-xl transition-transform duration-300 hover:scale-[1.01]";

          figure.appendChild(img);
          imagesWrap.appendChild(figure);
        }
      } else {
        imagesWrap.hidden = true;
        imagesWrap.style.display = "none";
      }
    }

    if (linksWrap) {
      linksWrap.innerHTML = "";
      const links = item.links && item.links.length > 0 ? item.links : [];
      if (links.length > 0) {
        linksWrap.hidden = false;
        linksWrap.style.display = "";
        for (const link of links) {
          const a = document.createElement("a");
          a.href = link.url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.className =
            "inline-flex items-center gap-1.5 rounded-full border hairline bg-surface/60 px-4 py-2 font-mono text-xs font-semibold text-[var(--text)] transition-colors hover:border-signal hover:text-signal focus-visible:outline-none focus-visible:border-signal";
          a.innerHTML = `<span>${link.label}</span><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10M7 17 17 7"/></svg>`;
          linksWrap.appendChild(a);
        }
      } else {
        linksWrap.hidden = true;
        linksWrap.style.display = "none";
      }
    }

    if (issuerEl) {
      issuerEl.textContent = item.issuer || item.organization || "Independent Verification";
    }
    if (yearEl) {
      yearEl.textContent = item.year;
    }

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    isOpen = true;

    if (isReducedMotion()) {
      modal.classList.add("is-open");
      const focusables = getFocusables();
      const first = focusables[0];
      if (first) {
        first.focus();
      }
    } else {
      void modal.offsetWidth;
      requestAnimationFrame(() => {
        modal.classList.add("is-open");
        const focusables = getFocusables();
        const first = focusables[0];
        if (first) {
          first.focus();
        }
      });
    }
  };

  const closeModal = () => {
    if (!isOpen) return;
    isOpen = false;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (isReducedMotion()) {
      modal.hidden = true;
      previouslyFocused?.focus();
    } else {
      closeTimeout = window.setTimeout(() => {
        if (!isOpen) {
          modal.hidden = true;
          previouslyFocused?.focus();
        }
      }, 250);
    }
  };

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const openBtn = target.closest<HTMLElement>("[data-credential-open]");
    if (openBtn) {
      e.preventDefault();
      const id = openBtn.getAttribute("data-credential-open");
      if (id) openModal(id, openBtn);
      return;
    }

    const card = target.closest<HTMLElement>("[data-credential-card]");
    if (card && !target.closest("a") && !target.closest("button")) {
      const id = card.getAttribute("data-credential-card");
      if (id) {
        const btn = card.querySelector<HTMLElement>("[data-credential-open]");
        openModal(id, btn || card);
        return;
      }
    }

    if (target.closest("[data-credential-close]")) {
      e.preventDefault();
      closeModal();
      return;
    }
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key === "Tab") {
      const focusables = getFocusables();
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (!first || !last) {
        e.preventDefault();
        return;
      }

      if (e.shiftKey) {
        if (document.activeElement === first || !dialogEl?.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || !dialogEl?.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  root.addEventListener("click", onClick as EventListener);
  window.addEventListener("keydown", onKeydown);

  return () => {
    if (closeTimeout) clearTimeout(closeTimeout);
    root.removeEventListener("click", onClick as EventListener);
    window.removeEventListener("keydown", onKeydown);
    document.body.style.overflow = "";
  };
}
