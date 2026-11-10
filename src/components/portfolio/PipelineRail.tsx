import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { STAGES } from "./Header";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/**
 * Fixed vertical pipeline rail on the right edge. Tracks scroll position in both
 * directions: the line fills top-down and the active stage follows the section
 * crossing the middle of the viewport.
 */
export function PipelineRail() {
  const reduce = useReducedMotion();
  const raw = useMotionValue(0);
  const smooth = useSpring(raw, { stiffness: 140, damping: 26 });
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const els = STAGES.map((s) => document.getElementById(s.id));
      if (els.some((e) => !e)) return;
      const y = window.scrollY;
      const mid = y + window.innerHeight * 0.5;
      const tops = els.map((e) => e!.getBoundingClientRect().top + y);
      const hero = els[0]!.offsetHeight;
      setVisible(y > hero * 0.5);

      const atBottom = y + window.innerHeight >= document.documentElement.scrollHeight - 2;
      let idx = 0;
      tops.forEach((t, i) => {
        if (mid >= t) idx = i;
      });
      let progress: number;
      if (atBottom) {
        idx = STAGES.length - 1;
        progress = 1;
      } else if (idx >= STAGES.length - 1) {
        progress = 1;
      } else {
        const from = tops[idx] ?? 0;
        const to = tops[idx + 1] ?? from + 1;
        const part = Math.min(1, Math.max(0, (mid - from) / (to - from)));
        progress = (idx + part) / (STAGES.length - 1);
      }
      setActive(idx);
      raw.set(progress);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [raw]);

  const t = reduce ? { duration: 0 } : { duration: 0.45, ease: EASE };

  return (
    <div className="rail-float pointer-events-none fixed bottom-8 right-3 top-28 z-40 hidden md:block lg:right-6">
      <motion.nav
        aria-label="Pipeline progress"
        initial={false}
        animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 24 }}
        transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE }}
        className={`h-full ${visible ? "pointer-events-auto" : ""}`}
        aria-hidden={!visible}
      >
        <ol className="relative flex h-full flex-col justify-between">
          <span
            className="absolute bottom-2 right-[5.5px] top-2 w-px bg-current opacity-40"
            aria-hidden
          />
          <motion.span
            style={{ scaleY: reduce ? raw : smooth }}
            className="absolute bottom-2 right-[5.5px] top-2 w-px origin-top bg-signal"
            aria-hidden
          />
          {STAGES.map((s, i) => {
            const on = i === active;
            return (
              <li key={s.id} className="relative z-10 h-4">
                <a
                  href={`#${s.id}`}
                  tabIndex={visible ? 0 : -1}
                  aria-current={on ? "step" : undefined}
                  className="flex h-4 items-center justify-end gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                >
                  <motion.span
                    initial={false}
                    animate={{ opacity: on ? 1 : 0.55, x: on ? -2 : 0 }}
                    transition={t}
                    className={`hidden font-mono text-[10px] uppercase tracking-widest lg:inline ${on ? "text-signal" : ""}`}
                  >
                    {s.label}
                  </motion.span>
                  <span className="sr-only lg:hidden">{s.label}</span>
                  <motion.span
                    initial={false}
                    animate={{ scale: on ? 1.45 : 1 }}
                    transition={t}
                    className={`block h-3 w-3 shrink-0 rounded-full border-2 ${
                      on ? "border-signal bg-signal rail-active" : "border-current bg-transparent"
                    } ${reduce ? "" : "transition-colors duration-300"}`}
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </motion.nav>
    </div>
  );
}
