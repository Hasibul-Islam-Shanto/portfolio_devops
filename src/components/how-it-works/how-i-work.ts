import { createCleanup, prefersReducedMotion } from "@/scripts/util";

export interface InitHowIWorkOptions {
  immediate?: boolean;
}

export const initHowIWork = (
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
  options?: InitHowIWorkOptions,
): (() => void) => {
  if (!root) return () => {};
  const stage = root.querySelector<HTMLElement>("[data-flow-stage]");
  if (!stage) return () => {};

  const cleanup = createCleanup();
  const cards = Array.from(stage.querySelectorAll<HTMLElement>("[data-flow-card]"));
  const connectors = Array.from(stage.querySelectorAll<HTMLElement>("[data-flow-connector]"));
  const isReducedMotion = prefersReducedMotion();

  if (isReducedMotion) {
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

  resetAll();

  const runRelayLoop = async () => {
    const loopId = ++activeLoopId;

    while (!isCancelled(loopId)) {
      resetAll();
      await sleep(250);
      if (isCancelled(loopId)) return;

      for (let i = 0; i < 5; i++) {
        if (isCancelled(loopId)) return;
        const card = cards[i];
        if (!card) continue;
        const cmdText = card.querySelector<HTMLElement>("[data-flow-cmd-text]");
        const cursor = card.querySelector<HTMLElement>("[data-flow-cursor]");
        const bodyEl = card.querySelector<HTMLElement>("[data-flow-body]");
        const res = card.querySelector<HTMLElement>("[data-flow-result]");
        const fullCmd = card.dataset["stepCmd"] || "";

        card.dataset["revealed"] = "true";
        card.dataset["state"] = "active";
        if (cursor) cursor.style.display = "inline";
        await sleep(180);
        if (isCancelled(loopId)) return;

        for (let c = 1; c <= fullCmd.length; c++) {
          if (isCancelled(loopId)) return;
          if (cmdText) cmdText.textContent = fullCmd.slice(0, c);
          await sleep(18);
        }
        if (isCancelled(loopId)) return;

        if (cursor) cursor.style.display = "none";
        await sleep(80);
        if (isCancelled(loopId)) return;

        if (bodyEl) bodyEl.dataset["visible"] = "true";
        await sleep(300);
        if (isCancelled(loopId)) return;

        if (res) res.dataset["visible"] = "true";
        await sleep(250);
        if (isCancelled(loopId)) return;

        card.dataset["state"] = "settled";
        await sleep(100);
        if (isCancelled(loopId)) return;

        const conn = connectors[i];
        if (conn) {
          conn.dataset["drawn"] = "true";
          await sleep(380);
          if (isCancelled(loopId)) return;
        }
      }

      const resCard = cards[5];
      if (resCard && !isCancelled(loopId)) {
        const resBody = resCard.querySelector<HTMLElement>("[data-flow-body]");
        resCard.dataset["revealed"] = "true";
        resCard.dataset["state"] = "active";
        await sleep(250);
        if (isCancelled(loopId)) return;

        if (resBody) resBody.dataset["visible"] = "true";

        await sleep(1800);
        if (isCancelled(loopId)) return;

        resCard.dataset["state"] = "settled";
      }

      await sleep(1400);
    }
  };

  if (options?.immediate) {
    runRelayLoop();
  } else if (typeof IntersectionObserver !== "undefined") {
    let isTriggered = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isTriggered) {
          isTriggered = true;
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
};
