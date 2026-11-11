import { createCleanup, prefersReducedMotion } from "./util";

export interface InitHowIWorkOptions {
  immediate?: boolean;
}

export function initHowIWork(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
  options?: InitHowIWorkOptions,
): () => void {
  if (!root) return () => {};
  const stage = root.querySelector<HTMLElement>("[data-flow-stage]");
  if (!stage) return () => {};

  const cleanup = createCleanup();
  const cards = Array.from(stage.querySelectorAll<HTMLElement>("[data-flow-card]"));
  const svg = stage.querySelector<SVGSVGElement>("[data-flow-svg]");
  const paths = Array.from(stage.querySelectorAll<SVGPathElement>("[data-flow-path]"));
  const reduce = prefersReducedMotion();

  /** Dynamically compute SVG bezier curves connecting each step in the zigzag layout */
  const updateArrows = () => {
    if (!svg || window.innerWidth < 1024) return;
    const stageRect = stage.getBoundingClientRect();
    if (stageRect.width === 0) return;

    const getPort = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return {
        left: r.left - stageRect.left,
        right: r.right - stageRect.left,
        top: r.top - stageRect.top,
        bottom: r.bottom - stageRect.top,
        centerX: r.left - stageRect.left + r.width / 2,
        centerY: r.top - stageRect.top + r.height / 2,
        width: r.width,
        height: r.height,
      };
    };

    const [c1, c2, c3, c4, c5] = cards;
    if (!c1 || !c2 || !c3 || !c4 || !c5 || paths.length < 4) return;

    const p1 = getPort(c1);
    const p2 = getPort(c2);
    const p3 = getPort(c3);
    const p4 = getPort(c4);
    const p5 = getPort(c5);

    // Path 0: Card 1 (Row 1 Left) -> Card 2 (Row 1 Right)
    const dx1 = Math.max(20, p2.left - 8 - p1.right);
    const d1 = `M ${p1.right} ${p1.centerY} C ${p1.right + dx1 * 0.5} ${p1.centerY}, ${p1.right + dx1 * 0.5} ${p2.centerY}, ${p2.left - 8} ${p2.centerY}`;

    // Path 1: Card 2 (Row 1 Right) -> Card 3 (Row 2 Left)
    const x1_2 = p2.left;
    const y1_2 = p2.bottom - 24;
    const x2_2 = p3.right + 8;
    const y2_2 = p3.top + 32;
    const dx2 = Math.max(40, x1_2 - x2_2);
    const d2 = `M ${x1_2} ${y1_2} C ${x1_2 - dx2 * 0.4} ${y1_2 + 45}, ${x2_2 + dx2 * 0.4} ${y2_2 - 35}, ${x2_2} ${y2_2}`;

    // Path 2: Card 3 (Row 2 Left) -> Card 4 (Row 2 Right)
    const dx3 = Math.max(20, p4.left - 8 - p3.right);
    const d3 = `M ${p3.right} ${p3.centerY + 16} C ${p3.right + dx3 * 0.5} ${p3.centerY + 16}, ${p3.right + dx3 * 0.5} ${p4.centerY}, ${p4.left - 8} ${p4.centerY}`;

    // Path 3: Card 4 (Row 2 Right) -> Card 5 (Row 3 Center)
    const x1_4 = p4.left;
    const y1_4 = p4.bottom - 24;
    const x2_4 = p5.centerX + 35;
    const y2_4 = p5.top - 8;
    const dx4 = Math.max(30, x1_4 - x2_4);
    const d4 = `M ${x1_4} ${y1_4} C ${x1_4 - dx4 * 0.4} ${y1_4 + 45}, ${x2_4 + 25} ${y2_4 - 40}, ${x2_4} ${y2_4}`;

    const ds = [d1, d2, d3, d4];
    paths.forEach((path, idx) => {
      path.setAttribute("d", ds[idx] || "");
      const len = typeof path.getTotalLength === "function" ? path.getTotalLength() : 300;
      path.style.strokeDasharray = `${len}`;
      if (path.dataset["drawn"] === "true") {
        path.style.strokeDashoffset = "0";
        path.style.opacity = "1";
      } else {
        path.style.strokeDashoffset = `${len}`;
        path.style.opacity = "0";
      }
    });
  };

  // Immediate full render under prefers-reduced-motion
  if (reduce) {
    cards.forEach((c) => {
      c.dataset["state"] = "settled";
      const cmdText = c.querySelector<HTMLElement>("[data-flow-cmd-text]");
      if (cmdText) cmdText.textContent = c.dataset["stepCmd"] || cmdText.textContent;
      const res = c.querySelector<HTMLElement>("[data-flow-result]");
      if (res) res.dataset["visible"] = "true";
    });
    paths.forEach((p) => {
      p.dataset["drawn"] = "true";
      p.style.strokeDashoffset = "0";
      p.style.opacity = "1";
    });
    updateArrows();
    return () => {};
  }

  // Calculate arrow geometry initially
  updateArrows();

  // Recalculate on window resize
  const onResize = () => {
    updateArrows();
  };
  window.addEventListener("resize", onResize);
  cleanup.add(() => window.removeEventListener("resize", onResize));

  let activeLoopId = 0;
  let isDestroyed = false;
  cleanup.add(() => {
    isDestroyed = true;
    activeLoopId++;
  });

  const isCancelled = (id: number) => isDestroyed || id !== activeLoopId;

  const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => {
      const timer = window.setTimeout(resolve, ms);
      cleanup.add(() => window.clearTimeout(timer));
    });
  };

  const resetAll = () => {
    cards.forEach((c) => {
      delete c.dataset["state"];
      const cmdText = c.querySelector<HTMLElement>("[data-flow-cmd-text]");
      const cursor = c.querySelector<HTMLElement>("[data-flow-cursor]");
      const res = c.querySelector<HTMLElement>("[data-flow-result]");
      if (cmdText) cmdText.textContent = "";
      if (cursor) cursor.style.display = "none";
      if (res) delete res.dataset["visible"];
    });
    paths.forEach((p) => {
      delete p.dataset["drawn"];
      p.style.transition = "none";
      const strokeLen = typeof p.getTotalLength === "function" ? p.getTotalLength() : 300;
      p.style.strokeDasharray = `${strokeLen}`;
      p.style.strokeDashoffset = `${strokeLen}`;
      p.style.opacity = "0";
    });
  };

  /**
   * Continuous Relay Sequence:
   * 1. Card activates (coral border + glow)
   * 2. Command types out character by character
   * 3. Result line prints in
   * 4. Card settles to resting border
   * 5. Connecting arrow draws to next card
   * 6. Next card begins typing
   * 7. After step 5 finishes, holds completed diagram, then restarts continuously
   */
  const runRelayLoop = async () => {
    const loopId = ++activeLoopId;

    while (!isCancelled(loopId)) {
      updateArrows();
      resetAll();
      await sleep(200);
      if (isCancelled(loopId)) return;

      for (let i = 0; i < cards.length; i++) {
        if (isCancelled(loopId)) return;
        const card = cards[i];
        if (!card) continue;
        const cmdText = card.querySelector<HTMLElement>("[data-flow-cmd-text]");
        const cursor = card.querySelector<HTMLElement>("[data-flow-cursor]");
        const res = card.querySelector<HTMLElement>("[data-flow-result]");
        const fullCmd = card.dataset["stepCmd"] || "";

        // Activate current card
        card.dataset["state"] = "active";
        if (cursor) cursor.style.display = "inline";

        // Type command character by character
        for (let c = 1; c <= fullCmd.length; c++) {
          if (isCancelled(loopId)) return;
          if (cmdText) cmdText.textContent = fullCmd.slice(0, c);
          await sleep(22);
        }
        if (isCancelled(loopId)) return;

        // Command finished typing -> hide cursor
        if (cursor) cursor.style.display = "none";
        await sleep(100);
        if (isCancelled(loopId)) return;

        // Print result line
        if (res) res.dataset["visible"] = "true";
        await sleep(250);
        if (isCancelled(loopId)) return;

        // Settle card border
        card.dataset["state"] = "settled";

        // Draw connecting arrow to next step
        if (i < paths.length) {
          const path = paths[i];
          if (path) {
            updateArrows();
            path.dataset["drawn"] = "true";
            path.style.transition = "stroke-dashoffset 400ms ease-out, opacity 150ms ease-out";
            path.style.strokeDashoffset = "0";
            path.style.opacity = "1";
            await sleep(420);
            if (isCancelled(loopId)) return;
          }
        }
      }

      if (isCancelled(loopId)) return;
      // Hold full completed state for ~2.5s before restarting loop
      await sleep(2500);
    }
  };

  if (options?.immediate) {
    runRelayLoop();
  } else if (typeof IntersectionObserver !== "undefined") {
    let isVisible = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && !isVisible) {
          isVisible = true;
          runRelayLoop();
        } else if (!entry.isIntersecting && isVisible) {
          isVisible = false;
          activeLoopId++; // pause loop when out of viewport
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(stage);
    cleanup.add(() => observer.disconnect());
  } else {
    runRelayLoop();
  }

  return () => cleanup.run();
}
