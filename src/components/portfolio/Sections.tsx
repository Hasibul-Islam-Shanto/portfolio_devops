import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowUpRight, Activity, Layers, Network, Eye, Cloud, type LucideIcon } from "lucide-react";

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
  return (
    <div className="mx-auto max-w-7xl px-5 py-28">
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
                variants={reveal}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-10%" }}
                onMouseEnter={() => setHot(g.name)}
                onFocus={() => setHot(g.name)}
                tabIndex={0}
                className={`relative border-2 p-6 transition-all duration-300 focus-visible:outline-none ${on ? "border-signal -translate-y-1" : "hairline"}`}
              >
                {featured && (
                  <span className="absolute right-3 top-3 bg-signal px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-signal-foreground">
                    Core
                  </span>
                )}
                <div
                  className={`flex h-14 w-14 items-center justify-center border-2 transition-colors duration-300 ${on ? "border-signal text-signal" : "hairline"}`}
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
  return (
    <div className="mx-auto grid max-w-7xl gap-16 px-5 py-28 lg:grid-cols-[1.2fr_1fr] lg:items-center">
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
              variants={reveal}
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

export function Contact() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-32">
      <p className="font-mono text-xs uppercase tracking-[0.25em]">04 / Scale</p>
      <h2 className="mt-6 text-[clamp(26px,3vw,40px)] font-bold leading-[1.1] tracking-tight">
        Ready to scale what you've built?
      </h2>
      <div className="mt-12 flex flex-wrap items-center gap-8">
        <a
          href="mailto:hello@shanto.dev"
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
