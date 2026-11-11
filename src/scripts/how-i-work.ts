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
  const connectors = Array.from(stage.querySelectorAll<HTMLElement>("[data-flow-connector]"));
  const reduce = prefersReducedMotion();

  // Immediate full render under prefers-reduced-motion
  if (reduce) {
    cards.forEach((c) => {
      c.dataset["revealed"] = "true";
      c.dataset["state"] = "settled";
      const cmdText = c.querySelector<HTMLElement>("[data-flow-cmd-text]");
      if (cmdText) cmdText.textContent = c.dataset["stepCmd"] || cmdText.textContent;
      const bodyEl = c.querySelector<HTMLElement>("[data-flow-body]");
      if (bodyEl) bodyEl.dataset["visible"] = "true";
      const res = c.querySelector<HTMLElement>("[data-flow-result]");
      if (res) res.dataset["visible"] = "true";
    });
    connectors.forEach((conn) => {
      conn.dataset["drawn"] = "true";
      const line = conn.querySelector<SVGPathElement>("[data-connector-line]");
      if (line) line.style.strokeDashoffset = "0";
    });
    return () => {};
  }

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
      delete c.dataset["revealed"];
      delete c.dataset["state"];
      const cmdText = c.querySelector<HTMLElement>("[data-flow-cmd-text]");
      const cursor = c.querySelector<HTMLElement>("[data-flow-cursor]");
      const bodyEl = c.querySelector<HTMLElement>("[data-flow-body]");
      const res = c.querySelector<HTMLElement>("[data-flow-result]");
      if (cmdText) cmdText.textContent = "";
      if (cursor) cursor.style.display = "none";
      if (bodyEl) delete bodyEl.dataset["visible"];
      if (res) delete res.dataset["visible"];
    });
    connectors.forEach((conn) => {
      delete conn.dataset["drawn"];
    });
  };

  // Immediate reset on initialization so cards start completely blank/unrevealed
  resetAll();

  /**
   * Continuous Relay Sequence:
   * 1. Card container reveals (border + chrome appear, content empty)
   * 2. Command line types character by character
   * 3. Title and description fade in
   * 4. Green result confirmation line fades in
   * 5. Card settles, then connector leading to next card draws
   * 6. Once connector finishes, next card begins step 1
   * 7. Resolution card reveals, stats fade in, holds glow ~1.8s, settles
   * 8. Brief pause (~1.4s), resets all, loop restarts
   */
  const runRelayLoop = async () => {
    const loopId = ++activeLoopId;

    while (!isCancelled(loopId)) {
      resetAll();
      await sleep(250);
      if (isCancelled(loopId)) return;

      // Steps 1 to 5 (Cards 0 to 4)
      for (let i = 0; i < 5; i++) {
        if (isCancelled(loopId)) return;
        const card = cards[i];
        if (!card) continue;
        const cmdText = card.querySelector<HTMLElement>("[data-flow-cmd-text]");
        const cursor = card.querySelector<HTMLElement>("[data-flow-cursor]");
        const bodyEl = card.querySelector<HTMLElement>("[data-flow-body]");
        const res = card.querySelector<HTMLElement>("[data-flow-result]");
        const fullCmd = card.dataset["stepCmd"] || "";

        // 1. The card container fades/slides in (border appears, chrome bar appears) — at this moment it should be otherwise empty
        card.dataset["revealed"] = "true";
        card.dataset["state"] = "active";
        if (cursor) cursor.style.display = "inline";
        await sleep(250);
        if (isCancelled(loopId)) return;

        // 2. The command line then types out character by character
        for (let c = 1; c <= fullCmd.length; c++) {
          if (isCancelled(loopId)) return;
          if (cmdText) cmdText.textContent = fullCmd.slice(0, c);
          await sleep(22);
        }
        if (isCancelled(loopId)) return;

        // Command finished typing -> hide cursor
        if (cursor) cursor.style.display = "none";
        await sleep(80);
        if (isCancelled(loopId)) return;

        // 3. The title and description then appear (fade in)
        if (bodyEl) bodyEl.dataset["visible"] = "true";
        await sleep(300);
        if (isCancelled(loopId)) return;

        // 4. The green result/confirmation line fades in last
        if (res) res.dataset["visible"] = "true";
        await sleep(250);
        if (isCancelled(loopId)) return;

        // Card settles
        card.dataset["state"] = "settled";
        await sleep(100);
        if (isCancelled(loopId)) return;

        // 5. Only once ALL of the above has completed for this card does the connector leading to the NEXT card begin drawing
        const conn = connectors[i];
        if (conn) {
          conn.dataset["drawn"] = "true";
          // 6. Only once that connector finishes does the NEXT card begin step 1
          await sleep(380);
          if (isCancelled(loopId)) return;
        }
      }

      // Step 6: Sixth Element (Resolution Card, index 5)
      const resCard = cards[5];
      if (resCard && !isCancelled(loopId)) {
        const resBody = resCard.querySelector<HTMLElement>("[data-flow-body]");
        // 1. Container reveals (border + header with pulsing dot & label)
        resCard.dataset["revealed"] = "true";
        resCard.dataset["state"] = "active";
        await sleep(250);
        if (isCancelled(loopId)) return;

        // 2. 2x2 stats body fades in
        if (resBody) resBody.dataset["visible"] = "true";

        // 3. Hold active glow for ~1.8s
        await sleep(1800);
        if (isCancelled(loopId)) return;

        // 4. Glow settles
        resCard.dataset["state"] = "settled";
      }

      // Brief pause (~1.4s) before restarting loop
      await sleep(1400);
    }
  };

  if (options?.immediate) {
    runRelayLoop();
  } else if (typeof IntersectionObserver !== "undefined") {
    let triggered = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !triggered) {
          triggered = true;
          runRelayLoop();
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
