import { motion, useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Activity,
  Layers,
  Network,
  Eye,
  Cloud,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

const PROCESS_STEPS = [
  {
    num: "01",
    title: "Understand",
    desc: "Map failure domains, SLO targets, and real developer bottlenecks before touching YAML.",
  },
  {
    num: "02",
    title: "Plan",
    desc: "Draft small, reversible architecture plans with explicit blast-radius and rollback bounds.",
  },
  {
    num: "03",
    title: "Delegate / Build",
    desc: "Codify golden paths, reusable Terraform modules, and automated CI/CD workflows.",
  },
  {
    num: "04",
    title: "Review",
    desc: "Enforce policy-as-code checks, dry-run diffs, and failure-injection drills in staging.",
  },
  {
    num: "05",
    title: "Measure",
    desc: "Verify deploy lead time, error-budget burn, and p99 latency against production SLOs.",
  },
] as const;

export function HowIWork() {
  const reduce = Boolean(useReducedMotion());

  return (
    <div className="mx-auto max-w-6xl px-5 py-28">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
        Process / Execution model
      </p>
      <h2 className="mt-4 max-w-3xl text-[clamp(26px,3vw,40px)] font-bold leading-[1.1] tracking-tight">
        How I <span className="text-signal">work</span> from incident to system.
      </h2>

      <ol className="mt-14 grid gap-8 md:grid-cols-5 md:gap-5">
        {PROCESS_STEPS.map((step, i) => {
          const isLast = i === PROCESS_STEPS.length - 1;
          return (
            <motion.li
              key={step.num}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={
                reduce
                  ? { duration: 0.2 }
                  : { delay: i * 0.1, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }
              }
              className="relative flex flex-col"
            >
              <div className="flex items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border hairline bg-surface font-mono text-sm font-bold text-signal">
                  {step.num}
                </div>
                {!isLast && (
                  <div className="hidden flex-1 items-center pl-2 pr-1 md:flex" aria-hidden="true">
                    <span className="h-px flex-1 bg-current opacity-25" />
                    <svg viewBox="0 0 8 8" className="h-2 w-2 shrink-0 fill-current opacity-45">
                      <path d="M0 0 L8 4 L0 8 Z" />
                    </svg>
                  </div>
                )}
              </div>

              <h3 className="mt-5 text-lg font-bold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed dim">{step.desc}</p>

              {!isLast && (
                <div
                  className="mt-5 flex items-center gap-1.5 font-mono text-[10px] dim md:hidden"
                  aria-hidden="true"
                >
                  <span className="h-4 w-px bg-current opacity-30" />
                  <span>↓</span>
                </div>
              )}
            </motion.li>
          );
        })}
      </ol>

      <blockquote className="mt-14 border-t hairline pt-8 text-lg italic leading-relaxed md:text-xl">
        “Every pipeline I ship has one clear owner until it runs quietly in production —{" "}
        <span className="font-bold not-italic text-signal">
          if it pages at 3am, it pages me first.
        </span>
        ”
      </blockquote>
    </div>
  );
}

const ICONS: Record<string, LucideIcon> = {
  "CI/CD": Activity,
  Infrastructure: Layers,
  Orchestration: Network,
  Observability: Eye,
  Cloud,
};
const GROUPS = [
  { name: "CI/CD", tools: ["GitHub Actions", "GitLab CI", "Buildkite", "Jenkins"] },
  { name: "Infrastructure", tools: ["Terraform", "Pulumi", "Ansible", "Packer"] },
  { name: "Orchestration", tools: ["Kubernetes", "Helm", "Argo CD", "Istio"] },
  { name: "Observability", tools: ["Prometheus", "Grafana", "Loki", "OpenTelemetry"] },
  { name: "Cloud", tools: ["AWS", "GCP", "Cloudflare", "Vault"] },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6 } }),
};

export function Toolchain() {
  const [hot, setHot] = useState<string | null>(null);
  const reduce = Boolean(useReducedMotion());
  return (
    <div className="mx-auto max-w-6xl px-5 py-28">
      <p className="font-mono text-xs uppercase tracking-[0.25em] dim">02 / The toolchain</p>
      <h2 className="mt-4 max-w-3xl text-[clamp(26px,3vw,40px)] font-bold leading-[1.1] tracking-tight">
        Every layer, <span className="text-signal">deployed</span> with intent.
      </h2>
      <div
        className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        onMouseLeave={() => setHot(null)}
      >
        {GROUPS.map((g, i) =>
          (() => {
            const Icon = ICONS[g.name] ?? Activity;
            const featured = g.name === "Infrastructure";
            const on = hot === g.name || (!hot && featured);
            return (
              <motion.div
                key={g.name}
                custom={i}
                variants={
                  reduce
                    ? {
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { duration: 0.2 } },
                      }
                    : reveal
                }
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-10%" }}
                onMouseEnter={() => setHot(g.name)}
                onFocus={() => setHot(g.name)}
                tabIndex={0}
                data-cursor-interactive="true"
                className={`relative rounded-3xl border-2 p-6 transition-all duration-300 focus-visible:outline-none ${on ? "border-signal -translate-y-1" : "hairline"}`}
              >
                {featured && (
                  <span className="absolute right-3.5 top-3.5 rounded-full bg-signal px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase text-signal-foreground">
                    Core
                  </span>
                )}
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-colors duration-300 ${on ? "border-signal text-signal" : "hairline"}`}
                >
                  <Icon className="h-7 w-7" strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="mt-6 font-mono text-xs uppercase tracking-widest text-signal">
                  {g.name}
                </h3>
                <ul className="mt-4 space-y-2.5 border-t hairline pt-4 text-base font-medium">
                  {g.tools.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </motion.div>
            );
          })(),
        )}
      </div>
    </div>
  );
}

const CERTIFICATIONS = [
  {
    name: "[Certification Name — e.g. AWS Solutions Architect]",
    year: "[Year]",
  },
  {
    name: "[Certification Name — e.g. Certified Kubernetes Administrator]",
    year: "[Year]",
  },
  {
    name: "[Certification Name — e.g. HashiCorp Terraform Associate]",
    year: "[Year]",
  },
  {
    name: "[Certification Name — e.g. Prometheus Certified Associate]",
    year: "[Year]",
  },
] as const;

export function Certifications() {
  const reduce = Boolean(useReducedMotion());

  return (
    <div className="mx-auto max-w-6xl px-5 py-28">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal">Verified skills</p>
      <h2 className="mt-4 max-w-3xl text-[clamp(26px,3vw,40px)] font-bold leading-[1.1] tracking-tight">
        Certifications
      </h2>
      <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {CERTIFICATIONS.map((cert, i) => (
          <motion.article
            key={cert.name}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={
              reduce
                ? { duration: 0.2 }
                : { delay: i * 0.1, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }
            }
            tabIndex={0}
            data-cursor-interactive="true"
            className="group flex flex-col justify-between rounded-3xl border hairline p-6 transition-colors duration-300 hover:border-signal focus-visible:border-signal focus-visible:outline-none"
          >
            <div>
              {/* Generic shield line-icon placeholder: swap for the real certification body's icon later */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border hairline bg-surface text-signal transition-colors duration-300 group-hover:border-signal">
                <ShieldCheck className="h-6 w-6" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="mt-6 text-base font-bold leading-snug tracking-tight sm:text-lg">
                {cert.name}
              </h3>
            </div>
            <p className="mt-6 border-t hairline pt-4 font-mono text-xs uppercase tracking-widest dim">
              Issued · <span className="text-signal">{cert.year}</span>
            </p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

const EXPERIENCE_ROLES = [
  {
    period: "[Month Year] – Present",
    company: "[Company Name]",
    orgTag: "[Team/Org tag]",
    location: "[Remote / City]",
    role: "[Job Title]",
    current: true,
    bullets: [
      "[Shipped/built X — describe the system and its measurable impact]",
      "[Reduced/improved Y by Z% — describe the specific technical change]",
      "[Automated/scaled W across N environments — describe reliability outcome]",
    ],
    tags: ["[Tech]", "[Tech]", "[Tech]", "[Tech]"],
  },
  {
    period: "[Year] – [Year]",
    company: "[Company Name]",
    orgTag: "[Team/Org tag]",
    location: "[Remote / City]",
    role: "[Job Title]",
    current: false,
    bullets: [
      "[Shipped/built X — describe the system and its measurable impact]",
      "[Reduced/improved Y by Z% — describe the specific technical change]",
      "[Standardized CI/CD or infrastructure workflow across engineering teams]",
    ],
    tags: ["[Tech]", "[Tech]", "[Tech]", "[Tech]"],
  },
  {
    period: "[Year] – [Year]",
    company: "[Company Name]",
    orgTag: "[Team/Org tag]",
    location: "[Remote / City]",
    role: "[Job Title]",
    current: false,
    bullets: [
      "[Shipped/built X — describe the system and its measurable impact]",
      "[Reduced/improved Y by Z% — describe the specific technical change]",
    ],
    tags: ["[Tech]", "[Tech]", "[Tech]"],
  },
] as const;

function ExperienceCard({
  item,
  index,
  reduce,
}: {
  item: (typeof EXPERIENCE_ROLES)[number];
  index: number;
  reduce: boolean;
}) {
  const rowRef = useRef<HTMLLIElement>(null);
  const inView = useInView(rowRef, { once: true, margin: "-12% 0px" });
  const delay = reduce ? 0 : index * 0.12;

  return (
    <li ref={rowRef} className="relative grid gap-3 pl-6 md:grid-cols-[20%_1fr] md:gap-8">
      {/* Left column: rounded marker on the vertical rail + date range */}
      <div className="relative pt-1">
        <motion.span
          initial={reduce ? { opacity: 0, scale: 1 } : { opacity: 0, scale: 0 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={
            reduce ? { duration: 0.2 } : { delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }
          }
          className={`-left-6 top-2 block h-3 w-3 rounded-full bg-signal ${
            item.current ? "ring-2 ring-current/25" : ""
          }`}
          style={{ position: "absolute" }}
          aria-hidden="true"
        />
        <span
          className={`block font-mono text-xs uppercase tracking-wider ${
            item.current ? "font-bold text-signal" : "dim"
          }`}
        >
          {item.period}
        </span>
      </div>

      {/* Right column: role card */}
      <motion.article
        initial={reduce ? { opacity: 0 } : { opacity: 0, x: 36 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={
          reduce ? { duration: 0.2 } : { delay, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }
        }
        tabIndex={0}
        data-cursor-interactive="true"
        className={`panel group rounded-3xl border p-6 transition-colors duration-300 hover:border-signal focus-visible:border-signal focus-visible:outline-none md:p-7 ${
          item.current ? "border-2 border-signal" : "hairline"
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-xl font-bold tracking-tight md:text-2xl">{item.company}</h3>
            <span className="rounded-full border hairline px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-signal">
              {item.orgTag}
            </span>
          </div>
          <span className="rounded-full border hairline px-3 py-1 font-mono text-[10px] uppercase tracking-wider dim">
            {item.location}
          </span>
        </div>

        <p className="mt-1.5 text-base font-medium">{item.role}</p>

        <ul className="mt-5 space-y-2.5 text-sm leading-relaxed">
          {item.bullets.map((bullet, bIdx) => (
            <li key={bIdx} className="flex items-start gap-3">
              <span
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal"
                aria-hidden="true"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <ul className="mt-6 flex flex-wrap gap-2 border-t hairline pt-4">
          {item.tags.map((t, tIdx) => (
            <li
              key={tIdx}
              className="rounded-full border hairline px-3 py-1 font-mono text-[10px] uppercase transition-colors group-hover:border-signal"
            >
              {t}
            </li>
          ))}
        </ul>
      </motion.article>
    </li>
  );
}

export function Experience() {
  const reduce = Boolean(useReducedMotion());
  const timelineRef = useRef<HTMLOListElement>(null);
  const rawProgress = useMotionValue(0);
  const smoothProgress = useSpring(rawProgress, { stiffness: 140, damping: 28 });

  useEffect(() => {
    if (reduce) {
      rawProgress.set(1);
      return;
    }
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = timelineRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(1, rect.height);
      const triggerY = window.innerHeight * 0.65;
      const scrolled = triggerY - rect.top;
      const progress = Math.min(1, Math.max(0, scrolled / total));
      rawProgress.set(progress);
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
  }, [rawProgress, reduce]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-28">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal">
        Professional journey
      </p>
      <h2 className="mt-4 max-w-3xl text-[clamp(26px,3vw,40px)] font-bold leading-[1.1] tracking-tight">
        Experience
      </h2>

      <ol ref={timelineRef} className="relative mt-14 space-y-8">
        {/* Static ink-navy timeline rail track */}
        <span
          className="absolute bottom-2 left-[5.5px] top-2 w-px bg-current opacity-20"
          aria-hidden="true"
        />
        {/* Scroll-synced coral-red vertical line draw */}
        <motion.span
          style={{ scaleY: reduce ? 1 : smoothProgress }}
          className="absolute bottom-2 left-[5.5px] top-2 w-px origin-top bg-signal"
          aria-hidden="true"
        />

        {EXPERIENCE_ROLES.map((item, i) => (
          <ExperienceCard key={i} item={item} index={i} reduce={reduce} />
        ))}
      </ol>

      <div className="mt-10 pl-6 md:pl-[calc(20%+3.5rem)]">
        <a
          href="#"
          data-cursor-cta="true"
          data-cursor-label="CV ↗"
          className="inline-block rounded-full bg-signal px-6 py-3 font-mono text-sm font-bold uppercase text-signal-foreground transition-transform hover:-translate-y-0.5"
        >
          View Full Experience →
        </a>
      </div>
    </div>
  );
}

const PRINCIPLES = [
  [
    "Design for reliability",
    "Assume every dependency fails. Budget errors, rehearse recovery, and make the safe path the default one.",
  ],
  [
    "Automate the repeatable",
    "If I've done it twice by hand, the third time is a pipeline. Toil is a bug with a ticket number.",
  ],
  [
    "Keep changes reviewable",
    "Small diffs, readable plans, versioned everything. Production should never surprise the person who changed it.",
  ],
];

export function About() {
  const reduce = Boolean(useReducedMotion());
  return (
    <div className="mx-auto grid max-w-6xl gap-16 px-5 py-28 lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] dim">03 / Principles</p>
        <h2 className="mt-4 text-[clamp(26px,3vw,40px)] font-bold leading-[1.1] tracking-tight">
          Calm systems are <span className="text-signal">monitored</span> systems.
        </h2>
        <p className="mt-6 max-w-xl text-lg dim">
          Eight years running platforms for fintech and e-commerce teams — from the first Dockerfile
          to multi-region Kubernetes serving 40M requests a day. I care about boring deploys, honest
          dashboards and docs people actually read.
        </p>
        <ol className="mt-10 space-y-6">
          {PRINCIPLES.map(([t, d], i) => (
            <motion.li
              key={t}
              custom={i}
              variants={
                reduce
                  ? {
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { duration: 0.2 } },
                    }
                  : reveal
              }
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-10%" }}
              className="grid grid-cols-[3rem_1fr] border-t hairline pt-5"
            >
              <span className="font-mono text-sm text-signal">0{i + 1}</span>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">{t}</h3>
                <p className="mt-1 dim">{d}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-sm" aria-hidden>
        <div className="spin-slow absolute inset-0 rounded-full border border-dashed hairline">
          {[0, 120, 240].map((d) => (
            <span
              key={d}
              className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal"
              style={{ transform: `rotate(${d}deg) translateY(-50%) translateY(-9rem)` }}
            />
          ))}
        </div>
        <div className="spin-rev absolute inset-[22%] rounded-full border hairline">
          {[60, 240].map((d) => (
            <span
              key={d}
              className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-current"
              style={{ transform: `rotate(${d}deg) translateY(-5.5rem)` }}
            />
          ))}
        </div>
        <div className="absolute inset-[40%] flex items-center justify-center rounded-full bg-signal font-mono text-[10px] font-bold uppercase text-signal-foreground">
          core
        </div>
      </div>
    </div>
  );
}

const TESTIMONIALS = [
  {
    quote:
      "[Placeholder quote — ask a former manager or teammate for a short testimonial about working with you]",
    author: "[Name Surname] — [Role, Company]",
    dark: true,
  },
  {
    quote:
      "[Placeholder quote — ask a former manager or teammate for a short testimonial about working with you]",
    author: "[Name Surname] — [Role, Company]",
    dark: false,
  },
  {
    quote:
      "[Placeholder quote — ask a former manager or teammate for a short testimonial about working with you]",
    author: "[Name Surname] — [Role, Company]",
    dark: true,
  },
] as const;

export function Testimonials() {
  const reduce = Boolean(useReducedMotion());

  return (
    <div className="mx-auto max-w-6xl px-5 py-28">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-signal">Social proof</p>
      <h2 className="mt-4 max-w-3xl text-[clamp(26px,3vw,40px)] font-bold leading-[1.1] tracking-tight">
        What people say
      </h2>
      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((item, i) => (
          <motion.blockquote
            key={i}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={
              reduce
                ? { duration: 0.2 }
                : { duration: 0.6, delay: i * 0.15, ease: [0.2, 0.8, 0.2, 1] }
            }
            data-cursor-interactive="true"
            className={`${item.dark ? "mode-dark" : "mode-light"} section-surface relative flex flex-col justify-between rounded-3xl border hairline p-7 transition-colors duration-300 hover:border-signal`}
          >
            <div>
              <span
                className="block font-display text-6xl font-bold leading-none text-signal opacity-25 select-none"
                aria-hidden="true"
              >
                “
              </span>
              <p className="mt-2 text-base leading-relaxed">{item.quote}</p>
            </div>
            <footer className="mt-8 border-t hairline pt-4 font-mono text-xs uppercase tracking-wider text-signal">
              {item.author}
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </div>
  );
}

export function Contact() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-32">
      <p className="font-mono text-xs uppercase tracking-[0.25em]">04 / Scale</p>
      <h2 className="mt-6 text-[clamp(26px,3vw,40px)] font-bold leading-[1.1] tracking-tight">
        Ready to scale what you've built?
      </h2>
      <div className="mt-12 flex flex-wrap items-center gap-8">
        <a
          href="mailto:hello@shanto.dev"
          data-cursor-cta="true"
          data-cursor-label="MAIL ↗"
          className="group inline-flex items-center gap-3 rounded-full bg-surface-foreground px-8 py-4 font-mono text-sm font-bold uppercase text-surface transition-transform hover:-translate-y-1"
        >
          Start a conversation
          <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
        </a>
        <div className="font-mono text-sm">
          <div>hello@shanto.dev</div>
          <div className="mt-1 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="pulse-ring absolute inset-0 rounded-full bg-surface-foreground" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-surface-foreground" />
            </span>
            Available for Q1 2027 · remote
          </div>
        </div>
      </div>
      <p className="mt-24 border-t border-current/30 pt-6 font-mono text-[11px] uppercase tracking-widest">
        © 2026 Shanto · uptime 99.99% · built & deployed via pipeline
      </p>
    </div>
  );
}
