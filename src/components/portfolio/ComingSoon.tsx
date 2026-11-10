import { Link } from "@tanstack/react-router";
import { Header } from "./Header";

export function ComingSoon({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <>
      <Header />
      <main className="section-surface mode-light blueprint-grid flex min-h-screen items-center pt-28 md:pt-20">
        <div className="mx-auto w-full max-w-7xl px-5 py-24">
          <p className="font-mono text-xs uppercase tracking-[0.25em] dim">{eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(32px,4.8vw,58px)] font-bold leading-[1.1] tracking-tight">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-lg dim">{body}</p>
          <Link
            to="/"
            hash="test"
            className="mt-8 inline-block rounded-full bg-signal px-6 py-3 font-mono text-sm font-bold uppercase text-signal-foreground transition-transform hover:-translate-y-0.5"
          >
            See the projects →
          </Link>
        </div>
      </main>
    </>
  );
}
