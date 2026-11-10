import { useReducedMotion } from "framer-motion";
import { useEffect, useState, type ComponentType } from "react";
import { SiGit, SiDocker, SiKubernetes, SiPrometheus, SiGrafana } from "react-icons/si";
import { Layers, Grip } from "lucide-react";

interface PipelineNode {
  id: string;
  name: string;
  label: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}

const NODES: readonly PipelineNode[] = [
  { id: "git", name: "Git", label: "GIT", icon: SiGit },
  { id: "docker", name: "Docker", label: "DOCKER", icon: SiDocker },
  { id: "registry", name: "Registry", label: "REGISTRY", icon: Layers },
  { id: "kubernetes", name: "Kubernetes", label: "K8S", icon: SiKubernetes },
  { id: "pods", name: "Pods", label: "PODS", icon: Grip },
  { id: "prometheus", name: "Prometheus", label: "PROM", icon: SiPrometheus },
  { id: "grafana", name: "Grafana", label: "GRAFANA", icon: SiGrafana },
] as const;

// Stages 0..6 are the 7 active stages; stage 7 is the completed "all done / HEALTHY" pass
const COMPLETED_STAGE = NODES.length;
const STAGE_DURATION_MS = 1600;

function getInitialReducedMotion(framerReduced: boolean | null): boolean {
  if (framerReduced) return true;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return false;
}

/**
 * Animated "infra-flow" status strip component for the dark-themed DevOps portfolio hero section.
 * Floats directly on the page background with no outer border, background fill, or shadow.
 */
export function DeployFlow() {
  const framerReduced = useReducedMotion();
  const [reduce, setReduce] = useState<boolean>(() => getInitialReducedMotion(framerReduced));
  const [stage, setStage] = useState<number>(() =>
    getInitialReducedMotion(framerReduced) ? COMPLETED_STAGE : 0,
  );

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
      setStage(COMPLETED_STAGE);
    }
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    const interval = setInterval(() => {
      setStage((prev) => (prev >= COMPLETED_STAGE ? 0 : prev + 1));
    }, STAGE_DURATION_MS);
    return () => clearInterval(interval);
  }, [reduce]);

  const isAllDone = reduce || stage === COMPLETED_STAGE;
  const statusLabel = isAllDone || stage === NODES.length - 1 ? "HEALTHY" : "IN PROGRESS";

  return (
    <div
      className="flex min-h-[360px] w-full max-w-full min-w-0 flex-col justify-center gap-12 py-16 font-mono uppercase tracking-[0.07em] text-[#EFE6D8] lg:min-h-[600px] lg:py-24"
      style={{ containerType: "inline-size" }}
    >
      {/* 1. Header row: floats directly on page background */}
      <div className="flex w-full min-w-0 items-center justify-between gap-3">
        <span className="truncate text-xs font-semibold tracking-[0.08em] text-[#EFE6D8] sm:text-sm">
          DEPLOYMENT · CORE-API:V2463
        </span>
        <span
          aria-live="polite"
          className="shrink-0 rounded-full border border-[#E8503A] bg-transparent px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-[#E8503A] sm:text-xs"
        >
          {statusLabel}
        </span>
      </div>

      {/* 2, 3, 4. Horizontal row of 7 equal-width square icon tiles + gap-only connecting segments */}
      <div
        role="list"
        aria-label="Deployment pipeline stages"
        className="grid w-full max-w-full min-w-0 items-center"
        style={{
          gridTemplateColumns:
            "minmax(0, 72px) minmax(clamp(4px, 1.5cqw, 12px), 1fr) minmax(0, 72px) minmax(clamp(4px, 1.5cqw, 12px), 1fr) minmax(0, 72px) minmax(clamp(4px, 1.5cqw, 12px), 1fr) minmax(0, 72px) minmax(clamp(4px, 1.5cqw, 12px), 1fr) minmax(0, 72px) minmax(clamp(4px, 1.5cqw, 12px), 1fr) minmax(0, 72px) minmax(clamp(4px, 1.5cqw, 12px), 1fr) minmax(0, 72px)",
        }}
      >
        {/* Grid Row 1: Square Icon Tiles (odd cols) and Gap-Only Line Segments (even cols) */}
        {NODES.map((node, i) => {
          const isActive = !isAllDone && i === stage;
          const isDone = isAllDone || i < stage;
          const Icon = node.icon;

          const tileState = isActive ? "active" : isDone ? "done" : "pending";

          const tileClasses = isActive
            ? "border border-[#E8503A] bg-[#E8503A] text-[#10151F]"
            : isDone
              ? "border-2 border-[#E8503A] bg-transparent text-[#E8503A]"
              : "border border-[#3A4152] bg-transparent text-[#5A6072]";

          // Segment connects tile i and tile i+1: turns solid coral once BOTH tiles are DONE or ACTIVE
          const nextReached = isAllDone || stage >= i + 1;

          return (
            <div key={node.id} className="contents" role="listitem">
              <div
                data-stage={node.name}
                data-state={tileState}
                title={node.name}
                aria-label={node.name}
                style={{ gridColumn: i * 2 + 1, gridRow: 1 }}
                className={`relative z-10 flex aspect-square w-full min-w-0 items-center justify-center rounded-2xl transition-colors duration-200 ${tileClasses}`}
              >
                <Icon
                  className="h-[clamp(14px,3.8cqw,26px)] w-[clamp(14px,3.8cqw,26px)] shrink-0"
                  aria-hidden
                />
              </div>

              {i < NODES.length - 1 && (
                <div
                  aria-hidden="true"
                  data-connector-index={i}
                  data-connector-active={nextReached ? "true" : "false"}
                  style={{ gridColumn: i * 2 + 2, gridRow: 1 }}
                  className={`h-[2px] w-full self-center transition-colors duration-200 ${
                    nextReached ? "bg-[#E8503A]" : "bg-[#3A4152]"
                  }`}
                />
              )}
            </div>
          );
        })}

        {/* Grid Row 2: Monospace Stage Labels aligned directly beneath each tile */}
        {NODES.map((node, i) => {
          const isActive = !isAllDone && i === stage;
          const isDone = isAllDone || i < stage;

          const labelColor = isActive
            ? "text-[#E8503A] font-bold"
            : isDone
              ? "text-[#EFE6D8]"
              : "text-[#5A6072]";

          return (
            <span
              key={`${node.id}-label`}
              style={{ gridColumn: i * 2 + 1, gridRow: 2 }}
              className={`mt-3 block min-w-0 truncate text-center text-[clamp(7.5px,1.8cqw,11px)] leading-none tracking-[0.06em] transition-colors duration-200 ${labelColor}`}
            >
              {node.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
