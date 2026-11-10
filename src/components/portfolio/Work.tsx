import { motion, useInView } from "framer-motion";
import { useRef } from "react";
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
    cmd: "chaos run az-failure.yaml",
    res: "✓ steady state held · 0 errors",
  },
];

function Card({ p, i }: { p: (typeof PROJECTS)[number]; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const cmd = useTyped(`$ ${p.cmd}`, inView, 22);
  const res = useTyped(p.res, cmd.done, 18);
  const tone = `tone-m-${i % 2} tone-d-${(Math.floor(i / 2) + (i % 2)) % 2}`;

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (i % 2) * 0.15, ease: [0.2, 0.8, 0.2, 1] }}
      tabIndex={0}
      data-cursor-interactive="true"
      data-cursor-label="VIEW ↗"
      className={`${tone} section-surface glow-hover group flex flex-col border hairline p-7 focus-visible:outline-2 focus-visible:outline-signal`}
    >
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest">
        <span className="text-signal">
          {p.stage} / {p.cat}
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
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4 + j * 0.1 }}
            className="border hairline px-2.5 py-1 font-mono text-[10px] uppercase transition-colors group-hover:border-signal"
          >
            {t}
          </motion.li>
        ))}
      </ul>
      <div className="mt-6 border-t hairline pt-4 font-mono text-[11px] leading-5">
        <div className="truncate dim">{cmd.out}</div>
        <div className="truncate text-signal">
          {res.out}
          {!res.done && <span className="cursor">▋</span>}
        </div>
      </div>
    </motion.article>
  );
}

export function Work() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-28">
      <p className="font-mono text-xs uppercase tracking-[0.25em] dim">01 / The work</p>
      <h2 className="mt-4 max-w-3xl text-[clamp(26px,3vw,40px)] font-bold leading-[1.1] tracking-tight">
        Six systems, each <span className="text-signal">tested</span> in production.
      </h2>
      <div className="mt-14 grid md:grid-cols-2">
        {PROJECTS.map((p, i) => (
          <Card key={p.title} p={p} i={i} />
        ))}
      </div>
    </div>
  );
}
