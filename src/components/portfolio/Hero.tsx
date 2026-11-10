import { motion } from "framer-motion";
import { DeployFlow } from "./DeployFlow";

export function Hero() {
  const words = ["Making", "complex", "systems", "run", "like", "they", "should."];
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
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
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
        </div>
        <motion.div
          className="min-w-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
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
