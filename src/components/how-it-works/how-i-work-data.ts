export interface ProcessStep {
  readonly num: string;
  readonly title: string;
  readonly cmd: string;
  readonly desc: string;
  readonly res: string;
  readonly gridClass: string;
}

export interface ConnectorItem {
  readonly index: number;
  readonly direction: "right" | "down" | "left";
  readonly gridClass: string;
}

export interface ResolutionStat {
  readonly value: string;
  readonly label: string;
}

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    num: "1",
    title: "1. Understand",
    cmd: "$ runbook understand --incident",
    desc: "Map failure domains, SLO targets, and real developer bottlenecks before touching YAML.",
    res: "failure domains mapped · 3 bottlenecks identified",
    gridClass: "min-[860px]:[grid-column:1] min-[860px]:[grid-row:1]",
  },
  {
    num: "2",
    title: "2. Plan",
    cmd: "$ plan review --blast-radius",
    desc: "Draft small, reversible architecture plans with explicit blast-radius and rollback bounds.",
    res: "architecture approved · rollback verified",
    gridClass: "min-[860px]:[grid-column:3] min-[860px]:[grid-row:1]",
  },
  {
    num: "3",
    title: "3. Delegate / Build",
    cmd: "$ scaffold golden-path --module=core",
    desc: "Codify golden paths, reusable Terraform modules, and automated CI/CD workflows.",
    res: "3 modules codified · pipeline green",
    gridClass: "min-[860px]:[grid-column:5] min-[860px]:[grid-row:1]",
  },
  {
    num: "4",
    title: "4. Review",
    cmd: "$ chaos test --dry-run --policy=strict",
    desc: "Enforce policy-as-code checks, dry-run diffs, and failure-injection drills in staging.",
    res: "policy checks passed · 0 violations",
    gridClass: "min-[860px]:[grid-column:5] min-[860px]:[grid-row:3]",
  },
  {
    num: "5",
    title: "5. Measure",
    cmd: "$ slo verify --p99 --window=30d",
    desc: "Verify deploy lead time, error-budget burn, and p99 latency against production SLOs.",
    res: "p99 < 85ms · 99.95% SLO held",
    gridClass: "min-[860px]:[grid-column:3] min-[860px]:[grid-row:3]",
  },
];

export const FLOW_CONNECTORS: readonly ConnectorItem[] = [
  {
    index: 0,
    direction: "right",
    gridClass: "min-[860px]:[grid-column:2] min-[860px]:[grid-row:1]",
  },
  {
    index: 1,
    direction: "right",
    gridClass: "min-[860px]:[grid-column:4] min-[860px]:[grid-row:1]",
  },
  {
    index: 2,
    direction: "down",
    gridClass: "min-[860px]:[grid-column:5] min-[860px]:[grid-row:2]",
  },
  {
    index: 3,
    direction: "left",
    gridClass: "min-[860px]:[grid-column:4] min-[860px]:[grid-row:3]",
  },
  {
    index: 4,
    direction: "left",
    gridClass: "min-[860px]:[grid-column:2] min-[860px]:[grid-row:3]",
  },
];

export const RESOLUTION_STATS: readonly ResolutionStat[] = [
  { value: "3", label: "bottlenecks resolved" },
  { value: "0", label: "policy violations" },
  { value: "< 85ms", label: "p99 latency" },
  { value: "99.95%", label: "SLO held" },
];
