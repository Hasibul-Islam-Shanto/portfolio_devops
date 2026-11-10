import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Hero } from "@/components/portfolio/Hero";
import { HeroTerminal } from "@/components/portfolio/HeroTerminal";
import { DeployFlow } from "@/components/portfolio/DeployFlow";
import { DeployPipeline } from "@/components/portfolio/DeployPipeline";
import { Work } from "@/components/portfolio/Work";
import {
  HowIWork,
  Certifications,
  Experience,
  Testimonials,
} from "@/components/portfolio/Sections";

describe("Portfolio new sections & elements", () => {
  it("renders Hero CTAs and interactive HeroTerminal in the right column without any 4-stat row or infra-flow diagram", () => {
    const { container } = render(<Hero />);
    expect(screen.getByText("View the work →")).toBeInTheDocument();
    expect(screen.getByText("Get in touch")).toBeInTheDocument();

    // Terminal replaced the infra-flow diagram in Hero, with macOS window chrome dots and no background grid
    expect(container.querySelector(".blueprint-grid")).toBeNull();
    expect(container.querySelector("[data-terminal-window]")).not.toBeNull();
    expect(container.querySelectorAll("[data-terminal-dot]").length).toBe(3);
    expect(screen.getByText("shanto@platform:~")).toBeInTheDocument();
    expect(screen.getByText("type a command, try help")).toBeInTheDocument();
    expect(container.querySelectorAll("[data-pipeline-node]").length).toBe(0);

    // 4-stat row remains permanently absent
    expect(container.querySelector("dl")).toBeNull();
    expect(screen.queryByText("Building backend & platform systems")).toBeNull();
    expect(screen.queryByText("Production incidents resolved this quarter")).toBeNull();
    expect(screen.queryByText("Deploy frequency improved")).toBeNull();
    expect(screen.queryByText("Services running in production")).toBeNull();
  });

  it("supports simulated typing on command pill click, free typing, unrecognized command fallback, and reduced motion in HeroTerminal", () => {
    vi.useFakeTimers();
    const { container } = render(<HeroTerminal />);

    // Verify all 8 command pills are rendered
    for (const pill of [
      "help",
      "whoami",
      "deploy",
      "kubectl get pods",
      "docker ps",
      "docker compose",
      "terraform plan",
      "sudo hire shanto",
    ]) {
      expect(screen.getByRole("button", { name: pill })).toBeInTheDocument();
    }

    const cursor = container.querySelector("[data-terminal-cursor]");
    expect(cursor?.getAttribute("data-cursor-blinking")).toBe("true");

    // Click "kubectl get pods" pill -> types character by character and pauses cursor blink while typing
    fireEvent.click(screen.getByRole("button", { name: "kubectl get pods" }));
    expect(cursor?.getAttribute("data-cursor-blinking")).toBe("false");

    act(() => {
      vi.advanceTimersByTime(35 * 20);
    });

    // Typing finished -> output shown and cursor resumes blinking
    expect(screen.getByText(/core-api-7d9f8b-x4k2p/)).toBeInTheDocument();
    expect(cursor?.getAttribute("data-cursor-blinking")).toBe("true");

    // Free typing new commands: whoami, docker ps, docker compose
    const input = screen.getByLabelText("Terminal command input");
    fireEvent.change(input, { target: { value: "whoami" } });
    fireEvent.submit(input.closest("form")!);
    expect(screen.getByText("shanto")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "docker ps" } });
    fireEvent.submit(input.closest("form")!);
    expect(screen.getByText(/CONTAINER ID\s+IMAGE\s+STATUS\s+PORTS/)).toBeInTheDocument();
    expect(screen.getByText(/demo\/api-gateway:1\.4/)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "docker compose" } });
    fireEvent.submit(input.closest("form")!);
    expect(screen.getByText(/Creating demo-api\.\.\./)).toBeInTheDocument();
    expect(screen.getByText(/Creating demo-db\.\.\./)).toBeInTheDocument();
    expect(screen.getByText(/Creating demo-cache\.\.\./)).toBeInTheDocument();

    // Free typing an unrecognized command and submitting
    fireEvent.change(input, { target: { value: "unknown-cmd" } });
    fireEvent.submit(input.closest("form")!);
    expect(screen.getByText("command not found — try help")).toBeInTheDocument();

    // Free typing "help" and submitting shows same output as clicking "help"
    fireEvent.change(input, { target: { value: "help" } });
    fireEvent.submit(input.closest("form")!);
    expect(screen.getByText("AVAILABLE COMMANDS:")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("disables cursor blinking and skips character typing animation when prefers-reduced-motion is enabled in HeroTerminal", () => {
    const origMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });

    const { container } = render(<HeroTerminal />);
    const cursor = container.querySelector("[data-terminal-cursor]");
    expect(cursor?.getAttribute("data-cursor-blinking")).toBe("false");
    expect(cursor?.className).not.toContain("terminal-cursor-blink");

    // Clicking a pill immediately renders output without waiting for timers
    fireEvent.click(screen.getByRole("button", { name: "sudo hire shanto" }));
    expect(
      screen.getByText(/ACCESS GRANTED — Shanto provisioned for Platform \/ DevOps leadership/i),
    ).toBeInTheDocument();

    window.matchMedia = origMatchMedia;
  });

  it("renders the 7-stage infra-flow status strip without an outer card and progresses through stages", () => {
    vi.useFakeTimers();
    const { container } = render(<DeployFlow />);

    // No outer bordered card wrapper
    expect(container.querySelector(".deploy-widget")).toBeNull();

    // 1. Header row: DEPLOYMENT · CORE-API:V2463 + IN PROGRESS status badge
    expect(screen.getByText("DEPLOYMENT · CORE-API:V2463")).toBeInTheDocument();
    expect(screen.getByText("IN PROGRESS")).toBeInTheDocument();

    // 2. 7 icon tiles in order with their labels
    const stages = container.querySelectorAll("[data-stage]");
    expect(stages.length).toBe(7);
    expect(stages[0]?.getAttribute("data-state")).toBe("active");
    expect(stages[1]?.getAttribute("data-state")).toBe("pending");

    for (const label of ["GIT", "DOCKER", "REGISTRY", "K8S", "PODS", "PROM", "GRAFANA"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    // 3. 6 separate gap-only connecting segments in even grid columns (2, 4, 6, 8, 10, 12)
    const connectors = container.querySelectorAll("[data-connector-index]");
    expect(connectors.length).toBe(6);
    connectors.forEach((conn, idx) => {
      expect((conn as HTMLElement).style.gridColumn).toBe(String(idx * 2 + 2));
      expect(conn.getAttribute("data-connector-active")).toBe("false");
    });

    // Advance through Git (0) -> Docker (1) -> Registry (2) -> K8S (3) -> Pods (4)
    for (let i = 0; i < 4; i++) {
      act(() => {
        vi.advanceTimersByTime(1600);
      });
    }

    // Now at stage 4 (Pods): tiles 0..3 are DONE, tile 4 is ACTIVE, connectors 0..3 are active
    expect(stages[0]?.getAttribute("data-state")).toBe("done");
    expect(stages[3]?.getAttribute("data-state")).toBe("done");
    expect(stages[4]?.getAttribute("data-state")).toBe("active");
    expect(connectors[3]?.getAttribute("data-connector-active")).toBe("true");
    expect(connectors[4]?.getAttribute("data-connector-active")).toBe("false");

    // Advance through Pods (4) -> Prometheus (5) -> Grafana (6)
    act(() => {
      vi.advanceTimersByTime(1600 * 2);
    });

    // Now at stage 6 (Grafana): status switches to HEALTHY, all 6 connectors active
    expect(stages[6]?.getAttribute("data-state")).toBe("active");
    expect(screen.getByText("HEALTHY")).toBeInTheDocument();
    connectors.forEach((conn) => {
      expect(conn.getAttribute("data-connector-active")).toBe("true");
    });

    vi.useRealTimers();
  });

  it("shows static final all-done / HEALTHY state when prefers-reduced-motion is enabled", () => {
    const origMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });

    const { container } = render(<DeployFlow />);
    expect(screen.getByText("HEALTHY")).toBeInTheDocument();

    const stages = container.querySelectorAll("[data-stage]");
    stages.forEach((s) => {
      expect(s.getAttribute("data-state")).toBe("done");
    });

    const connectors = container.querySelectorAll("[data-connector-index]");
    connectors.forEach((c) => {
      expect(c.getAttribute("data-connector-active")).toBe("true");
    });

    window.matchMedia = origMatchMedia;
  });

  it("renders the 11-node full-width DeployPipeline diagram with straight orthogonal connectors and advances to HEALTHY", () => {
    vi.useFakeTimers();
    const { container } = render(<DeployPipeline />);

    // Category zone labels and spacing verification (no collisions with node labels or feedback line)
    for (const zone of ["SOURCE", "CI PIPELINE", "ARTIFACTS · INFRA", "ORCHESTRATION", "RUNTIME"]) {
      expect(screen.getByText(zone)).toBeInTheDocument();
    }

    const deployLabelY = Number(
      container.querySelector('[data-node-label="DEPLOY"]')?.getAttribute("y"),
    );
    const k8sRectY = Number(
      container.querySelector('[data-pipeline-node="K8S"] rect')?.getAttribute("y"),
    );
    const orchestrationY = Number(
      container.querySelector('[data-zone-label="ORCHESTRATION"]')?.getAttribute("y"),
    );
    // ORCHESTRATION sits clearly below DEPLOY's label (>= 40px) and clearly above K8S node (>= 40px)
    expect(orchestrationY - deployLabelY).toBeGreaterThanOrEqual(40);
    expect(k8sRectY - orchestrationY).toBeGreaterThanOrEqual(40);

    const runtimeEl = container.querySelector('[data-zone-label="RUNTIME"]');
    const runtimeX = Number(runtimeEl?.getAttribute("x"));
    const runtimeY = Number(runtimeEl?.getAttribute("y"));
    const monitorRectY = Number(
      container.querySelector('[data-pipeline-node="MONITOR"] rect')?.getAttribute("y"),
    );
    // RUNTIME sits >= 40px above Row 4 and well to the right of the left-side feedback loop (x <= 380)
    expect(monitorRectY - runtimeY).toBeGreaterThanOrEqual(40);
    expect(runtimeX).toBeGreaterThan(440);

    // 11 nodes in sequence
    const nodes = container.querySelectorAll("[data-pipeline-node]");
    expect(nodes.length).toBe(11);
    expect(nodes[0]?.getAttribute("data-node-state")).toBe("done");
    expect(nodes[1]?.getAttribute("data-node-state")).toBe("pending");

    // 10 straight horizontal/vertical main-chain connectors
    const connectors = container.querySelectorAll("[data-pipeline-connector]");
    expect(connectors.length).toBe(10);
    connectors.forEach((line) => {
      const x1 = Number(line.getAttribute("x1"));
      const y1 = Number(line.getAttribute("y1"));
      const x2 = Number(line.getAttribute("x2"));
      const y2 = Number(line.getAttribute("y2"));
      // Must be strictly horizontal or strictly vertical
      expect(x1 === x2 || y1 === y2).toBe(true);
      expect(line.getAttribute("data-connector-done")).toBe("false");
    });

    // Feedback loop and monitor dot start inactive, status line reads RUNNING
    const feedback = container.querySelector("[data-feedback-loop]");
    const monitorDot = container.querySelector("[data-monitor-dot]");
    expect(feedback?.getAttribute("data-feedback-active")).toBe("false");
    expect(monitorDot?.getAttribute("data-dot-active")).toBe("false");
    expect(screen.getByText("RUNNING")).toBeInTheDocument();

    // Advance 10 steps (900ms each) to complete all 11 nodes (index 0..10)
    act(() => {
      vi.advanceTimersByTime(900 * 10);
    });

    nodes.forEach((n) => {
      expect(n.getAttribute("data-node-state")).toBe("done");
    });
    connectors.forEach((c) => {
      expect(c.getAttribute("data-connector-done")).toBe("true");
    });
    expect(feedback?.getAttribute("data-feedback-active")).toBe("true");
    expect(monitorDot?.getAttribute("data-dot-active")).toBe("true");
    expect(screen.getByText("HEALTHY")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("shows static all-done / HEALTHY DeployPipeline state when prefers-reduced-motion is enabled", () => {
    const origMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });

    const { container } = render(<DeployPipeline />);
    expect(screen.getByText("HEALTHY")).toBeInTheDocument();
    expect(
      container.querySelector("[data-feedback-loop]")?.getAttribute("data-feedback-active"),
    ).toBe("true");
    const monitorDot = container.querySelector("[data-monitor-dot]");
    expect(monitorDot?.getAttribute("data-dot-active")).toBe("true");
    expect(monitorDot?.getAttribute("class")).toBe("");

    window.matchMedia = origMatchMedia;
  });

  it("renders per-project 4-node mini flow diagrams inside all 6 project cards and animates on hover", () => {
    vi.useFakeTimers();
    const { container } = render(<Work />);
    const flowDiagrams = container.querySelectorAll('[aria-label="Project pipeline stages"]');
    expect(flowDiagrams.length).toBe(6);

    // Check specific project flow labels
    expect(screen.getByText("Reconcile")).toBeInTheDocument();
    expect(screen.getByText("Hypothesis")).toBeInTheDocument();

    const cards = container.querySelectorAll("article.work-card");
    expect(cards.length).toBe(6);
    cards.forEach((card) => {
      expect(card).not.toHaveAttribute("data-cursor-label");
      expect(card.className).not.toMatch(/tone-m-|tone-d-/);
      expect(card.querySelector(".work-cat-tick")).not.toBeNull();
      expect(card.querySelector(".work-case-link")?.textContent).toBe("View case study →");
    });

    const firstCard = cards[0];
    expect(firstCard).not.toBeUndefined();

    act(() => {
      fireEvent.mouseEnter(firstCard!);
    });

    expect(firstCard?.querySelector(".flow-node.is-on")).not.toBeNull();
    vi.useRealTimers();
  });

  it("renders the 5-step How I Work section and pull-quote", () => {
    render(<HowIWork />);
    expect(screen.getByText("Understand")).toBeInTheDocument();
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Delegate / Build")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Measure")).toBeInTheDocument();
    expect(screen.getByText(/if it pages at 3am, it pages me first/i)).toBeInTheDocument();
  });

  it("renders the 4 placeholder Certifications cards", () => {
    render(<Certifications />);
    expect(screen.getByText("Certifications")).toBeInTheDocument();
    expect(
      screen.getByText("[Certification Name — e.g. AWS Solutions Architect]"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("[Year]").length).toBe(4);
  });

  it("renders the two-column vertical timeline Experience section with placeholders and CTA", () => {
    render(<Experience />);
    expect(screen.getByText("Professional journey")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("[Month Year] – Present")).toBeInTheDocument();
    expect(screen.getAllByText("[Company Name]").length).toBe(3);
    expect(screen.getAllByText("[Job Title]").length).toBe(3);
    expect(screen.getByText("View Full Experience →")).toBeInTheDocument();
  });

  it("renders the 3 placeholder Testimonials quote cards", () => {
    render(<Testimonials />);
    expect(screen.getByText("What people say")).toBeInTheDocument();
    expect(screen.getAllByText("[Name Surname] — [Role, Company]").length).toBe(3);
  });
});
