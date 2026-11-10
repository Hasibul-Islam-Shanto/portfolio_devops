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

const navLink =
  "font-mono text-[11px] uppercase tracking-widest transition-colors hover:text-signal";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={`float-header section-surface mode-dark fixed inset-x-4 top-4 z-50 border hairline md:inset-x-6 ${scrolled ? "is-scrolled" : ""}`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center gap-6 px-5 transition-[padding] duration-300 ${scrolled ? "py-2" : "py-4"}`}
      >
        <Link to="/" className="shrink-0 font-mono text-sm font-bold tracking-tight">
          shanto<span className="text-signal">.</span>ops
        </Link>

        <nav aria-label="Main" className="hidden flex-1 md:block">
          <ul className="flex items-center gap-6">
            {NAV.map((n) => (
              <li key={n.label}>
                <Link
                  to={n.to}
                  {...("hash" in n ? { hash: n.hash } : {})}
                  className={navLink}
                  activeOptions={{ exact: true, includeHash: true }}
                  activeProps={{ className: "text-signal" }}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="ml-auto flex items-center gap-1 md:ml-0" aria-label="Social profiles">
          {SOCIAL.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:text-signal"
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
          className="shrink-0 rounded-full bg-signal px-4 py-2 font-mono text-xs font-bold uppercase text-signal-foreground transition-transform hover:-translate-y-0.5"
        >
          Hire me
        </Link>
      </div>

      <nav aria-label="Main mobile" className="border-t hairline md:hidden">
        <ul className="flex gap-5 overflow-x-auto px-5 py-2">
          {NAV.map((n) => (
            <li key={n.label} className="shrink-0">
              <Link to={n.to} {...("hash" in n ? { hash: n.hash } : {})} className={navLink}>
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
