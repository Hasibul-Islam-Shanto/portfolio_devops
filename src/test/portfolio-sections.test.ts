import { describe, expect, it, vi } from "vitest";
import { initHeroTerminal } from "@/components/hero/hero-terminal";
import { initWork } from "@/components/projects/work";
import { initToolchain } from "@/components/toolstack/toolchain";
import { initHeader } from "@/components/navbar/header";
import { initExperience } from "@/components/experience/experience";
import { initContact } from "@/components/contact/contact";
import { initHowIWork } from "@/components/how-it-works/how-i-work";
import { initPipelineRail } from "@/components/pipeline-rail/pipeline-rail";
import { initSectionNav, getTargetScrollY, smoothScrollTo } from "@/scripts/section-nav";
import { initConstellationCanvases } from "@/scripts/constellation-canvas";
import { initCredentialModal } from "@/components/certifications/credential-modal";
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
        "kubectl get pods",
        "docker ps",
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
    expect(
      document.querySelector('a[href="mailto:mdhasibulislamshanto007@gmail.com"]'),
    ).not.toBeNull();
  });

  it("auto-runs help on load with simulated typing, rendering two-column commands list", async () => {
    mount("hero-terminal");
    vi.useFakeTimers();
    try {
      track(initHeroTerminal());
      vi.advanceTimersByTime(200 + 5 * 35 + 50);
      const history = document.querySelector("[data-terminal-history]")!;
      expect(history.textContent).toContain("AVAILABLE COMMANDS:");
      expect(history.textContent).toContain("kubectl get pods");
      expect(history.textContent).toContain("inspect live cluster workloads");
      expect(history.querySelector(".terminal-help-grid")).not.toBeNull();
      // Fresh empty prompt line ($ _) is ready below output
      expect(document.querySelector<HTMLElement>("[data-terminal-placeholder]")!.hidden).toBe(true);
      const cursor = document.querySelector<HTMLElement>("[data-terminal-cursor]")!;
      expect(cursor.dataset["cursorBlinking"]).toBe("true");
    } finally {
      vi.useRealTimers();
    }
  });

  it("auto-runs help instantly under prefers-reduced-motion without typing animation", async () => {
    mockMatchMedia("prefers-reduced-motion");
    mount("hero-terminal");
    track(initHeroTerminal());
    const history = document.querySelector("[data-terminal-history]")!;
    expect(history.textContent).toContain("AVAILABLE COMMANDS:");
    expect(document.querySelector<HTMLElement>("[data-terminal-placeholder]")!.hidden).toBe(true);
  });

  it("auto-runs help only once per element and does not re-trigger", async () => {
    mount("hero-terminal");
    vi.useFakeTimers();
    try {
      track(initHeroTerminal());
      vi.advanceTimersByTime(200 + 5 * 35 + 50);
      expect(document.querySelectorAll(".terminal-help-grid").length).toBe(1);
      initHeroTerminal();
      vi.advanceTimersByTime(500);
      expect(document.querySelectorAll(".terminal-help-grid").length).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("Work", () => {
  it("renders two cards with mini flows, inactive canvases, GitHub links, and specific project details", async () => {
    const body = mount("work");
    expect(body.querySelectorAll('[aria-label="Project pipeline stages"]').length).toBe(2);
    expect(text(body)).toContain("OrderFirst");
    expect(text(body)).toContain("DevTalk");

    const cards = body.querySelectorAll("article.work-card");
    expect(cards.length).toBe(2);
    cards.forEach((card) => {
      expect(card).not.toHaveAttribute("data-cursor-label");
      expect(card.className).not.toMatch(/tone-m-|tone-d-/);
      expect(card.querySelector(".work-cat-tick")).not.toBeNull();
      expect(text(card.querySelector(".work-case-link")).replace(/\s+/g, " ").trim()).toBe(
        "View project details →",
      );
      expect(
        card
          .querySelector('[data-constellation-canvas="card"]')
          ?.getAttribute("data-constellation-active"),
      ).toBe("false");

      // Single GitHub logo + text link on top
      const ghLinks = card.querySelectorAll('a[href^="https://github.com/"]');
      expect(ghLinks.length).toBe(1);
      expect(text(ghLinks[0]!)).toContain("GitHub");

      // CLI command elements are completely removed
      expect(card.querySelector("[data-work-cmd]")).toBeNull();
      expect(card.querySelector("[data-work-res]")).toBeNull();
      expect(text(card)).not.toContain("$ gh workflow run");
      expect(text(card)).not.toContain("$ trivy image");
    });
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

      cards[1]!.dispatchEvent(new Event("focusin", { bubbles: true }));
      expect(canvasOf(cards[1]!)).toBe("true");
      cards[1]!.dispatchEvent(new Event("focusout", { bubbles: true }));
      expect(canvasOf(cards[1]!)).toBe("false");
    } finally {
      vi.useRealTimers();
    }
  });

  it("ensures all card types share the particle background and enforces only one active card canvas sitewide", async () => {
    // 1. Mount Certifications cards
    const certsBody = mount("certifications");
    track(initConstellationCanvases(certsBody));
    const certCards = certsBody.querySelectorAll<HTMLElement>("article.work-card");
    expect(certCards.length).toBeGreaterThan(0);

    const canvasOf = (el: Element) =>
      el
        .querySelector('[data-constellation-canvas="card"]')
        ?.getAttribute("data-constellation-active");

    // All certification cards should have the particle canvas
    certCards.forEach((c) => {
      expect(c.querySelector('[data-constellation-canvas="card"]')).not.toBeNull();
      expect(canvasOf(c)).toBe("false");
    });

    // Hovering card 0 activates it
    certCards[0]!.dispatchEvent(new MouseEvent("mouseenter"));
    expect(canvasOf(certCards[0]!)).toBe("true");
    expect(canvasOf(certCards[1]!)).toBe("false");

    // Hovering card 1 deactivates card 0 and activates card 1
    certCards[1]!.dispatchEvent(new MouseEvent("mouseenter"));
    expect(canvasOf(certCards[0]!)).toBe("false");
    expect(canvasOf(certCards[1]!)).toBe("true");

    // Leaving card 1 deactivates it
    certCards[1]!.dispatchEvent(new MouseEvent("mouseleave"));
    expect(canvasOf(certCards[1]!)).toBe("false");

    // 2. Blog cards also render the particle canvas
    const blogDoc = mount("blog");
    const blogCards = blogDoc.querySelectorAll("article");
    expect(blogCards.length).toBeGreaterThan(0);
    blogCards.forEach((b) => {
      expect(b.querySelector('[data-constellation-canvas="card"]')).not.toBeNull();
    });

    // 3. Learnings cards also render the particle canvas
    const learningsDoc = mount("learnings");
    const learningCards = learningsDoc.querySelectorAll(".group.relative.overflow-hidden");
    expect(learningCards.length).toBeGreaterThan(0);
    learningCards.forEach((l) => {
      expect(l.querySelector('[data-constellation-canvas="card"]')).not.toBeNull();
    });
  });

  it("adds .is-in class when card intersects the viewport without rendering terminal commands", async () => {
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

    const card = body.querySelector<HTMLElement>("article.work-card")!;
    expect(card.parentElement).not.toHaveClass("is-in");

    observers[0]!([{ isIntersecting: true }]);
    expect(card.parentElement).toHaveClass("is-in");
  });
});

describe("Toolchain", () => {
  it("renders the 18-tool catalog with header counter and 8 filter tabs", async () => {
    const body = mount("toolchain");
    track(initToolchain());

    expect(text(body)).toContain("03 / The toolchain");
    expect(text(body)).toContain("Every layer, deployed with intent.");
    expect(text(body.querySelector("[data-tool-counter]"))).toContain("18 tools");

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
    expect(cards.length).toBe(18);

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

    // Counter updates to 3 tools
    expect(text(body.querySelector("[data-tool-counter]"))).toContain("3 tools");

    const cards = Array.from(body.querySelectorAll<HTMLElement>("[data-tool-card]"));
    const matching = cards.filter((c) => c.dataset["toolCat"] === "Containers");
    const nonMatching = cards.filter((c) => c.dataset["toolCat"] !== "Containers");

    expect(matching.length).toBe(3);
    expect(nonMatching.length).toBe(15);

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
    expect(text(body.querySelector("[data-tool-counter]"))).toContain("18 tools");
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
    expect(text(body.querySelector("[data-tool-counter]"))).toContain("4 tools");

    // Space/Enter activation
    tabs[2]!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(tabs[2]).toHaveClass("is-active");
    expect(text(body.querySelector("[data-tool-counter]"))).toContain("2 tools");
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
    expect(text(body.querySelector("[data-tool-counter]"))).toContain("4 tools");
  });
});

describe("Static sections", () => {
  it("renders the 5-step How I Work section with terminal cards, connecting arrows, and resolution card", async () => {
    const body = mount("how-i-work");
    for (const t of ["Understand", "Plan", "Delegate / Build", "Review", "Measure"]) {
      expect(text(body)).toContain(t);
    }
    const cards = body.querySelectorAll<HTMLElement>("ol > li[data-flow-card]");
    expect(cards.length).toBe(6);

    // Verify terminal structure in each of the 5 step cards
    const stepCards = Array.from(cards).slice(0, 5);
    stepCards.forEach((card) => {
      // 3 dots window chrome
      const dots = card.querySelectorAll("span.rounded-full");
      expect(dots.length).toBe(3);

      // Coral mono command line
      const cmd = card.querySelector(".text-signal");
      expect(cmd).not.toBeNull();
      expect(text(cmd).trim()).toMatch(/^\$ /);

      // Step title & description
      expect(card.querySelector("h3")).not.toBeNull();
      expect(card.querySelector("p")).not.toBeNull();

      // Green result confirmation
      const res = card.querySelector("[data-flow-result]");
      expect(res).not.toBeNull();
      expect(text(res)).toContain("✓");
    });

    // Verify Resolution card
    const resolutionCard = body.querySelector<HTMLElement>("[data-flow-resolution]");
    expect(resolutionCard).not.toBeNull();
    expect(text(resolutionCard)).toContain("INCIDENT RESOLVED");
    expect(text(resolutionCard)).toContain("SYSTEM STABLE");
    expect(text(resolutionCard)).toContain("3");
    expect(text(resolutionCard)).toContain("bottlenecks resolved");
    expect(text(resolutionCard)).toContain("0");
    expect(text(resolutionCard)).toContain("policy violations");
    expect(text(resolutionCard)).toContain("< 85ms");
    expect(text(resolutionCard)).toContain("p99 latency");
    expect(text(resolutionCard)).toContain("99.95%");
    expect(text(resolutionCard)).toContain("SLO held");

    // Verify 5 connectors
    const connectors = body.querySelectorAll("[data-flow-connector]");
    expect(connectors.length).toBe(5);
  });

  it("animates cards and connectors in a sequential build relay, starting completely unrevealed", async () => {
    vi.useFakeTimers();
    try {
      const body = mount("how-i-work");
      track(initHowIWork(body, { immediate: true }));

      const cards = body.querySelectorAll<HTMLElement>("[data-flow-card]");
      const bodies = body.querySelectorAll<HTMLElement>("[data-flow-body]");
      const results = body.querySelectorAll<HTMLElement>("[data-flow-result]");
      const connectors = body.querySelectorAll<HTMLElement>("[data-flow-connector]");
      const resCard = body.querySelector<HTMLElement>("[data-flow-resolution]");

      // Initially on setup before first card activates: all cards and bodies are unrevealed/invisible
      cards.forEach((c) => {
        expect(c.getAttribute("data-revealed")).toBeNull();
        expect(c.getAttribute("data-state")).toBeNull();
      });
      bodies.forEach((b) => {
        expect(b.getAttribute("data-visible")).toBeNull();
      });
      results.forEach((r) => {
        expect(r.getAttribute("data-visible")).toBeNull();
      });
      connectors.forEach((conn) => {
        expect(conn.getAttribute("data-drawn")).toBeNull();
      });

      // Advance past initial reset pause (250ms)
      await vi.advanceTimersByTimeAsync(260);
      // Card 0 fades/slides in as active, but subsequent cards are completely unrevealed
      expect(cards[0]?.getAttribute("data-revealed")).toBe("true");
      expect(cards[0]?.getAttribute("data-state")).toBe("active");
      expect(cards[1]?.getAttribute("data-revealed")).toBeNull();
      expect(cards[2]?.getAttribute("data-revealed")).toBeNull();
      // At container appearance, inner title/desc and result are not yet visible
      expect(bodies[0]?.getAttribute("data-visible")).toBeNull();
      expect(results[0]?.getAttribute("data-visible")).toBeNull();

      // Card 0 container appearance pause (250ms) + command typing (~33 chars * 22ms = 726ms)
      await vi.advanceTimersByTimeAsync(250 + 33 * 22 + 10);
      const cmdText0 = cards[0]?.querySelector("[data-flow-cmd-text]");
      expect(text(cmdText0 ?? null)).toBe("$ runbook understand --incident");

      // Cursor hides (80ms) -> title and description fade in
      await vi.advanceTimersByTimeAsync(90);
      expect(bodies[0]?.getAttribute("data-visible")).toBe("true");
      expect(results[0]?.getAttribute("data-visible")).toBeNull();

      // Body fade pause (300ms) -> green result line fades in last
      await vi.advanceTimersByTimeAsync(310);
      expect(results[0]?.getAttribute("data-visible")).toBe("true");

      // Result pause (250ms) + settle pause (100ms) -> Card 0 settles and connector 0 draws
      await vi.advanceTimersByTimeAsync(360);
      expect(cards[0]?.getAttribute("data-state")).toBe("settled");
      expect(connectors[0]?.getAttribute("data-drawn")).toBe("true");
      // Card 1 is STILL not revealed while connector is drawing
      expect(cards[1]?.getAttribute("data-revealed")).toBeNull();

      // After connector finish delay (380ms), Card 1 begins step 1
      await vi.advanceTimersByTimeAsync(390);
      expect(cards[1]?.getAttribute("data-revealed")).toBe("true");
      expect(cards[1]?.getAttribute("data-state")).toBe("active");
      expect(cards[2]?.getAttribute("data-revealed")).toBeNull();

      // Advance through remaining steps (Cards 1, 2, 3, 4)
      // Each step takes approx: 250 + 720 + 80 + 300 + 250 + 100 + 380 = ~2080ms
      // For remaining 4 step cards: ~4 * 2100 = ~8400ms
      await vi.advanceTimersByTimeAsync(8500);
      for (let i = 0; i < 5; i++) {
        expect(cards[i]?.getAttribute("data-revealed")).toBe("true");
        expect(cards[i]?.getAttribute("data-state")).toBe("settled");
        expect(bodies[i]?.getAttribute("data-visible")).toBe("true");
        expect(results[i]?.getAttribute("data-visible")).toBe("true");
        expect(connectors[i]?.getAttribute("data-drawn")).toBe("true");
      }

      // Sixth Element (Resolution Card) container reveals with active glow
      expect(resCard?.getAttribute("data-revealed")).toBe("true");
      expect(resCard?.getAttribute("data-state")).toBe("active");

      // Resolution stats body fades in after container reveal pause (250ms)
      await vi.advanceTimersByTimeAsync(260);
      const resBody = resCard?.querySelector("[data-flow-body]");
      expect(resBody?.getAttribute("data-visible")).toBe("true");

      // Active glow holds for ~1800ms
      await vi.advanceTimersByTimeAsync(1850);
      expect(resCard?.getAttribute("data-state")).toBe("settled");

      // After pause (1400ms) + reset (250ms), loop restarts and Card 0 begins again
      await vi.advanceTimersByTimeAsync(1700);
      expect(cards[0]?.getAttribute("data-revealed")).toBe("true");
      expect(cards[0]?.getAttribute("data-state")).toBe("active");
      expect(cards[1]?.getAttribute("data-revealed")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("settles all cards and draws all arrows immediately under prefers-reduced-motion", async () => {
    mockMatchMedia("prefers-reduced-motion");
    const body = mount("how-i-work");
    track(initHowIWork(body));

    const cards = body.querySelectorAll<HTMLElement>("[data-flow-card]");
    expect(cards.length).toBe(6);
    cards.forEach((c) => {
      expect(c.getAttribute("data-revealed")).toBe("true");
      expect(c.getAttribute("data-state")).toBe("settled");
    });

    const bodies = body.querySelectorAll<HTMLElement>("[data-flow-body]");
    expect(bodies.length).toBe(6);
    bodies.forEach((b) => {
      expect(b.getAttribute("data-visible")).toBe("true");
    });

    const results = body.querySelectorAll<HTMLElement>("[data-flow-result]");
    expect(results.length).toBe(5);
    results.forEach((r) => {
      expect(r.getAttribute("data-visible")).toBe("true");
    });

    const connectors = body.querySelectorAll<HTMLElement>("[data-flow-connector]");
    expect(connectors.length).toBe(5);
    connectors.forEach((conn) => {
      expect(conn.getAttribute("data-drawn")).toBe("true");
    });
  });

  it("renders the Recognitions & Credentials preview in a 3-per-row grid with View All CTA", async () => {
    const body = mount("certifications");
    expect(text(body)).toContain("Recognitions");
    expect(text(body)).toContain("Smart Village Idea Competition");
    // Limits preview to 6 cards on the homepage section
    const articles = body.querySelectorAll("article");
    expect(articles.length).toBe(6);
    expect(text(body)).toContain("2023");
    expect(text(body)).toContain("2024");

    // Grid layout: 3 cards per row
    const grid = body.querySelector(".grid");
    expect(grid?.className).toContain("lg:grid-cols-3");

    // Check rank badge is present for items with rank, omitted when empty
    const firstCard = body.querySelector('[data-credential-card="smart-village-idea-competition"]');
    expect(text(firstCard)).toContain("1st Runner-Up");

    const plainCard = body.querySelector('[data-credential-card="docker-container-orchestration"]');
    expect(text(plainCard)).toContain("Docker & Container Orchestration");
    // Plain certification has no rank pill
    expect(plainCard?.querySelector(".rounded-full.bg-signal\\/15")).toBeNull();

    // View details button present on all cards
    const viewDetailBtns = body.querySelectorAll("[data-credential-open]");
    expect(viewDetailBtns.length).toBe(6);

    // Centered "View all" link navigates to /achievements
    const viewAllLink = body.querySelector('a[href="/achievements"]');
    expect(viewAllLink).not.toBeNull();
    expect(text(viewAllLink)).toContain("View all recognitions & credentials");
  });

  it("opens and closes the detail modal with animated contents, focus trapping, and keyboard controls", async () => {
    const body = mount("certifications");
    track(initCredentialModal(body));

    const modal = body.querySelector<HTMLElement>("#credential-modal");
    expect(modal).not.toBeNull();
    expect(modal?.hidden).toBe(true);

    // Click "View details" on Smart Village item
    const openBtn = body.querySelector<HTMLElement>(
      '[data-credential-open="smart-village-idea-competition"]',
    );
    openBtn?.click();

    expect(modal?.hidden).toBe(false);
    expect(modal?.getAttribute("aria-hidden")).toBe("false");
    expect(modal?.querySelector("#credential-modal-title")?.textContent).toBe(
      "Smart Village Idea Competition",
    );
    expect(modal?.querySelector("#credential-modal-rank")?.textContent).toBe("1st Runner-Up");
    expect(modal?.querySelector("#credential-modal-desc")?.textContent).toContain(
      "Ethereum blockchain architecture",
    );
    expect(modal?.querySelector("#credential-modal-issuer")?.textContent).toBe(
      "District Administration, Sylhet & SUST",
    );
    expect(modal?.querySelector("#credential-modal-year")?.textContent).toBe("2023");

    // Scanned certificate image is rendered
    const img = modal?.querySelector<HTMLImageElement>("#credential-modal-images-wrapper img");
    expect(img?.src).toContain("idea_competition.webp");

    // Press Escape to close modal
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(modal?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders the Experience commit-log timeline with standard section heading, real roles, HEAD badge, and CTA", async () => {
    const body = mount("experience");
    expect(text(body)).toContain("02 / Experience");
    expect(text(body)).toContain("Years spent keeping");
    expect(text(body)).toContain("systems");
    expect(text(body)).toContain("honest.");
    expect(text(body)).toContain("2 roles");
    expect(text(body)).toContain("since 2022");
    expect(text(body)).toContain("Jan 2024 → Jun 2026");
    expect(text(body)).toContain("Universal Machine Inc.");
    expect(text(body)).toContain("InnovexIT");
    expect(text(body)).toContain("Front-End Engineer");
    expect(text(body)).toContain("Junior Web Developer");
    expect(text(body)).toContain("a3f9c21");
    expect(text(body)).toContain("7be41d0");
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
    expect(cards.length).toBe(2);
    expect(cards[0]?.classList.contains("is-expanded")).toBe(true);
    expect(cards[1]?.classList.contains("is-expanded")).toBe(false);

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

  it("renders the terminal-style contact footer with commands, email row, CTAs, and bottom bar", async () => {
    const body = mount("contact");
    expect(text(body)).toContain("07 · CONTACT");
    expect(text(body)).toContain("shanto@portfolio:~");
    expect(text(body)).toContain("whoami");
    expect(text(body)).toContain("> DevOps Engineer · open to DevOps roles & freelance");
    expect(text(body)).toContain("$ cat contact.txt");
    expect(text(body)).toContain("Let's ship something");
    expect(text(body)).toContain("that doesn't page anyone.");
    expect(text(body)).toContain("mdhasibulislamshanto007@gmail.com");
    expect(text(body)).toContain("Start a conversation →");
    expect(text(body)).toContain("Download résumé ↓");
    expect(body.querySelector('a[aria-label="GitHub"]')).not.toBeNull();
    expect(body.querySelector('a[aria-label="LinkedIn"]')).not.toBeNull();
    expect(body.querySelector('a[aria-label="X (Twitter)"]')).not.toBeNull();
    expect(text(body)).toContain("© 2026 Hasibul Islam Shanto · Rangpur, Bangladesh");
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
    track(initHeader(body));
    const pills = body.querySelectorAll(".header-pill");
    expect(pills.length).toBe(2);

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
    track(initHeader(body));
    const hrefs = Array.from(body.querySelectorAll("nav[aria-label='Main'] a")).map((a) =>
      a.getAttribute("href"),
    );
    expect(hrefs).toEqual(["/", "/#test", "/about", "/learnings", "/blog", "/#scale"]);

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

  it("toggles mobile drawer menu, responds to nav links and Escape key", async () => {
    const body = mount("header");
    track(initHeader(body));

    const toggle = body.querySelector<HTMLButtonElement>("[data-mobile-menu-toggle]")!;
    const menu = body.querySelector<HTMLElement>("[data-mobile-menu]")!;
    const openIcon = toggle.querySelector('[data-menu-icon="open"]')!;
    const closeIcon = toggle.querySelector('[data-menu-icon="close"]')!;

    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(menu.getAttribute("aria-hidden")).toBe("true");
    expect(menu).toHaveClass("hidden");

    // Open menu
    toggle.click();
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(menu.getAttribute("aria-hidden")).toBe("false");
    expect(menu).not.toHaveClass("hidden");
    expect(menu).toHaveClass("flex");
    expect(openIcon).toHaveClass("hidden");
    expect(closeIcon).not.toHaveClass("hidden");

    // Clicking a nav link inside mobile menu closes it
    const firstLink = menu.querySelector<HTMLAnchorElement>("[data-mobile-nav-link]")!;
    firstLink.click();
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(menu.getAttribute("aria-hidden")).toBe("true");
    expect(menu).toHaveClass("hidden");

    // Open again and close with Escape key
    toggle.click();
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(menu).toHaveClass("hidden");
  });

  it("handles scroll-direction-aware auto-hide, idle timer, and hover exception past hero", async () => {
    vi.useFakeTimers();
    try {
      const body = mount("header");
      const hero = document.createElement("section");
      hero.id = "hero";
      Object.defineProperty(hero, "offsetTop", { value: 0, configurable: true });
      Object.defineProperty(hero, "offsetHeight", { value: 800, configurable: true });
      body.appendChild(hero);

      track(initHeader(body));
      const header = body.querySelector<HTMLElement>("[data-site-header]")!;

      // 1. Within hero (scrollY <= 800) -> always visible
      Object.defineProperty(window, "scrollY", { value: 400, configurable: true });
      window.dispatchEvent(new Event("scroll"));
      expect(header).not.toHaveClass("header-hidden");

      // 2. Scrolling down past hero (800 -> 1000) -> auto-hides immediately
      Object.defineProperty(window, "scrollY", { value: 1000, configurable: true });
      window.dispatchEvent(new Event("scroll"));
      expect(header).toHaveClass("header-hidden");

      // 3. Scrolling up past hero (1000 -> 900) -> reappears
      Object.defineProperty(window, "scrollY", { value: 900, configurable: true });
      window.dispatchEvent(new Event("scroll"));
      expect(header).not.toHaveClass("header-hidden");

      // 4. Idle timeout: after 1.8s of no scroll -> hides
      vi.advanceTimersByTime(1850);
      expect(header).toHaveClass("header-hidden");

      // 5. Scroll up again -> reappears
      Object.defineProperty(window, "scrollY", { value: 850, configurable: true });
      window.dispatchEvent(new Event("scroll"));
      expect(header).not.toHaveClass("header-hidden");

      // 6. Hover over header -> cancels/pauses idle timer
      header.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
      vi.advanceTimersByTime(2500);
      expect(header).not.toHaveClass("header-hidden"); // Still visible because hovered!

      // 7. Mouse leaves header -> resumes idle timer and hides after delay
      header.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
      vi.advanceTimersByTime(1850);
      expect(header).toHaveClass("header-hidden");

      // 8. Scrolling back up into hero section -> reappears immediately
      Object.defineProperty(window, "scrollY", { value: 200, configurable: true });
      window.dispatchEvent(new Event("scroll"));
      expect(header).not.toHaveClass("header-hidden");
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("PipelineRail", () => {
  it("becomes visible after scrolling past 50% of #hero and marks the active section", () => {
    const body = mount("pipeline-rail");
    const sectionOffsets: Record<string, { top: number; height: number }> = {
      hero: { top: 0, height: 800 },
      projects: { top: 800, height: 800 },
      experience: { top: 1600, height: 800 },
      toolchain: { top: 2400, height: 800 },
      certifications: { top: 3200, height: 800 },
      process: { top: 4000, height: 800 },
      principles: { top: 4800, height: 800 },
      contact: { top: 5600, height: 800 },
    };

    for (const [id, box] of Object.entries(sectionOffsets)) {
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
      value: 6400,
      configurable: true,
    });
    Object.defineProperty(window, "scrollY", { value: 100, configurable: true });

    track(initPipelineRail());
    const rail = body.querySelector<HTMLElement>("[data-pipeline-rail]")!;
    expect(rail.dataset["visible"]).toBe("false");
    expect(rail.getAttribute("aria-hidden")).toBe("true");

    // Scroll past 50% of #hero (400px) so midpoint (scrollY + 400 = 900) crosses #projects (800)
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
    expect(body.querySelector('[data-rail-link="projects"]')?.getAttribute("aria-current")).toBe(
      "step",
    );
  });
});

describe("TechMarquee", () => {
  it("renders an infinite marquee band with accessibility attributes and duplicated items", async () => {
    const body = mount("tech-marquee");
    const region = body.querySelector('[role="region"][aria-label="Technologies I work with"]');
    expect(region).not.toBeNull();

    const groups = body.querySelectorAll(".tech-marquee-group");
    expect(groups.length).toBe(2);
    expect(groups[0]?.getAttribute("aria-hidden")).toBeNull();
    expect(groups[1]?.getAttribute("aria-hidden")).toBe("true");

    const pills = groups[0]?.querySelectorAll(".tech-pill");
    expect(pills?.length).toBe(16);

    const labels = Array.from(pills || []).map((p) => p.querySelector("span")?.textContent?.trim());
    expect(labels).toContain("AWS");
    expect(labels).toContain("Google Cloud");
    expect(labels).toContain("Kubernetes");
    expect(labels).toContain("Docker");
    expect(labels).toContain("Terraform");
    expect(labels).toContain("GitHub Actions");
    expect(labels).toContain("Argo CD");
    expect(labels).toContain("PostgreSQL");
    expect(labels).toContain("Redis");
    expect(labels).toContain("NGINX");
    expect(labels).toContain("Prometheus");
    expect(labels).toContain("Grafana");
    expect(labels).toContain("HashiCorp Vault");

    // Each pill contains a circular badge with SVG
    const firstPill = pills?.[0];
    const badge = firstPill?.querySelector("div");
    expect(badge?.className).toContain("rounded-full");
    expect(badge?.className).toContain("bg-white");
    expect(badge?.querySelector("svg")).not.toBeNull();
  });
});

describe("SectionNav", () => {
  it("renders all eight eyebrows as real anchor links with matching IDs", () => {
    const body = mount("index");
    const eyebrows = Array.from(body.querySelectorAll<HTMLAnchorElement>("[data-section-eyebrow]"));
    expect(eyebrows.length).toBe(8);

    const mapped = eyebrows.map((a) => ({
      eyebrow: a.dataset["sectionEyebrow"],
      href: a.getAttribute("href"),
      tagName: a.tagName.toLowerCase(),
    }));

    expect(mapped).toEqual([
      { eyebrow: "hero", href: "#hero", tagName: "a" },
      { eyebrow: "projects", href: "#projects", tagName: "a" },
      { eyebrow: "experience", href: "#experience", tagName: "a" },
      { eyebrow: "toolchain", href: "#toolchain", tagName: "a" },
      { eyebrow: "certifications", href: "#certifications", tagName: "a" },
      { eyebrow: "process", href: "#process", tagName: "a" },
      { eyebrow: "principles", href: "#principles", tagName: "a" },
      { eyebrow: "contact", href: "#contact", tagName: "a" },
    ]);
  });

  it("activates the clicked eyebrow, triggers highlight, and sets aria-current", () => {
    const body = mount("index");
    track(initSectionNav(body));

    const initialActive = body.querySelector<HTMLAnchorElement>('[data-section-eyebrow="hero"]')!;
    expect(initialActive.classList.contains("is-active")).toBe(true);
    expect(initialActive.getAttribute("aria-current")).toBe("location");

    const projectsLink = body.querySelector<HTMLAnchorElement>(
      '[data-section-eyebrow="projects"]',
    )!;
    projectsLink.click();

    expect(projectsLink.classList.contains("is-active")).toBe(true);
    expect(projectsLink.getAttribute("aria-current")).toBe("location");
    expect(projectsLink.classList.contains("is-highlighted")).toBe(true);
    expect(initialActive.classList.contains("is-active")).toBe(false);
  });

  it("smoothScrollTo jumps instantly when prefersReducedMotion is true", () => {
    mockMatchMedia("prefers-reduced-motion");
    const scrollSpy = vi.fn();
    window.scrollTo = scrollSpy;

    smoothScrollTo(1200, 700);

    expect(scrollSpy).toHaveBeenCalledWith(0, 1200);
  });

  it("getTargetScrollY calculates correct offset taking into account scroll-margin-top", () => {
    const section = document.createElement("section");
    section.style.scrollMarginTop = "96px";
    section.getBoundingClientRect = () =>
      ({
        top: 500,
        bottom: 1200,
        left: 0,
        right: 800,
        width: 800,
        height: 700,
        x: 0,
        y: 500,
        toJSON: () => {},
      }) as DOMRect;
    document.body.appendChild(section);

    Object.defineProperty(window, "scrollY", { value: 100, configurable: true });

    const targetY = getTargetScrollY(section);
    // targetY = scrollY (100) + rect.top (500) - offset (96) = 504
    expect(targetY).toBe(504);
  });
});
