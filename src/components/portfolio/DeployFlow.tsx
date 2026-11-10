import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { GitCommit, Hammer, FlaskConical, Rocket, Activity } from "lucide-react";

const NODES = [
  { label: "Commit", icon: GitCommit },
  { label: "Build", icon: Hammer },
  { label: "Test", icon: FlaskConical },
  { label: "Deploy", icon: Rocket },
  { label: "Monitor", icon: Activity },
];
const STEP = 900; // ms per node

/** Looping deployment pipeline: a signal travels through 5 nodes, lighting each in turn. */
export function DeployFlow() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? 3 : -1);
  const [run, setRun] = useState(1);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= NODES.length) {
          setRun((r) => r + 1);
          return -1;
        }
        return s + 1;
      });
    }, STEP);
    return () => clearInterval(id);
  }, [reduce]);

  const pos = Math.max(0, Math.min(step, NODES.length - 1)) / (NODES.length - 1);
  const status = step < 0 ? "QUEUED" : step >= NODES.length ? "HEALTHY" : "RUNNING";

  return (
    <div className="border-2 border-signal bg-surface p-6 font-mono shadow-2xl">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest dim">
        <span>pipeline · release #{1840 + run}</span>
        <span
          className={
            status === "HEALTHY"
              ? "bg-signal px-2 py-0.5 font-bold text-signal-foreground"
              : "border border-signal px-2 py-0.5 text-signal"
          }
          aria-live="polite"
        >
          {status}
        </span>
      </div>

      <div className="relative mt-8 flex flex-col gap-6 sm:flex-row sm:justify-between sm:gap-0">
        {/* track */}
        <span
          className="absolute left-6 top-6 bottom-6 w-px bg-current opacity-20 sm:bottom-auto sm:left-6 sm:right-6 sm:h-px sm:w-auto"
          aria-hidden
        />
        <motion.span
          className="absolute left-6 top-6 hidden h-px origin-left bg-signal sm:block"
          style={{ right: "1.5rem" }}
          initial={false}
          animate={{ scaleX: step < 0 ? 0 : pos }}
          transition={{ duration: reduce ? 0 : STEP / 1000, ease: "linear" }}
          aria-hidden
        />
        {!reduce && step >= 0 && step < NODES.length && (
          <motion.span
            className="flow-dot absolute top-6 hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 sm:block"
            initial={false}
            animate={{ left: `calc(1.5rem + (100% - 3rem) * ${pos})` }}
            transition={{ duration: STEP / 1000, ease: "linear" }}
            aria-hidden
          />
        )}
        {NODES.map((n, i) => {
          const on = i === step;
          const done = step > i;
          const Icon = n.icon;
          return (
            <div
              key={n.label}
              className="relative z-10 flex items-center gap-4 sm:flex-col sm:gap-3"
            >
              <div
                className={`flow-node flex h-12 w-12 items-center justify-center border-2 bg-surface ${on ? "is-on" : done ? "border-signal text-signal" : "hairline"}`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <span
                className={`text-[10px] uppercase tracking-widest ${on ? "text-signal" : "dim"}`}
              >
                {n.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-8 border-t hairline pt-4 text-[11px] dim">
        <span className="text-signal">✓</span> 13/13 pods healthy · p99 182ms · 0 rollbacks
      </p>
    </div>
  );
}
