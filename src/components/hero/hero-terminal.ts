import { createCleanup, prefersReducedMotion } from "@/scripts/util";

export const TERMINAL_PILLS = [
  "help",
  "whoami",
  "kubectl get pods",
  "docker ps",
  "sudo hire shanto",
] as const;

export const COMMAND_LIST = [
  { cmd: "help", desc: "list available portfolio commands" },
  { cmd: "whoami", desc: "print current operator identity" },
  { cmd: "kubectl get pods", desc: "inspect live cluster workloads" },
  { cmd: "docker ps", desc: "list running demo containers" },
  { cmd: "deploy", desc: "run production rollout pipeline" },
  { cmd: "docker compose", desc: "start local demo stack" },
  { cmd: "terraform plan", desc: "preview infrastructure state diff" },
  { cmd: "sudo hire shanto", desc: "provision a platform engineer" },
  { cmd: "clear", desc: "clear terminal screen history" },
] as const;

const TYPING_CHAR_MS = 35;

const coralBold = (t: string) => `<span class="font-bold text-signal">${t}</span>`;
const dim = (t: string) => `<span class="text-[var(--terminal-dim)]">${t}</span>`;
const bold = (t: string) => `<span class="font-bold text-[var(--terminal-fg)]">${t}</span>`;
const row = (inner: string) => `<div>${inner}</div>`;

/** Returns the HTML for a command's output, "CLEAR" for `clear`, or the not-found message. */
export function renderCommandOutput(rawCommand: string): string {
  const cmd = rawCommand.trim().toLowerCase().replace(/\s+/g, " ");

  switch (cmd) {
    case "clear":
      return "CLEAR";
    case "help":
      return `<div class="space-y-1.5 text-[var(--terminal-fg)]">
        <div class="font-bold text-[var(--terminal-fg)]">AVAILABLE COMMANDS:</div>
        <div class="terminal-help-grid grid grid-cols-1 gap-x-4 gap-y-1 items-baseline font-mono text-xs sm:grid-cols-[auto_1fr] sm:gap-x-6">
          ${COMMAND_LIST.map(
            (c) =>
              `<div class="font-semibold text-signal">${c.cmd}</div><div class="text-[var(--terminal-dim)]">— ${c.desc}</div>`,
          ).join("")}
        </div>
      </div>`;
    case "whoami":
      return `<div class="text-[var(--terminal-fg)]">shanto</div>`;
    case "deploy":
      return `<div class="space-y-1 text-[var(--terminal-fg)]">
        ${row(`${dim("[01/04]")} building ghcr.io/shanto/core-api:v2463 ... ${coralBold("done")} ${dim("(14.2s)")}`)}
        ${row(`${dim("[02/04]")} cosign verify ${dim("sha256:9c4e1b8f02a4")} ... ${coralBold("verified")}`)}
        ${row(`${dim("[03/04]")} rolling update prod-ap-south-1 (6/6 replicas ${coralBold("ready")})`)}
        ${row(`${dim("[04/04]")} ${bold("slo gate:")} p99=18ms · error_rate=0.00% · ${coralBold("RELEASE #2463 HEALTHY")}`)}
      </div>`;
    case "kubectl get pods":
      return `<div class="overflow-x-auto text-[var(--terminal-fg)]"><pre class="font-mono text-xs leading-relaxed">${bold("NAME                      READY   STATUS    RESTARTS   AGE\n")}core-api-7d9f8b-x4k2p     2/2     ${coralBold("Running")}${dim("   0          14d\n")}edge-proxy-5c8b9d-m9n1q   2/2     ${coralBold("Running")}${dim("   0          14d\n")}pay-worker-6f4d2c-r7t8v   1/1     ${coralBold("Running")}${dim("   0          9d\n")}otel-agent-8b2f1a-z3w5k   1/1     ${coralBold("Running")}${dim("   0          31d")}</pre></div>`;
    case "docker ps":
      return `<div class="overflow-x-auto text-[var(--terminal-fg)]"><pre class="font-mono text-xs leading-relaxed">${bold("CONTAINER ID   IMAGE                  STATUS              PORTS\n")}${dim("a1b2c3d4e5f6   ")}demo/api-gateway:1.4   ${coralBold("running (healthy)")}   0.0.0.0:8080-&gt;8080/tcp\n${dim("f6e5d4c3b2a1   ")}demo/postgres-ha:16    ${coralBold("running (healthy)")}   5432/tcp\n${dim("9a8b7c6d5e4f   ")}demo/redis-cache:7.2   ${coralBold("running (healthy)")}   6379/tcp</pre></div>`;
    case "docker compose":
    case "docker compose up":
      return `<div class="space-y-1 text-[var(--terminal-fg)]">
        <div class="font-bold text-[var(--terminal-fg)]">[+] Running 3/3 <span class="font-normal text-[var(--terminal-dim)]">(demo-stack.compose.yml)</span></div>
        ${row(`Creating demo-api... ${coralBold("done")} ${dim("(0.6s)")}`)}
        ${row(`Creating demo-db... ${coralBold("done")} ${dim("(0.4s)")}`)}
        ${row(`Creating demo-cache... ${coralBold("done")} ${dim("(0.3s)")}`)}
      </div>`;
    case "terraform plan":
      return `<div class="space-y-1 text-[var(--terminal-fg)]">
        ${row(`${coralBold("+")} module.eks.aws_eks_node_group.spot_workers`)}
        ${row(`${coralBold("+")} module.observability.helm_release.otel_collector`)}
        ${row(`${coralBold("~")} module.rds.aws_db_instance.ledger_primary`)}
        <div class="pt-1 text-[var(--terminal-fg)]">${bold("Plan:")} 2 to add, 1 to change, 0 to destroy. ${coralBold("Zero drift detected.")}</div>
      </div>`;
    case "sudo hire shanto":
      return `<div class="space-y-1.5 text-[var(--terminal-fg)]">
        <div class="text-[var(--terminal-dim)]">[sudo] password for recruiter: ********</div>
        <div class="font-bold text-signal">ACCESS GRANTED — Shanto provisioned for Platform / DevOps leadership.</div>
        <div>→ <a href="mailto:mdhasibulislamshanto007@gmail.com" class="font-bold text-signal underline hover:text-[var(--terminal-fg)]">mdhasibulislamshanto007@gmail.com</a> ${dim("or")} <a href="#scale" class="font-bold text-signal underline hover:text-[var(--terminal-fg)]">jump to contact ↓</a></div>
      </div>`;
    default:
      return `<div class="text-[var(--terminal-dim)]">command not found — try help</div>`;
  }
}

/**
 * Interactive hero terminal: preset command pills type their command at 35ms/char then run it,
 * free typing + Enter runs any command, `clear` empties history. Reduced motion runs instantly and
 * stops the cursor blinking.
 */
export function initHeroTerminal(
  root: Document | HTMLElement | undefined = typeof document === "undefined" ? undefined : document,
): () => void {
  if (!root) return () => {};
  const terminal = root.querySelector<HTMLElement>("[data-terminal-root]");
  if (!terminal) return () => {};

  const cleanup = createCleanup();
  const reduce = prefersReducedMotion();
  const body = terminal.querySelector<HTMLElement>("[data-terminal-body]")!;
  const historyEl = terminal.querySelector<HTMLElement>("[data-terminal-history]")!;
  const form = terminal.querySelector<HTMLFormElement>("form")!;
  const input = terminal.querySelector<HTMLInputElement>("input")!;
  const typed = terminal.querySelector<HTMLElement>("[data-terminal-typed]")!;
  const cursor = terminal.querySelector<HTMLElement>("[data-terminal-cursor]")!;
  const placeholder = terminal.querySelector<HTMLElement>("[data-terminal-placeholder]");
  const pills = terminal.querySelectorAll<HTMLButtonElement>("[data-terminal-pill]");

  let isTyping = false;
  let timer = 0;
  let autoRunTimer = 0;
  let value = "";
  let historyCount = 0;

  const render = () => {
    typed.textContent = value;
    typed.hidden = value.length === 0;
    input.value = value;
    const blinking = !reduce && !isTyping;
    cursor.dataset["cursorBlinking"] = String(blinking);
    cursor.classList.toggle("terminal-cursor-blink", blinking);
    if (placeholder) placeholder.hidden = !(value.length === 0 && !isTyping && historyCount === 0);
    body.scrollTop = body.scrollHeight;
  };

  const execute = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const out = renderCommandOutput(trimmed);
    if (out === "CLEAR") {
      historyEl.innerHTML = "";
      historyCount = 0;
      render();
      return;
    }
    const entry = document.createElement("div");
    entry.className = "mb-3.5 space-y-1.5";
    entry.innerHTML = `<div class="flex items-center gap-2"><span class="font-bold text-signal">$</span><span class="font-semibold text-signal cmd"></span></div><div class="pl-4">${out}</div>`;
    entry.querySelector(".cmd")!.textContent = trimmed;
    historyEl.appendChild(entry);
    historyCount++;
    render();
  };

  const onPill = (command: string) => {
    if (autoRunTimer) {
      window.clearTimeout(autoRunTimer);
      autoRunTimer = 0;
    }
    window.clearInterval(timer);
    value = "";
    if (reduce) {
      isTyping = false;
      render();
      execute(command);
      return;
    }
    isTyping = true;
    render();
    let idx = 0;
    timer = window.setInterval(() => {
      idx++;
      if (idx <= command.length) {
        value = command.slice(0, idx);
        render();
      } else {
        window.clearInterval(timer);
        isTyping = false;
        value = "";
        render();
        execute(command);
      }
    }, TYPING_CHAR_MS);
  };

  const startAutoRun = () => {
    if (terminal.dataset["autorunCompleted"] === "true") return;
    terminal.dataset["autorunCompleted"] = "true";

    if (reduce) {
      execute("help");
      return;
    }

    autoRunTimer = window.setTimeout(() => {
      onPill("help");
    }, 200);
  };

  pills.forEach((pill) => {
    const handler = () => onPill(pill.dataset["terminalPill"] ?? "");
    pill.addEventListener("click", handler);
    cleanup.add(() => pill.removeEventListener("click", handler));
  });

  const onInput = () => {
    if (isTyping) {
      input.value = value;
      return;
    }
    value = input.value;
    render();
  };
  const onSubmit = (e: Event) => {
    e.preventDefault();
    if (isTyping) return;
    const current = value;
    value = "";
    render();
    execute(current);
  };
  const onBodyClick = () => input.focus();

  input.addEventListener("input", onInput);
  input.addEventListener("change", onInput);
  form.addEventListener("submit", onSubmit);
  body.addEventListener("click", onBodyClick);
  cleanup.add(() => {
    if (autoRunTimer) window.clearTimeout(autoRunTimer);
    input.removeEventListener("input", onInput);
    input.removeEventListener("change", onInput);
    form.removeEventListener("submit", onSubmit);
    body.removeEventListener("click", onBodyClick);
    window.clearInterval(timer);
  });

  render();
  startAutoRun();
  return () => cleanup.run();
}
