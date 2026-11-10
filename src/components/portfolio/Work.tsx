import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ConstellationCanvas } from "./ConstellationCanvas";
import { useTyped } from "./hooks";

const PROJECTS = [
  {
    stage: "Build",
    cat: "CI/CD",
    title: "Monorepo pipeline rebuild",
    frame: "Cut a 41-minute pipeline to 7 for 120 engineers.",
    p: "Serial jobs, flaky tests and no caching blocked every merge.",
    a: "Affected-graph builds, remote cache, test sharding across spot runners.",
    o: "−83% build time, 3× deploy frequency, $14k/mo saved.",
    tags: ["GitHub Actions", "Bazel", "Buildkite"],
    flow: ["Commit", "Build", "Test", "Deploy"],
    cmd: "gh workflow run release.yml",
    res: "✓ 7m02s · 1,284 tests passed",
  },
  {
    stage: "Build",
    cat: "IaC",
    title: "Terraform landing zone",
    frame: "Every cloud account, born compliant.",
    p: "Click-ops accounts drifted; audits took weeks.",
    a: "Module registry, policy-as-code, plan reviews in PRs.",
    o: "42 accounts codified, zero drift, SOC2 in one quarter.",
    tags: ["Terraform", "OPA", "Atlantis"],
    flow: ["Plan", "Review", "Apply", "Verify"],
    cmd: "terraform plan -out=release.plan",
    res: "✓ plan ready · 0 destroys",
  },
  {
    stage: "Deploy",
    cat: "Kubernetes",
    title: "Internal developer platform",
    frame: "Golden paths from repo to production in a day.",
    p: "Each team hand-rolled manifests and ingress.",
    a: "EKS multi-tenant clusters, Helm templates, Backstage scaffolds.",
    o: "New service onboarding: 3 weeks → 4 hours.",
    tags: ["EKS", "Helm", "Backstage"],
    flow: ["Manifest", "Helm", "Rollout", "Healthy"],
    cmd: "kubectl rollout status deploy/api",
    res: "✓ successfully rolled out · 6/6",
  },
  {
    stage: "Monitor",
    cat: "Observability",
    title: "SLO-first monitoring",
    frame: "Fewer alerts, faster answers.",
    p: "900 noisy alerts; MTTR over an hour.",
    a: "OpenTelemetry tracing, burn-rate alerts, shared dashboards.",
    o: "−70% pages, MTTR down to 11 minutes.",
    tags: ["Prometheus", "Grafana", "OTel"],
    flow: ["Metric", "Alert", "Triage", "Resolve"],
    cmd: "promtool check rules slo.yml",
    res: "✓ SUCCESS · 24 rules found",
  },
  {
    stage: "Deploy",
    cat: "GitOps",
    title: "Declarative releases",
    frame: "Git is the only way into production.",
    p: "Manual kubectl applies and unknown cluster state.",
    a: "Argo CD app-of-apps, progressive canaries, auto-rollback.",
    o: "400+ deploys/week, 0 manual cluster writes.",
    tags: ["Argo CD", "Argo Rollouts", "Kustomize"],
    flow: ["Push", "Sync", "Reconcile", "Live"],
    cmd: "argocd app sync payments",
    res: "✓ Synced · Healthy · canary 100%",
  },
  {
    stage: "Test",
    cat: "Chaos",
    title: "Game-day program",
    frame: "Break it on Tuesday so it holds on Black Friday.",
    p: "Failover was untested and assumed.",
    a: "Scheduled chaos experiments, AZ evacuation drills, runbooks.",
    o: "Survived a full AZ outage with zero customer impact.",
    tags: ["Chaos Mesh", "Litmus", "k6"],
    flow: ["Hypothesis", "Inject", "Observe", "Recover"],
    cmd: "chaos run az-failure.yaml",
    res: "✓ steady state held · 0 errors",
  },
];

const MINI_STEP_MS = 220;

function MiniProjectFlow({
  nodes,
  active,
  reduce,
}: {
  nodes: readonly string[];
  active: boolean;
  reduce: boolean;
}) {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    if (!active || reduce) {
      setStep(-1);
      return;
    }
    setStep(0);
    let current = 0;
    const id = window.setInterval(() => {
      current += 1;
      setStep(current);
      if (current >= nodes.length) {
        window.clearInterval(id);
      }
    }, MINI_STEP_MS);
    return () => window.clearInterval(id);
  }, [active, nodes.length, reduce]);

  const pos =
    step < 0 ? 0 : Math.max(0, Math.min(step, nodes.length - 1)) / Math.max(1, nodes.length - 1);

  return (
    <div className="mt-6 border-t hairline pt-4 font-mono" aria-label="Project pipeline stages">
      <div className="relative flex items-start justify-between">
        {/* Base connecting track */}
        <span
          className="absolute left-3.5 right-3.5 top-3.5 h-px bg-current opacity-20"
          aria-hidden
        />
        {/* Animated coral-red signal line */}
        <motion.span
          className="absolute left-3.5 right-3.5 top-3.5 h-px origin-left bg-signal"
          initial={false}
          animate={{ scaleX: step < 0 ? 0 : pos }}
          transition={{ duration: reduce ? 0 : MINI_STEP_MS / 1000, ease: "linear" }}
          aria-hidden
        />
        {/* Traveling coral-red signal dot */}
        {!reduce && step >= 0 && step < nodes.length && (
          <motion.span
            className="flow-dot absolute top-3.5 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            initial={false}
            animate={{ left: `calc(0.875rem + (100% - 1.75rem) * ${pos})` }}
            transition={{ duration: MINI_STEP_MS / 1000, ease: "linear" }}
            aria-hidden
          />
        )}
        {nodes.map((label, idx) => {
          const isOn = idx === step;
          const isDone = step > idx;
          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`flow-node flex h-7 w-7 items-center justify-center rounded-lg border bg-surface text-[10px] font-bold ${
                  isOn ? "is-on" : isDone ? "border-signal text-signal" : "hairline dim"
                }`}
              >
                0{idx + 1}
              </div>
              <span
                className={`text-[9px] uppercase tracking-wider ${
                  isOn || isDone ? "text-signal" : "dim"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({ p, i }: { p: (typeof PROJECTS)[number]; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = Boolean(useReducedMotion());
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [hovered, setHovered] = useState(false);
  const cmd = useTyped(`$ ${p.cmd}`, inView, 22);
  const res = useTyped(p.res, cmd.done, 18);

  return (
    <motion.article
      ref={ref}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={
        reduce
          ? { duration: 0.2 }
          : { duration: 0.6, delay: (i % 2) * 0.15, ease: [0.2, 0.8, 0.2, 1] }
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      data-cursor-interactive="true"
      className="work-card section-surface group flex flex-col rounded-3xl border hairline p-7 focus-visible:outline-none"
    >
      <ConstellationCanvas variant="card" active={hovered} className="z-0 rounded-[inherit]" />
      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest">
          <span className="flex items-center text-signal">
            <span className="work-cat-tick" aria-hidden="true" />
            <span>
              {p.stage} / {p.cat}
            </span>
          </span>
          <span className="dim">Project / {String(i + 1).padStart(2, "0")}</span>
        </div>
        <h3 className="mt-5 text-2xl font-bold tracking-tight">{p.title}</h3>
        <p className="mt-1 dim">{p.frame}</p>
        <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
          {[
            ["Problem", p.p],
            ["Approach", p.a],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[10px] uppercase tracking-widest dim">{k}</dt>
              <dd className="mt-1.5 leading-snug">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 font-medium text-signal">✓ Outcome: {p.o}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {p.tags.map((t, j) => (
            <motion.li
              key={t}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={reduce ? { duration: 0.2 } : { delay: 0.4 + j * 0.1 }}
              className="rounded-full border hairline px-3 py-1 font-mono text-[10px] uppercase transition-colors duration-250 group-hover:border-signal"
            >
              {t}
            </motion.li>
          ))}
        </ul>
        <MiniProjectFlow nodes={p.flow} active={hovered} reduce={reduce} />
        <div className="mt-4 border-t hairline pt-4 font-mono text-[11px] leading-5">
          <div className="truncate dim">{cmd.out}</div>
          <div className="work-result-line truncate text-signal">
            {res.out}
            {!res.done && <span className="cursor">▋</span>}
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <a
            href="/case-studies"
            className="work-case-link font-mono text-[11px] font-bold uppercase tracking-wider text-signal"
          >
            View case study →
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export function Work() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-28">
      <p className="font-mono text-xs uppercase tracking-[0.25em] dim">01 / The work</p>
      <h2 className="mt-4 max-w-3xl text-[clamp(26px,3vw,40px)] font-bold leading-[1.1] tracking-tight">
        Six systems, each <span className="text-signal">tested</span> in production.
      </h2>
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {PROJECTS.map((p, i) => (
          <Card key={p.title} p={p} i={i} />
        ))}
      </div>
    </div>
  );
}
