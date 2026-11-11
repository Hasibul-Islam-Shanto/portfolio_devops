import { describe, expect, it, vi } from "vitest";
import { initHeroTerminal } from "@/scripts/hero-terminal";
import { initDeployFlow } from "@/scripts/deploy-flow";
import { initDeployPipeline } from "@/scripts/deploy-pipeline";
import { initWork } from "@/scripts/work";
import { initToolchain } from "@/scripts/toolchain";
import { initHeader } from "@/scripts/header";
import { initExperience } from "@/scripts/experience";
import { initContact } from "@/scripts/contact";
import { initPipelineRail } from "@/scripts/pipeline-rail";
import { initConstellationCanvases } from "@/scripts/constellation-canvas";
import { mockMatchMedia, mount, track } from "./helpers";

const text = (el: Element | null) => el?.textContent ?? "";
const pill = (name: string) =>
  document.querySelector<HTMLButtonElement>(`[data-terminal-pill="${name}"]`)!;

function submit(command: string) {
  const input = document.querySelector<HTMLInputElement>(
    'input[aria-label="Terminal command input"]',
  )!;
  input.value = command;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.closest("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

describe("Hero", () => {
  it("renders the headline words, CTAs, terminal chrome and an always-on hero canvas", async () => {
    const body = mount("hero");
    expect(text(body.querySelector("h1")).replace(/\s+/g, " ").trim()).toBe(
      "Making complex systems run like they should.",
    );
    expect(body.querySelectorAll(".hero-word").length).toBe(7);
    expect(body.querySelector(".text-signal .hero-word")?.textContent?.trim()).toBe("systems");
    expect(text(body)).toContain("View the work →");
    expect(text(body)).toContain("Get in touch");
    expect(body.querySelector('a[href="#test"]')).not.toBeNull();
    expect(body.querySelector('a[href="#scale"]')).not.toBeNull();

    const canvas = body.querySelector('[data-constellation-canvas="hero"]')!;
    expect(canvas.getAttribute("data-constellation-active")).toBe("true");
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
    expect(canvas.className).toContain("pointer-events-none");

    expect(body.querySelector("[data-terminal-window]")).not.toBeNull();
    expect(body.querySelectorAll("[data-terminal-dot]").length).toBe(3);
    expect(text(body)).toContain("shanto@platform:~");
    expect(text(body)).toContain("type a command, try help");
    expect(body.querySelector("dl")).toBeNull();
  });

  it("staggers word delays as 0.1s + i * 0.07s via the --i variable", async () => {
    const body = mount("hero");
    const words = Array.from(body.querySelectorAll<HTMLElement>(".hero-word"));
    expect(words.map((w) => w.getAttribute("style"))).toEqual(words.map((_, i) => `--i: ${i}`));
  });
});

describe("HeroTerminal", () => {
  it("types pill commands char by char, accepts free typing, and falls back for unknown commands", async () => {
    mount("hero-terminal");
    track(initHeroTerminal());
    vi.useFakeTimers();
    try {
      const pills = document.querySelectorAll("[data-terminal-pill]");
      expect(Array.from(pills).map((p) => p.textContent?.trim())).toEqual([
        "help",
        "whoami",
        "deploy",
        "kubectl get pods",
        "docker ps",
        "docker compose",
        "terraform plan",
        "sudo hire shanto",
      ]);

      const cursor = document.querySelector<HTMLElement>("[data-terminal-cursor]")!;
      expect(cursor.dataset["cursorBlinking"]).toBe("true");

      pill("kubectl get pods").click();
      expect(cursor.dataset["cursorBlinking"]).toBe("false");
      vi.advanceTimersByTime(35 * 20);
      expect(document.body.textContent).toMatch(/core-api-7d9f8b-x4k2p/);
      expect(cursor.dataset["cursorBlinking"]).toBe("true");

      submit("whoami");
      expect(text(document.querySelector("[data-terminal-history]"))).toContain("shanto");
      submit("docker ps");
      expect(document.body.textContent).toMatch(/CONTAINER ID\s+IMAGE\s+STATUS\s+PORTS/);
      expect(document.body.textContent).toMatch(/demo\/api-gateway:1\.4/);
      submit("docker compose");
      expect(document.body.textContent).toContain("Creating demo-cache...");
      submit("unknown-cmd");
      expect(document.body.textContent).toContain("command not found — try help");
      submit("help");
      expect(document.body.textContent).toContain("AVAILABLE COMMANDS:");

      submit("clear");
      expect(document.querySelector("[data-terminal-history]")!.children.length).toBe(0);
      expect(document.querySelector<HTMLElement>("[data-terminal-placeholder]")!.hidden).toBe(
        false,
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("ignores free input while a pill is typing", async () => {
    mount("hero-terminal");
    track(initHeroTerminal());
    vi.useFakeTimers();
    try {
      pill("whoami").click();
      vi.advanceTimersByTime(35);
      submit("help");
      expect(document.body.textContent).not.toContain("AVAILABLE COMMANDS:");
    } finally {
      vi.useRealTimers();
    }
  });

  it("renders output instantly and stops the cursor blinking under reduced motion", async () => {
    mockMatchMedia("prefers-reduced-motion");
    mount("hero-terminal");
    track(initHeroTerminal());
    const cursor = document.querySelector<HTMLElement>("[data-terminal-cursor]")!;
    expect(cursor.dataset["cursorBlinking"]).toBe("false");
    expect(cursor.className).not.toContain("terminal-cursor-blink");

    pill("sudo hire shanto").click();
    expect(document.body.textContent).toMatch(
      /ACCESS GRANTED — Shanto provisioned for Platform \/ DevOps leadership/i,
    );
    expect(document.querySelector('a[href="mailto:hello@shanto.dev"]')).not.toBeNull();
  });
});

describe("DeployFlow", () => {
  it("renders the 7-stage strip without an outer card and progresses to HEALTHY", async () => {
    vi.useFakeTimers();
    mount("deploy-flow");
    track(initDeployFlow());
    try {
      expect(document.querySelector(".deploy-widget")).toBeNull();
      expect(document.body.textContent).toContain("DEPLOYMENT · CORE-API:V2463");
      const status = document.querySelector("[data-deploy-status]")!;
      expect(text(status)).toBe("IN PROGRESS");

      const stages = document.querySelectorAll("[data-stage]");
      expect(stages.length).toBe(7);
      expect(stages[0]?.getAttribute("data-state")).toBe("active");
      expect(stages[1]?.getAttribute("data-state")).toBe("pending");
      for (const label of ["GIT", "DOCKER", "REGISTRY", "K8S", "PODS", "PROM", "GRAFANA"]) {
        expect(document.querySelector(`[data-stage-label="${label}"]`)).not.toBeNull();
      }

      const connectors = document.querySelectorAll<HTMLElement>("[data-connector-index]");
      expect(connectors.length).toBe(6);
      connectors.forEach((c, i) => {
        expect(c.style.gridColumn).toBe(String(i * 2 + 2));
        expect(c.getAttribute("data-connector-active")).toBe("false");
      });

      vi.advanceTimersByTime(1600 * 4);
      expect(stages[3]?.getAttribute("data-state")).toBe("done");
      expect(stages[4]?.getAttribute("data-state")).toBe("active");
      expect(connectors[3]?.getAttribute("data-connector-active")).toBe("true");
      expect(connectors[4]?.getAttribute("data-connector-active")).toBe("false");

      vi.advanceTimersByTime(1600 * 2);
      expect(stages[6]?.getAttribute("data-state")).toBe("active");
      expect(text(status)).toBe("HEALTHY");
      connectors.forEach((c) => expect(c.getAttribute("data-connector-active")).toBe("true"));

      vi.advanceTimersByTime(1600); // completed pass
      stages.forEach((s) => expect(s.getAttribute("data-state")).toBe("done"));
      vi.advanceTimersByTime(1600); // loops back
      expect(stages[0]?.getAttribute("data-state")).toBe("active");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows the static all-done HEALTHY state under reduced motion", async () => {
    mockMatchMedia("prefers-reduced-motion");
    mount("deploy-flow");
    track(initDeployFlow());
    expect(text(document.querySelector("[data-deploy-status]"))).toBe("HEALTHY");
    document
      .querySelectorAll("[data-stage]")
      .forEach((s) => expect(s.getAttribute("data-state")).toBe("done"));
    document
      .querySelectorAll("[data-connector-index]")
      .forEach((c) => expect(c.getAttribute("data-connector-active")).toBe("true"));
  });
});

describe("DeployPipeline", () => {
  it("renders the 11-node diagram with orthogonal connectors and advances to HEALTHY", async () => {
    vi.useFakeTimers();
    mount("deploy-pipeline");
    track(initDeployPipeline());
    try {
      for (const zone of [
        "SOURCE",
        "CI PIPELINE",
        "ARTIFACTS · INFRA",
        "ORCHESTRATION",
        "RUNTIME",
      ]) {
        expect(document.querySelector(`[data-zone-label="${zone}"]`)).not.toBeNull();
      }
      const num = (sel: string, attr: string) =>
        Number(document.querySelector(sel)?.getAttribute(attr));
      const deployLabelY = num('[data-node-label="DEPLOY"]', "y");
      const k8sY = num('[data-pipeline-node="K8S"] rect', "y");
      const orchY = num('[data-zone-label="ORCHESTRATION"]', "y");
      expect(orchY - deployLabelY).toBeGreaterThanOrEqual(40);
      expect(k8sY - orchY).toBeGreaterThanOrEqual(40);
      expect(
        num('[data-pipeline-node="MONITOR"] rect', "y") - num('[data-zone-label="RUNTIME"]', "y"),
      ).toBeGreaterThanOrEqual(40);
      expect(num('[data-zone-label="RUNTIME"]', "x")).toBeGreaterThan(440);

      const nodes = document.querySelectorAll("[data-pipeline-node]");
      expect(nodes.length).toBe(11);
      expect(nodes[0]?.getAttribute("data-node-state")).toBe("done");
      expect(nodes[1]?.getAttribute("data-node-state")).toBe("pending");

      const connectors = document.querySelectorAll("[data-pipeline-connector]");
      expect(connectors.length).toBe(10);
      connectors.forEach((line) => {
        const [x1, y1, x2, y2] = ["x1", "y1", "x2", "y2"].map((a) => line.getAttribute(a));
        expect(x1 === x2 || y1 === y2).toBe(true);
        expect(line.getAttribute("data-connector-done")).toBe("false");
      });

      const feedback = document.querySelector("[data-feedback-loop]")!;
      const dot = document.querySelector("[data-monitor-dot]")!;
      expect(feedback.getAttribute("data-feedback-active")).toBe("false");
      expect(dot.getAttribute("data-dot-active")).toBe("false");
      expect(text(document.querySelector("[data-pipeline-status]"))).toBe("RUNNING");

      vi.advanceTimersByTime(900 * 10);
      nodes.forEach((n) => expect(n.getAttribute("data-node-state")).toBe("done"));
      connectors.forEach((c) => expect(c.getAttribute("data-connector-done")).toBe("true"));
      expect(feedback.getAttribute("data-feedback-active")).toBe("true");
      expect(dot.getAttribute("data-dot-active")).toBe("true");
      expect(text(document.querySelector("[data-pipeline-status]"))).toBe("HEALTHY");
      expect(text(document.querySelector("[data-release-num]"))).toBe("2463");

      vi.advanceTimersByTime(900 * 2); // pass 11 -> restart, release bumps
      expect(text(document.querySelector("[data-release-num]"))).toBe("2464");
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows the static all-done state under reduced motion without the pulse animation", async () => {
    mockMatchMedia("prefers-reduced-motion");
    mount("deploy-pipeline");
    track(initDeployPipeline());
    expect(text(document.querySelector("[data-pipeline-status]"))).toBe("HEALTHY");
    expect(
      document.querySelector("[data-feedback-loop]")?.getAttribute("data-feedback-active"),
    ).toBe("true");
    const dot = document.querySelector("[data-monitor-dot]")!;
    expect(dot.getAttribute("data-dot-active")).toBe("true");
    expect(dot.getAttribute("class")).not.toContain("monitor-pulse");
  });
});

describe("Work", () => {
  it("renders six cards with mini flows, inactive canvases and the case-study link", async () => {
    const body = mount("work");
    expect(body.querySelectorAll('[aria-label="Project pipeline stages"]').length).toBe(6);
    expect(text(body)).toContain("Reconcile");
    expect(text(body)).toContain("Hypothesis");

    const cards = body.querySelectorAll("article.work-card");
    expect(cards.length).toBe(6);
    cards.forEach((card) => {
      expect(card).not.toHaveAttribute("data-cursor-label");
      expect(card.className).not.toMatch(/tone-m-|tone-d-/);
      expect(card.querySelector(".work-cat-tick")).not.toBeNull();
      expect(text(card.querySelector(".work-case-link")).trim()).toBe("View case study →");
      expect(
        card
          .querySelector('[data-constellation-canvas="card"]')
          ?.getAttribute("data-constellation-active"),
      ).toBe("false");
    });
    // CLI content is in the HTML before any script runs.
    expect(text(body)).toContain("$ gh workflow run release.yml");
    expect(text(body)).toContain("✓ 7m02s · 1,284 tests passed");
  });

  it("activates the hovered/focused card's canvas and flow, and deactivates on leave", async () => {
    const body = mount("work");
    track(initWork());
    track(initConstellationCanvases());
    vi.useFakeTimers();
    try {
      const cards = body.querySelectorAll<HTMLElement>("article.work-card");
      const first = cards[0]!;
      const canvasOf = (c: Element) =>
        c
          .querySelector('[data-constellation-canvas="card"]')!
          .getAttribute("data-constellation-active");

      first.dispatchEvent(new MouseEvent("mouseenter"));
      expect(first.querySelector(".flow-node.is-on")).not.toBeNull();
      expect(canvasOf(first)).toBe("true");
      expect(canvasOf(cards[1]!)).toBe("false");

      vi.advanceTimersByTime(220 * 2);
      expect(first.querySelectorAll(".flow-node.is-done").length).toBe(2);

      first.dispatchEvent(new MouseEvent("mouseleave"));
      expect(canvasOf(first)).toBe("false");
      expect(first.querySelector(".flow-node.is-on")).toBeNull();

      cards[2]!.dispatchEvent(new Event("focusin", { bubbles: true }));
      expect(canvasOf(cards[2]!)).toBe("true");
      cards[2]!.dispatchEvent(new Event("focusout", { bubbles: true }));
      expect(canvasOf(cards[2]!)).toBe("false");
    } finally {
      vi.useRealTimers();
    }
  });

  it("types $ <cmd> at 22ms/char then the result at 18ms/char when scrolled into view", async () => {
    const observers: Array<(entries: Array<{ isIntersecting: boolean }>) => void> = [];
    const Original = window.IntersectionObserver;
    window.IntersectionObserver = class {
      constructor(cb: (e: Array<{ isIntersecting: boolean }>) => void) {
        observers.push(cb);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
    track(() => {
      window.IntersectionObserver = Original;
    });

    const body = mount("work");
    track(initWork());
    vi.useFakeTimers();
    try {
      const card = body.querySelector<HTMLElement>("article.work-card")!;
      const cmd = card.querySelector("[data-work-cmd]")!;
      const res = card.querySelector("[data-work-res]")!;
      const caret = card.querySelector<HTMLElement>("[data-work-caret]")!;
      expect(cmd.textContent).toBe("");
      expect(caret.hidden).toBe(false);

      observers[0]!([{ isIntersecting: true }]);
      expect(card.parentElement).toHaveClass("is-in");

      const full = "$ gh workflow run release.yml";
      vi.advanceTimersByTime(22 * 5);
      expect(cmd.textContent).toBe(full.slice(0, 5));
      vi.advanceTimersByTime(22 * (full.length - 5));
      expect(cmd.textContent).toBe(full);

      const result = "✓ 7m02s · 1,284 tests passed";
      vi.advanceTimersByTime(18 * 4);
      expect(res.textContent).toBe(result.slice(0, 4));
      expect(caret.hidden).toBe(false);
      vi.advanceTimersByTime(18 * result.length);
      expect(res.textContent).toBe(result);
      expect(caret.hidden).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows full command text immediately under reduced motion", async () => {
    mockMatchMedia("prefers-reduced-motion");
    const body = mount("work");
    track(initWork());
    const card = body.querySelector("article.work-card")!;
    expect(text(card.querySelector("[data-work-cmd]"))).toBe("$ gh workflow run release.yml");
    expect(text(card.querySelector("[data-work-res]"))).toBe("✓ 7m02s · 1,284 tests passed");
  });
});

describe("Toolchain", () => {
  it("renders the 30-tool catalog with header counter and 8 filter tabs", async () => {
    const body = mount("toolchain");
    track(initToolchain());

    expect(text(body)).toContain("02 / The toolchain");
    expect(text(body)).toContain("Every layer, deployed with intent.");
    expect(text(body.querySelector("[data-tool-counter]"))).toContain("30 tools");

    const tabs = body.querySelectorAll<HTMLButtonElement>("[data-filter-tab]");
    expect(tabs.length).toBe(8);
    const tabNames = Array.from(tabs).map((t) => t.querySelector("span")?.textContent?.trim());
    expect(tabNames).toEqual([
      "All",
      "CI/CD",
      "IaC & Config",
      "Containers",
      "Cloud",
      "Network & Data",
      "Observability",
      "Scripting",
    ]);

    const cards = body.querySelectorAll<HTMLElement>("[data-tool-card]");
    expect(cards.length).toBe(30);

    // Initial state: "All" selected, all cards active
    const allTab = body.querySelector<HTMLButtonElement>('[data-filter-tab="All"]')!;
    expect(allTab).toHaveClass("is-active");
    expect(allTab.getAttribute("aria-selected")).toBe("true");

    cards.forEach((card) => {
      expect(card).toHaveClass("is-active-tool");
      expect(card).not.toHaveClass("is-ghost-tool");
      expect(card.getAttribute("aria-hidden")).toBe("false");
    });
  });

  it("filters cards by category, updating the live counter and ghosting non-matching cards with stagger", async () => {
    const body = mount("toolchain");
    track(initToolchain());

    const containersTab = body.querySelector<HTMLButtonElement>('[data-filter-tab="Containers"]')!;
    containersTab.click();

    expect(containersTab).toHaveClass("is-active");
    expect(containersTab.getAttribute("aria-selected")).toBe("true");
    expect(body.querySelector('[data-filter-tab="All"]')).not.toHaveClass("is-active");

    // Counter updates to 4 tools
    expect(text(body.querySelector("[data-tool-counter]"))).toContain("4 tools");

    const cards = Array.from(body.querySelectorAll<HTMLElement>("[data-tool-card]"));
    const matching = cards.filter((c) => c.dataset["toolCat"] === "Containers");
    const nonMatching = cards.filter((c) => c.dataset["toolCat"] !== "Containers");

    expect(matching.length).toBe(4);
    expect(nonMatching.length).toBe(26);

    matching.forEach((c) => {
      expect(c).toHaveClass("is-active-tool");
      expect(c).not.toHaveClass("is-ghost-tool");
      expect(c.getAttribute("aria-hidden")).toBe("false");
    });

    nonMatching.forEach((c) => {
      expect(c).toHaveClass("is-ghost-tool");
      expect(c).not.toHaveClass("is-active-tool");
      expect(c.getAttribute("aria-hidden")).toBe("true");
    });

    // Check stagger delay applied
    const firstNonMatching = nonMatching[0]!;
    expect(firstNonMatching.style.getPropertyValue("--filter-delay")).toMatch(/ms$/);

    // Switch back to "All"
    const allTab = body.querySelector<HTMLButtonElement>('[data-filter-tab="All"]')!;
    allTab.click();

    expect(allTab).toHaveClass("is-active");
    expect(text(body.querySelector("[data-tool-counter]"))).toContain("30 tools");
    cards.forEach((c) => {
      expect(c).toHaveClass("is-active-tool");
      expect(c).not.toHaveClass("is-ghost-tool");
    });
  });

  it("supports keyboard navigation on filter tabs (Arrow keys and Enter/Space)", async () => {
    const body = mount("toolchain");
    track(initToolchain());

    const tabs = Array.from(body.querySelectorAll<HTMLButtonElement>("[data-filter-tab]"));
    const allTab = tabs[0]!;

    allTab.focus();
    allTab.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    // Moved to CI/CD tab
    expect(tabs[1]).toHaveClass("is-active");
    expect(text(body.querySelector("[data-tool-counter]"))).toContain("5 tools");

    // Space/Enter activation
    tabs[2]!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(tabs[2]).toHaveClass("is-active");
    expect(text(body.querySelector("[data-tool-counter]"))).toContain("4 tools");
  });

  it("snaps instantly without stagger delays under reduced motion", async () => {
    mockMatchMedia("prefers-reduced-motion");
    const body = mount("toolchain");
    track(initToolchain());

    const cicdTab = body.querySelector<HTMLButtonElement>('[data-filter-tab="CI/CD"]')!;
    cicdTab.click();

    const cards = Array.from(body.querySelectorAll<HTMLElement>("[data-tool-card]"));
    cards.forEach((card) => {
      expect(card.style.getPropertyValue("--filter-delay")).toBe("0ms");
    });
    expect(text(body.querySelector("[data-tool-counter]"))).toContain("5 tools");
  });
});

describe("Static sections", () => {
  it("renders the 5-step How I Work section and pull-quote", async () => {
    const body = mount("how-i-work");
    for (const t of ["Understand", "Plan", "Delegate / Build", "Review", "Measure"]) {
      expect(text(body)).toContain(t);
    }
    expect(body.querySelectorAll("ol > li").length).toBe(5);
    expect(text(body)).toMatch(/if it pages at 3am, it pages me first/i);
  });

  it("renders the 4 placeholder Certifications cards", async () => {
    const body = mount("certifications");
    expect(text(body)).toContain("Certifications");
    expect(text(body)).toContain("[Certification Name — e.g. AWS Solutions Architect]");
    expect(body.querySelectorAll("article").length).toBe(4);
    expect(text(body).match(/\[Year\]/g)?.length).toBe(4);
  });

  it("renders the Experience commit-log timeline with standard section heading, placeholders, HEAD badge, and CTA", async () => {
    const body = mount("experience");
    expect(text(body)).toContain("04 / Experience");
    expect(text(body)).toContain("Years spent keeping");
    expect(text(body)).toContain("systems");
    expect(text(body)).toContain("honest.");
    expect(text(body)).toContain("[3] roles");
    expect(text(body)).toContain("since [year]");
    expect(text(body)).toContain("[Month Year] → Present");
    expect(text(body).match(/\[Company Name\]/g)?.length).toBe(3);
    expect(text(body).match(/\[Job Title\]/g)?.length).toBe(3);
    expect(text(body)).toContain("[a3f9c21]");
    expect(text(body)).toContain("[7be41d0]");
    expect(text(body)).toContain("[4c19e85]");
    expect(text(body)).not.toContain("<!--");
    expect(text(body)).not.toContain("-->");

    const headBadges = Array.from(body.querySelectorAll("span")).filter(
      (el) => el.textContent?.trim() === "HEAD",
    );
    expect(headBadges.length).toBe(1);

    expect(text(body)).toContain("View Full Experience →");
  });

  it("initializes expand/collapse accordion states and toggles commit details", async () => {
    const body = mount("experience");
    track(initExperience(body));

    const cards = body.querySelectorAll<HTMLElement>("[data-exp-card]");
    expect(cards.length).toBe(3);
    expect(cards[0]?.classList.contains("is-expanded")).toBe(true);
    expect(cards[1]?.classList.contains("is-expanded")).toBe(false);
    expect(cards[2]?.classList.contains("is-expanded")).toBe(false);

    const toggles = body.querySelectorAll<HTMLButtonElement>("[data-exp-toggle]");
    expect(toggles[0]?.getAttribute("aria-expanded")).toBe("true");
    expect(toggles[1]?.getAttribute("aria-expanded")).toBe("false");

    // Click toggle on past role 1 to expand
    toggles[1]?.click();
    expect(cards[1]?.classList.contains("is-expanded")).toBe(true);
    expect(toggles[1]?.getAttribute("aria-expanded")).toBe("true");
    expect(toggles[1]?.getAttribute("aria-label")).toContain("Collapse details");

    // Click again to collapse
    toggles[1]?.click();
    expect(cards[1]?.classList.contains("is-expanded")).toBe(false);
    expect(toggles[1]?.getAttribute("aria-expanded")).toBe("false");
    expect(toggles[1]?.getAttribute("aria-label")).toContain("Expand details");
  });

  it("sets the timeline progress bar to 1 under reduced motion", async () => {
    mockMatchMedia("prefers-reduced-motion");
    const body = mount("experience");
    track(initExperience(body));
    const bar = body.querySelector<HTMLElement>("[data-timeline-progress]")!;
    expect(bar.style.transform).toBe("scaleY(1)");
  });

  it("renders the 3 placeholder Testimonials quote cards", async () => {
    const body = mount("testimonials");
    expect(text(body)).toContain("What people say");
    expect(text(body).match(/\[Name Surname\] — \[Role, Company\]/g)?.length).toBe(3);
    expect(body.querySelectorAll("blockquote.mode-dark").length).toBe(2);
    expect(body.querySelectorAll("blockquote.mode-light").length).toBe(1);
  });

  it("renders the terminal-style contact footer with commands, email row, CTAs, and bottom bar", async () => {
    const body = mount("contact");
    expect(text(body)).toContain("07 · CONTACT");
    expect(text(body)).toContain("shanto@portfolio:~");
    expect(text(body)).toContain("whoami");
    expect(text(body)).toContain("> Platform engineer · open to remote roles");
    expect(text(body)).toContain("$ cat contact.txt");
    expect(text(body)).toContain("Let's ship something");
    expect(text(body)).toContain("that doesn't page anyone.");
    expect(text(body)).toContain("hello@shanto.dev");
    expect(text(body)).toContain("Start a conversation →");
    expect(text(body)).toContain("Download résumé ↓");
    expect(body.querySelector('a[aria-label="GitHub"]')).not.toBeNull();
    expect(body.querySelector('a[aria-label="LinkedIn"]')).not.toBeNull();
    expect(body.querySelector('a[aria-label="X (Twitter)"]')).not.toBeNull();
    expect(text(body)).toContain("© 2026 Shanto · Dhaka, Bangladesh");
    expect(text(body)).toContain("BST");
    expect(text(body)).toContain("Bangladesh");
  });

  it("handles email copy button interaction in the contact footer", async () => {
    vi.useFakeTimers();
    try {
      const body = mount("contact");
      track(initContact(body));

      const copyBtn = body.querySelector<HTMLButtonElement>("[data-copy-email]")!;
      expect(copyBtn.textContent?.trim()).toBe("copy");

      copyBtn.click();
      expect(copyBtn.textContent?.trim()).toBe("copied");

      vi.advanceTimersByTime(1600);
      expect(copyBtn.textContent?.trim()).toBe("copy");
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("Header", () => {
  it("toggles .is-scrolled past 60% of the viewport height", async () => {
    const body = mount("header");
    track(initHeader());
    const pills = body.querySelectorAll(".header-pill");
    expect(pills.length).toBe(3);

    Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 500, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    pills.forEach((p) => expect(p).not.toHaveClass("is-scrolled"));

    Object.defineProperty(window, "scrollY", { value: 601, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    pills.forEach((p) => expect(p).toHaveClass("is-scrolled"));

    Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    pills.forEach((p) => expect(p).not.toHaveClass("is-scrolled"));
  });

  it("links to the page anchors and keeps the active link in sync with the hash", async () => {
    const body = mount("header");
    track(initHeader());
    const hrefs = Array.from(body.querySelectorAll("nav[aria-label='Main'] a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toEqual(["/", "/#test", "/case-studies", "/blog", "/#scale"]);

    const current = () =>
      Array.from(body.querySelectorAll("nav[aria-label='Main'] a[aria-current='page']")).map((a) =>
        a.getAttribute("href"),
      );
    expect(current()).toEqual(["/"]);

    window.location.hash = "#scale";
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    expect(current()).toEqual(["/#scale"]);
    window.location.hash = "";
  });
});

describe("PipelineRail", () => {
  it("becomes visible after scrolling past 50% of #build and marks the active stage", () => {
    const body = mount("pipeline-rail");
    const stageOffsets: Record<string, { top: number; height: number }> = {
      build: { top: 0, height: 800 },
      test: { top: 800, height: 800 },
      deploy: { top: 1600, height: 800 },
      monitor: { top: 2400, height: 800 },
      scale: { top: 3200, height: 800 },
    };

    for (const [id, box] of Object.entries(stageOffsets)) {
      const sec = document.createElement("section");
      sec.id = id;
      Object.defineProperty(sec, "offsetHeight", { value: box.height, configurable: true });
      sec.getBoundingClientRect = () =>
        ({
          top: box.top - window.scrollY,
          bottom: box.top + box.height - window.scrollY,
          left: 0,
          right: 1000,
          width: 1000,
          height: box.height,
          x: 0,
          y: box.top - window.scrollY,
          toJSON: () => {},
        }) as DOMRect;
      body.appendChild(sec);
    }

    Object.defineProperty(window, "innerHeight", { value: 800, configurable: true });
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 4000,
      configurable: true,
    });
    Object.defineProperty(window, "scrollY", { value: 100, configurable: true });

    track(initPipelineRail());
    const rail = body.querySelector<HTMLElement>("[data-pipeline-rail]")!;
    expect(rail.dataset["visible"]).toBe("false");
    expect(rail.getAttribute("aria-hidden")).toBe("true");

    // Scroll past 50% of #build (400px) so midpoint (scrollY + 400 = 900) crosses #test (800)
    Object.defineProperty(window, "scrollY", { value: 500, configurable: true });
    let rafCb: FrameRequestCallback | null = null;
    const origRaf = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb) => {
      rafCb = cb;
      return 1;
    };
    window.dispatchEvent(new Event("scroll"));
    if (rafCb) (rafCb as FrameRequestCallback)(16);
    window.requestAnimationFrame = origRaf;

    expect(rail.dataset["visible"]).toBe("true");
    expect(rail.getAttribute("aria-hidden")).toBe("false");
    expect(body.querySelector('[data-rail-link="test"]')?.getAttribute("aria-current")).toBe(
      "step",
    );
  });
});
