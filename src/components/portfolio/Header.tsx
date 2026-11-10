import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Github, Linkedin, Twitter } from "lucide-react";

export const STAGES = [
  { id: "build", label: "Build" },
  { id: "test", label: "Test" },
  { id: "deploy", label: "Deploy" },
  { id: "monitor", label: "Monitor" },
  { id: "scale", label: "Scale" },
];

const NAV = [
  { label: "Home", to: "/" },
  { label: "Projects", to: "/", hash: "test" },
  { label: "Case Studies", to: "/case-studies" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/", hash: "scale" },
] as const satisfies readonly {
  label: string;
  to: "/" | "/blog" | "/case-studies";
  hash?: string;
}[];

const SOCIAL = [
  { label: "GitHub", href: "https://github.com/", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: Linkedin },
  { label: "X / Twitter", href: "https://x.com/", icon: Twitter },
];

const navLinkBase =
  "inline-flex items-center rounded-full px-3.5 py-1.5 font-mono text-xs tracking-wide transition-all duration-200";
const navLinkActive =
  "bg-[#EFE6D8]/[0.12] text-[#EFE6D8] font-bold shadow-[inset_0_1px_0_0_rgba(239,230,216,0.16)]";
const navLinkInactive =
  "text-[#EFE6D8]/70 hover:bg-[#EFE6D8]/[0.06] hover:text-[#EFE6D8]";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const focusTerminalCommand = () => {
    const termInput = document.querySelector<HTMLInputElement>(
      'input[aria-label="Terminal command input"]',
    );
    if (termInput) {
      termInput.scrollIntoView({ behavior: "smooth", block: "center" });
      termInput.focus();
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        focusTerminalCommand();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header
      className={`float-header section-surface mode-dark fixed inset-x-4 top-4 z-50 mx-auto max-w-7xl rounded-[22px] border md:inset-x-6 lg:inset-x-8 ${scrolled ? "is-scrolled" : ""}`}
    >
      <div
        className={`flex items-center gap-4 px-4 transition-[padding] duration-300 sm:px-5 lg:gap-6 ${scrolled ? "py-2" : "py-3"}`}
      >
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-2.5 focus-visible:outline-none"
        >
          <span
            data-header-avatar="true"
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-signal font-display text-xs font-bold tracking-tight text-signal-foreground transition-transform duration-200 group-hover:scale-105"
          >
            SH
          </span>
          <span className="font-display text-base font-bold tracking-tight text-[#EFE6D8]">
            shanto<span className="text-signal">.</span>ops
          </span>
        </Link>

        <nav aria-label="Main" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1.5">
            {NAV.map((n) => (
              <li key={n.label}>
                <Link
                  to={n.to}
                  {...("hash" in n ? { hash: n.hash } : {})}
                  className={navLinkBase}
                  activeOptions={{ exact: true, includeHash: true }}
                  activeProps={{ className: navLinkActive }}
                  inactiveProps={{ className: navLinkInactive }}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ul className="flex items-center gap-0.5" aria-label="Social profiles">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-[#EFE6D8]/75 transition-colors hover:bg-[#EFE6D8]/[0.07] hover:text-signal"
                >
                  <s.icon className="h-4 w-4" aria-hidden />
                </a>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={focusTerminalCommand}
            data-header-cmd="true"
            aria-label="Command menu (⌘K)"
            className="hidden shrink-0 items-center gap-2 rounded-full px-2.5 py-1 font-mono text-xs text-[#EFE6D8]/60 transition-colors hover:bg-[#EFE6D8]/[0.06] hover:text-[#EFE6D8] sm:flex"
          >
            <kbd className="rounded-lg border border-[#EFE6D8]/15 bg-[#10151F]/80 px-2 py-0.5 font-mono text-[11px] font-medium text-[#EFE6D8]/70">
              ⌘K
            </kbd>
            <span className="text-[#EFE6D8]/60">Menu</span>
          </button>

          <Link
            to="/"
            hash="scale"
            data-cursor-cta="true"
            data-cursor-label="HIRE"
            className="shrink-0 rounded-full bg-signal px-4 py-2 font-mono text-xs font-bold uppercase text-signal-foreground transition-transform hover:-translate-y-0.5"
          >
            Hire me
          </Link>
        </div>
      </div>

      <nav aria-label="Main mobile" className="border-t hairline lg:hidden">
        <ul className="flex items-center gap-2 overflow-x-auto px-4 py-2">
          {NAV.map((n) => (
            <li key={n.label} className="shrink-0">
              <Link
                to={n.to}
                {...("hash" in n ? { hash: n.hash } : {})}
                className={navLinkBase}
                activeOptions={{ exact: true, includeHash: true }}
                activeProps={{ className: navLinkActive }}
                inactiveProps={{ className: navLinkInactive }}
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
