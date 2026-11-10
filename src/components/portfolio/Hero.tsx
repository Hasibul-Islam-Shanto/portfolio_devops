import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DeployFlow } from "./DeployFlow";

const HERO_STATS = [
  { value: 8, suffix: "+ Years", label: "Building backend & platform systems" },
  { value: 18, suffix: "", label: "Production incidents resolved this quarter" },
  { value: 300, suffix: "%", label: "Deploy frequency improved" },
  { value: 120, suffix: "+", label: "Services running in production" },
] as const;

function StatCounter({
  value,
  suffix,
  start,
  reduce,
}: {
  value: number;
  suffix: string;
  start: boolean;
  reduce: boolean;
}) {
  const [count, setCount] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!start) return;
    if (reduce) {
      setCount(value);
      return;
    }
    let raf = 0;
    const duration = 1200;
    const t0 = performance.now();

    const step = (now: number) => {
      const elapsed = now - t0;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * value));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    raf = requestAnimationFrame(step);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [start, value, reduce]);

  return (
    <span>
      {reduce ? value : count}
      {suffix}
    </span>
  );
}

export function Hero() {
  const words = ["Making", "complex", "systems", "run", "like", "they", "should."];
  const reduce = Boolean(useReducedMotion());
  const statsRef = useRef<HTMLDListElement>(null);
  const statsInView = useInView(statsRef, { once: true, margin: "-10% 0px" });

  return (
    <div className="blueprint-grid relative flex min-h-screen items-center pt-28 md:pt-20">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.3fr_1fr] lg:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] dim">
            00 / Platform engineer · Dhaka → Remote
          </p>
          <h1 className="mt-6 text-[clamp(32px,4.8vw,58px)] font-bold leading-[1.1] tracking-tight">
            {words.map((w, i) => (
              <motion.span
                key={w}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduce
                    ? { duration: 0.2 }
                    : { delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }
                }
                className={`mr-[0.22em] inline-block ${w === "run" ? "text-signal" : ""}`}
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <p className="mt-6 max-w-lg text-lg dim">
            I build the pipelines, platforms and guardrails that let product teams ship ten times a
            day without paging anyone at 3am.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#test"
              data-cursor-cta="true"
              data-cursor-label="WORK ↓"
              className="rounded-full bg-signal px-6 py-3 font-mono text-sm font-bold uppercase text-signal-foreground transition-transform hover:-translate-y-0.5"
            >
              View the work →
            </a>
            <a
              href="#scale"
              data-cursor-cta="true"
              data-cursor-label="TALK"
              className="rounded-full border-2 border-current px-6 py-3 font-mono text-sm font-bold uppercase transition-colors hover:border-signal hover:text-signal"
            >
              Get in touch
            </a>
          </div>

          <dl
            ref={statsRef}
            aria-label="Key platform engineering metrics"
            className="mt-10 grid grid-cols-2 border-t hairline pt-6 sm:grid-cols-4"
          >
            {HERO_STATS.map((s, i) => (
              <div
                key={s.label}
                className={[
                  "flex flex-col justify-between",
                  i % 2 === 1 ? "border-l hairline pl-4" : "pr-4",
                  i >= 2 ? "mt-6 pt-2 sm:mt-0 sm:pt-0" : "",
                  i > 0 ? "sm:border-l sm:hairline sm:pl-4" : "",
                  i < HERO_STATS.length - 1 ? "sm:pr-4" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <dt className="order-2 mt-1.5 font-mono text-[11px] leading-snug dim">{s.label}</dt>
                <dd className="order-1 font-mono text-2xl font-bold tracking-tight text-signal md:text-3xl">
                  <StatCounter
                    value={s.value}
                    suffix={s.suffix}
                    start={statsInView}
                    reduce={reduce}
                  />
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <motion.div
          className="min-w-0"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0.2 } : { delay: 0.5, duration: 0.7 }}
        >
          <DeployFlow />
        </motion.div>
      </div>
      <a
        href="#test"
        data-cursor-label="↓"
        className="scroll-cue absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest dim"
      >
        scroll ↓
      </a>
    </div>
  );
}
