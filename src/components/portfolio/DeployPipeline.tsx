import { useReducedMotion } from "framer-motion";
import { useEffect, useState, type ComponentType } from "react";
import { SiGit, SiGithub, SiGithubactions, SiDocker, SiKubernetes } from "react-icons/si";
import { FlaskConical, Hammer, Package, Cloud, Server, Activity } from "lucide-react";

interface DiagramNode {
  id: string;
  label: string;
  x: number;
  y: number;
  labelAlign: "below-center" | "below-right" | "below-left";
  icon: ComponentType<{
    width?: number | string;
    height?: number | string;
    size?: number | string;
    className?: string;
    "aria-hidden"?: boolean;
  }>;
}

const NODE_SIZE = 60;
const STEP_MS = 900;

/**
 * 11 nodes arranged on an orthogonal grid (each 60x60px):
 * Row 0 (y=70):  GIT (x=20) -> GITHUB (x=200) -> CI (x=380)
 * Row 1 (y=210): CI connects down to TEST (x=380), TEST connects left to BUILD (x=200)
 * Row 2 (y=386): BUILD connects down to DOCKER (x=200) -> REGISTRY (x=380) -> DEPLOY (x=560)
 * Row 3 (y=558): DEPLOY connects down to K8S (x=560)
 * Row 4 (y=730): K8S connects down to APP (x=560), APP connects left to MONITOR (x=380)
 */
const PIPELINE_NODES: readonly DiagramNode[] = [
  { id: "git", label: "GIT", x: 20, y: 70, labelAlign: "below-center", icon: SiGit },
  { id: "github", label: "GITHUB", x: 200, y: 70, labelAlign: "below-center", icon: SiGithub },
  { id: "ci", label: "CI", x: 380, y: 70, labelAlign: "below-right", icon: SiGithubactions },
  { id: "test", label: "TEST", x: 380, y: 210, labelAlign: "below-center", icon: FlaskConical },
  { id: "build", label: "BUILD", x: 200, y: 210, labelAlign: "below-right", icon: Hammer },
  { id: "docker", label: "DOCKER", x: 200, y: 386, labelAlign: "below-center", icon: SiDocker },
  { id: "registry", label: "REGISTRY", x: 380, y: 386, labelAlign: "below-center", icon: Package },
  { id: "deploy", label: "DEPLOY", x: 560, y: 386, labelAlign: "below-right", icon: Cloud },
  { id: "k8s", label: "K8S", x: 560, y: 558, labelAlign: "below-right", icon: SiKubernetes },
  { id: "app", label: "APP", x: 560, y: 730, labelAlign: "below-center", icon: Server },
  { id: "monitor", label: "MONITOR", x: 380, y: 730, labelAlign: "below-center", icon: Activity },
] as const;

interface CategoryZone {
  label: string;
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
}

/**
 * Category zone headings positioned with >= 46px clearance above the topmost node
 * of their respective zone and >= 46px away from any previous row's node labels:
 * - SOURCE (y=24): 46px above GIT/GITHUB (y=70)
 * - CI PIPELINE (y=24): 46px above CI (y=70)
 * - ARTIFACTS · INFRA (y=340): 50px below TEST label (y=290), 46px above REGISTRY/DEPLOY (y=386)
 * - ORCHESTRATION (y=512): 46px below DEPLOY label (y=466), 46px above K8S node (y=558)
 * - RUNTIME (x=500, y=684): centered above MONITOR..APP row (y=730, 46px clearance),
 *   far to the right of the left-side dashed feedback loop (x=250..380)
 */
const CATEGORY_ZONES: readonly CategoryZone[] = [
  { label: "SOURCE", x: 20, y: 24, anchor: "start" },
  { label: "CI PIPELINE", x: 380, y: 24, anchor: "start" },
  { label: "ARTIFACTS · INFRA", x: 380, y: 340, anchor: "start" },
  { label: "ORCHESTRATION", x: 602, y: 512, anchor: "start" },
  { label: "RUNTIME", x: 500, y: 684, anchor: "middle" },
] as const;

/**
 * Computes exact straight horizontal/vertical segment endpoints terminating flush
 * at the outer edges of adjacent 60x60px square nodes.
 */
function getFlushConnectorCoords(from: DiagramNode, to: DiagramNode) {
  const fromCx = from.x + NODE_SIZE / 2;
  const fromCy = from.y + NODE_SIZE / 2;
  const toCx = to.x + NODE_SIZE / 2;
  const toCy = to.y + NODE_SIZE / 2;

  if (from.y === to.y) {
    // Horizontal connector
    if (to.x > from.x) {
      return { x1: from.x + NODE_SIZE, y1: fromCy, x2: to.x, y2: toCy };
    }
    return { x1: from.x, y1: fromCy, x2: to.x + NODE_SIZE, y2: toCy };
  }

  // Vertical connector
  if (to.y > from.y) {
    return { x1: fromCx, y1: from.y + NODE_SIZE, x2: toCx, y2: to.y };
  }
  return { x1: fromCx, y1: from.y, x2: toCx, y2: to.y + NODE_SIZE };
}

function getInitialReducedMotion(framerReduced: boolean | null): boolean {
  if (framerReduced) return true;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return false;
}

export function DeployPipeline() {
  const framerReduced = useReducedMotion();
  const [reduce, setReduce] = useState<boolean>(() => getInitialReducedMotion(framerReduced));
  const [step, setStep] = useState<number>(() =>
    getInitialReducedMotion(framerReduced) ? PIPELINE_NODES.length - 1 : 0,
  );
  const [releaseNum, setReleaseNum] = useState<number>(2463);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(Boolean(framerReduced) || mq.matches);
    update();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
  }, [framerReduced]);

  useEffect(() => {
    if (reduce) {
      setStep(PIPELINE_NODES.length - 1);
    }
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= PIPELINE_NODES.length) {
          setReleaseNum((r) => r + 1);
          return 0;
        }
        return prev + 1;
      });
    }, STEP_MS);
    return () => clearInterval(interval);
  }, [reduce]);

  const isFullPassComplete = reduce || step >= PIPELINE_NODES.length - 1;
  const statusWord = isFullPassComplete ? "HEALTHY" : "RUNNING";

  return (
    <div className="w-full max-w-full min-w-0 text-[#EFE6D8]">
      {/* Diagram floats directly on the page background with no enclosing card or border */}
      <div className="w-full max-w-full min-w-0">
        <svg
          viewBox="0 0 740 830"
          className="block h-auto w-full max-w-full select-none"
          role="img"
          aria-label="11-node deployment pipeline architecture diagram"
        >
          {/* Category zone labels */}
          {CATEGORY_ZONES.map((zone) => (
            <text
              key={zone.label}
              data-zone-label={zone.label}
              x={zone.x}
              y={zone.y}
              textAnchor={zone.anchor ?? "start"}
              fill="#E8503A"
              className="font-mono text-[11px] font-semibold uppercase"
              style={{ letterSpacing: "0.08em" }}
            >
              {zone.label}
            </text>
          ))}

          {/* Straight right-angle main-chain connector segments (terminate flush at node edges) */}
          {PIPELINE_NODES.slice(0, -1).map((node, idx) => {
            const nextNode = PIPELINE_NODES[idx + 1]!;
            const { x1, y1, x2, y2 } = getFlushConnectorCoords(node, nextNode);
            const bothDone = reduce || step >= idx + 1;

            return (
              <line
                key={`${node.id}-${nextNode.id}`}
                data-pipeline-connector={`${node.id}-${nextNode.id}`}
                data-connector-done={bothDone ? "true" : "false"}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={bothDone ? "#E8503A" : "#2A3040"}
                strokeWidth={2}
              />
            );
          })}

          {/* Sole curved dashed observability feedback line: MONITOR -> REGISTRY/DEPLOY zone */}
          <path
            data-feedback-loop="true"
            data-feedback-active={isFullPassComplete ? "true" : "false"}
            d="M 380 760 C 250 760, 250 426, 380 426"
            fill="none"
            stroke={isFullPassComplete ? "#E8503A" : "#2A3040"}
            strokeWidth={2}
            strokeDasharray="6 6"
          />

          {/* 11 Square 60x60px Nodes */}
          {PIPELINE_NODES.map((node, idx) => {
            const isDone = reduce || idx <= step;
            const Icon = node.icon;
            const cx = node.x + NODE_SIZE / 2;
            const cy = node.y + NODE_SIZE / 2;

            const labelX =
              node.labelAlign === "below-right"
                ? cx + 12
                : node.labelAlign === "below-left"
                  ? cx - 12
                  : cx;
            const textAnchor =
              node.labelAlign === "below-right"
                ? "start"
                : node.labelAlign === "below-left"
                  ? "end"
                  : "middle";

            return (
              <g
                key={node.id}
                data-pipeline-node={node.label}
                data-node-state={isDone ? "done" : "pending"}
              >
                {/* 60x60px rounded node box */}
                <rect
                  x={node.x}
                  y={node.y}
                  width={NODE_SIZE}
                  height={NODE_SIZE}
                  rx={14}
                  fill="transparent"
                  stroke={isDone ? "#E8503A" : "#3A4152"}
                  strokeWidth={2}
                />

                {/* Recognizable tool icon centered in the 60x60 node */}
                <g
                  transform={`translate(${cx - 12}, ${cy - 12})`}
                  style={{ color: isDone ? "#E8503A" : "#5A6072" }}
                >
                  <Icon width={24} height={24} size={24} aria-hidden />
                </g>

                {/* MONITOR node extra detail: corner pulsing indicator dot */}
                {node.id === "monitor" && (
                  <rect
                    data-monitor-dot="true"
                    data-dot-active={isFullPassComplete ? "true" : "false"}
                    x={node.x + NODE_SIZE - 12}
                    y={node.y + 6}
                    width={6}
                    height={6}
                    fill={isFullPassComplete ? "#E8503A" : "#5A6072"}
                    className={isFullPassComplete && !reduce ? "monitor-pulse" : ""}
                  />
                )}

                {/* Monospace node label (~11px) */}
                <text
                  data-node-label={node.label}
                  x={labelX}
                  y={node.y + NODE_SIZE + 20}
                  textAnchor={textAnchor}
                  fill={isDone ? "#EFE6D8" : "#5A6072"}
                  className="font-mono text-[11px] font-medium uppercase"
                  style={{ letterSpacing: "0.06em" }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Status line below the diagram */}
      <p
        aria-live="polite"
        className="mt-6 font-mono text-xs uppercase tracking-[0.08em] text-[#EFE6D8]"
      >
        PIPELINE · RELEASE #{releaseNum} —{" "}
        <span className="font-bold text-[#E8503A]">{statusWord}</span>
      </p>
    </div>
  );
}
