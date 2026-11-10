import { motion, useReducedMotion } from "framer-motion";
import { HeroTerminal } from "./HeroTerminal";

export function Hero() {
  const lines = [
    { words: ["Making", "complex"], signal: false },
    { words: ["systems", "run", "like"], signal: true },
    { words: ["they", "should."], signal: false },
  ] as const;
  const reduce = Boolean(useReducedMotion());
  let wordIndex = 0;

  return (
    <div className="relative flex min-h-screen w-full items-center bg-[#10151F] pt-28 pb-12 lg:min-h-[100dvh] lg:pt-20 lg:pb-10">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-4 lg:grid-cols-[1.04fr_1.15fr] lg:items-center lg:gap-14">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] dim">
            00 / Platform engineer · Dhaka → Remote
          </p>
          <h1 className="mt-5 text-[clamp(40px,5vw,60px)] font-bold leading-[1.08] tracking-tight">
            {lines.map((line, lineIdx) => (
              <span key={lineIdx} className={`block ${line.signal ? "text-signal" : ""}`}>
                {line.words.map((w) => {
                  const i = wordIndex++;
                  return (
                    <motion.span
                      key={w}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        reduce
                          ? { duration: 0.2 }
                          : { delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }
                      }
                      className="mr-[0.22em] inline-block last:mr-0"
                    >
                      {w}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed dim sm:text-[17px]">
            I build the pipelines, platforms and guardrails that let product teams ship ten times a
            day without paging anyone at 3am.
          </p>
          <div className="mt-7 flex flex-wrap gap-3.5">
            <a
              href="#test"
              data-cursor-cta="true"
              data-cursor-label="WORK ↓"
              className="rounded-full bg-signal px-6 py-3 font-mono text-xs font-bold uppercase text-signal-foreground transition-transform hover:-translate-y-0.5 sm:text-sm"
            >
              View the work →
            </a>
            <a
              href="#scale"
              data-cursor-cta="true"
              data-cursor-label="TALK"
              className="rounded-full border-2 border-current px-6 py-3 font-mono text-xs font-bold uppercase transition-colors hover:border-signal hover:text-signal sm:text-sm"
            >
              Get in touch
            </a>
          </div>
        </div>
        <motion.div
          className="min-w-0"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0.2 } : { delay: 0.5, duration: 0.7 }}
        >
          <HeroTerminal />
        </motion.div>
      </div>
      <a
        href="#test"
        data-cursor-label="↓"
        className="scroll-cue absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-widest dim"
      >
        scroll ↓
      </a>
    </div>
  );
}
