import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Github, Linkedin } from "lucide-react";

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
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: Linkedin },
  { label: "GitHub", href: "https://github.com/", icon: Github },
];

const navLinkBase =
  "inline-flex items-center rounded-full px-4 py-2 font-mono text-xs tracking-wide transition-all duration-200";
const navLinkActive =
  "bg-[#EFE6D8]/[0.12] text-[#EFE6D8] font-bold shadow-[inset_0_1px_0_0_rgba(239,230,216,0.16)]";
const navLinkInactive = "text-[#EFE6D8]/70 hover:bg-[#EFE6D8]/[0.06] hover:text-[#EFE6D8]";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const pillSurface = `float-header section-surface mode-dark pointer-events-auto rounded-full border ${
    scrolled ? "is-scrolled" : ""
  }`;

  return (
    <header className="pointer-events-none fixed inset-x-4 top-4 z-50 mx-auto max-w-6xl md:inset-x-6 lg:inset-x-8">
      <div className="flex items-center justify-between gap-4">
        {/* Left floating pill: Avatar + Wordmark + Nav items */}
        <div
          className={`${pillSurface} flex items-center gap-4 px-2.5 transition-[padding] duration-300 ${
            scrolled ? "py-1.5" : "py-2"
          }`}
        >
          <Link
            to="/"
            aria-label="shanto home"
            className="group flex shrink-0 items-center gap-2.5 pl-1.5 pr-1 focus-visible:outline-none"
          >
            <span
              data-header-logo="true"
              aria-hidden="true"
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-signal bg-[#10151F]/90 text-signal shadow-[0_0_16px_-4px_rgba(232,80,58,0.45)] transition-all duration-300 group-hover:bg-signal/15 group-hover:shadow-[0_0_22px_-2px_rgba(232,80,58,0.75)]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 overflow-visible"
                aria-hidden="true"
              >
                <path
                  d="M6.5 8L11.5 12.5L6.5 17"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform duration-300 ease-out group-hover:translate-x-[1.5px]"
                />
                <line
                  x1="13"
                  y1="17"
                  x2="18"
                  y2="17"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  className="terminal-cursor-blink"
                />
              </svg>
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-[#EFE6D8] transition-colors duration-200 group-hover:text-signal">
              shanto
            </span>
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
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
        </div>

        {/* Right floating pill: LinkedIn & GitHub icons + Hire me CTA */}
        <div
          className={`${pillSurface} flex items-center gap-2 pl-3 pr-2 transition-[padding] duration-300 ${
            scrolled ? "py-1.5" : "py-2"
          }`}
        >
          <ul className="flex items-center gap-1" aria-label="Social profiles">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#EFE6D8]/75 transition-colors hover:bg-[#EFE6D8]/[0.07] hover:text-signal"
                >
                  <s.icon className="h-4 w-4" aria-hidden />
                </a>
              </li>
            ))}
          </ul>

          <Link
            to="/"
            hash="scale"
            data-cursor-cta="true"
            data-cursor-label="HIRE"
            className="shrink-0 rounded-full bg-signal px-5 py-2 font-mono text-xs font-bold text-signal-foreground transition-transform hover:-translate-y-0.5"
          >
            Hire me
          </Link>
        </div>
      </div>

      {/* Mobile navigation pill */}
      <nav
        aria-label="Main mobile"
        className={`${pillSurface} mt-2 overflow-hidden px-2 py-1.5 lg:hidden`}
      >
        <ul className="flex items-center gap-1 overflow-x-auto">
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
