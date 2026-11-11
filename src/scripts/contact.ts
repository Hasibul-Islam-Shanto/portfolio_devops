import { createCleanup } from "./util";

/**
 * Calculates current Bangladesh Standard Time (BST, UTC+6:00) as "HH:MM AM/PM".
 */
export function getBSTTime(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const bst = new Date(utc + 3600000 * 6);
    let hours = bst.getHours();
    const minutes = bst.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${ampm}`;
  }
}

/** Backwards-compatible alias */
export const getISTTime = getBSTTime;

/**
 * Initializes the terminal-style contact footer:
 * - Live BST time counter updating every minute
 * - Copy email button with temporary "copied" state
 */
export function initContact(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const cleanup = createCleanup();

  // 1. Live BST clock
  const timeEl = root.querySelector<HTMLElement>("[data-bst-time], [data-ist-time]");
  if (timeEl) {
    const updateTime = () => {
      timeEl.textContent = getBSTTime();
    };
    updateTime();
    const interval = window.setInterval(updateTime, 60000);
    cleanup.add(() => window.clearInterval(interval));
  }

  // 2. Email clipboard copy
  const copyBtns = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-copy-email]"));
  copyBtns.forEach((btn) => {
    let timeoutId: number | undefined;
    const originalText = btn.textContent?.trim() || "copy";
    const emailToCopy = btn.getAttribute("data-copy-email") || "hello@shanto.dev";

    const handleCopy = async () => {
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(emailToCopy);
        }
      } catch {
        // Fallback for older environments or when clipboard permission is restricted
      }

      btn.textContent = "copied";
      btn.setAttribute("aria-label", "Email copied to clipboard");

      if (timeoutId) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        btn.textContent = originalText;
        btn.setAttribute("aria-label", "Copy email address");
      }, 1500);
    };

    btn.addEventListener("click", handleCopy);
    cleanup.add(() => {
      btn.removeEventListener("click", handleCopy);
      if (timeoutId) window.clearTimeout(timeoutId);
    });
  });

  return () => cleanup.run();
}
