import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

export const TERMINAL_PILLS = [
  "help",
  "whoami",
  "deploy",
  "kubectl get pods",
  "docker ps",
  "docker compose",
  "terraform plan",
  "sudo hire shanto",
] as const;

interface HistoryEntry {
  id: number;
  command: string;
  output: ReactNode;
}

const TYPING_CHAR_MS = 35;

function getInitialReducedMotion(framerReduced: boolean | null): boolean {
  if (framerReduced) return true;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return false;
}

function renderCommandOutput(rawCommand: string): ReactNode | "CLEAR" {
  const cmd = rawCommand.trim().toLowerCase().replace(/\s+/g, " ");

  if (cmd === "clear") {
    return "CLEAR";
  }

  if (cmd === "help") {
    return (
      <div className="space-y-1 text-[#EFE6D8]">
        <div className="font-bold text-[#EFE6D8]">AVAILABLE COMMANDS:</div>
        <div>
          <span className="text-[#E8503A]">help</span>{" "}
          <span className="text-[#5A6072]">— list available portfolio commands</span>
        </div>
        <div>
          <span className="text-[#E8503A]">whoami</span>{" "}
          <span className="text-[#5A6072]">— print current operator identity</span>
        </div>
        <div>
          <span className="text-[#E8503A]">deploy</span>{" "}
          <span className="text-[#5A6072]">— run production rollout pipeline</span>
        </div>
        <div>
          <span className="text-[#E8503A]">kubectl get pods</span>{" "}
          <span className="text-[#5A6072]">— inspect live cluster workloads</span>
        </div>
        <div>
          <span className="text-[#E8503A]">docker ps</span>{" "}
          <span className="text-[#5A6072]">— list running demo containers</span>
        </div>
        <div>
          <span className="text-[#E8503A]">docker compose</span>{" "}
          <span className="text-[#5A6072]">— start local demo stack</span>
        </div>
        <div>
          <span className="text-[#E8503A]">terraform plan</span>{" "}
          <span className="text-[#5A6072]">— preview infrastructure state diff</span>
        </div>
        <div>
          <span className="text-[#E8503A]">sudo hire shanto</span>{" "}
          <span className="text-[#5A6072]">— provision a platform engineer</span>
        </div>
      </div>
    );
  }

  if (cmd === "whoami") {
    return <div className="text-[#EFE6D8]">shanto</div>;
  }

  if (cmd === "deploy") {
    return (
      <div className="space-y-1 text-[#EFE6D8]">
        <div>
          <span className="text-[#5A6072]">[01/04]</span> building ghcr.io/shanto/core-api:v2463 ...{" "}
          <span className="font-bold text-[#E8503A]">done</span>{" "}
          <span className="text-[#5A6072]">(14.2s)</span>
        </div>
        <div>
          <span className="text-[#5A6072]">[02/04]</span> cosign verify{" "}
          <span className="text-[#5A6072]">sha256:9c4e1b8f02a4</span> ...{" "}
          <span className="font-bold text-[#E8503A]">verified</span>
        </div>
        <div>
          <span className="text-[#5A6072]">[03/04]</span> rolling update prod-ap-south-1 (6/6
          replicas <span className="font-bold text-[#E8503A]">ready</span>)
        </div>
        <div>
          <span className="text-[#5A6072]">[04/04]</span>{" "}
          <span className="font-bold text-[#EFE6D8]">slo gate:</span> p99=18ms · error_rate=0.00% ·{" "}
          <span className="font-bold text-[#E8503A]">RELEASE #2463 HEALTHY</span>
        </div>
      </div>
    );
  }

  if (cmd === "kubectl get pods") {
    return (
      <div className="overflow-x-auto text-[#EFE6D8]">
        <pre className="font-mono text-xs leading-relaxed">
          <span className="font-bold text-[#EFE6D8]">
            {"NAME                      READY   STATUS    RESTARTS   AGE\n"}
          </span>
          {"core-api-7d9f8b-x4k2p     2/2     "}
          <span className="font-bold text-[#E8503A]">Running</span>
          <span className="text-[#5A6072]">{"   0          14d\n"}</span>
          {"edge-proxy-5c8b9d-m9n1q   2/2     "}
          <span className="font-bold text-[#E8503A]">Running</span>
          <span className="text-[#5A6072]">{"   0          14d\n"}</span>
          {"pay-worker-6f4d2c-r7t8v   1/1     "}
          <span className="font-bold text-[#E8503A]">Running</span>
          <span className="text-[#5A6072]">{"   0          9d\n"}</span>
          {"otel-agent-8b2f1a-z3w5k   1/1     "}
          <span className="font-bold text-[#E8503A]">Running</span>
          <span className="text-[#5A6072]">{"   0          31d"}</span>
        </pre>
      </div>
    );
  }

  if (cmd === "docker ps") {
    return (
      <div className="overflow-x-auto text-[#EFE6D8]">
        <pre className="font-mono text-xs leading-relaxed">
          <span className="font-bold text-[#EFE6D8]">
            {"CONTAINER ID   IMAGE                  STATUS              PORTS\n"}
          </span>
          <span className="text-[#5A6072]">{"a1b2c3d4e5f6   "}</span>
          {"demo/api-gateway:1.4   "}
          <span className="font-bold text-[#E8503A]">running (healthy)</span>
          {"   0.0.0.0:8080->8080/tcp\n"}
          <span className="text-[#5A6072]">{"f6e5d4c3b2a1   "}</span>
          {"demo/postgres-ha:16    "}
          <span className="font-bold text-[#E8503A]">running (healthy)</span>
          {"   5432/tcp\n"}
          <span className="text-[#5A6072]">{"9a8b7c6d5e4f   "}</span>
          {"demo/redis-cache:7.2   "}
          <span className="font-bold text-[#E8503A]">running (healthy)</span>
          {"   6379/tcp"}
        </pre>
      </div>
    );
  }

  if (cmd === "docker compose" || cmd === "docker compose up") {
    return (
      <div className="space-y-1 text-[#EFE6D8]">
        <div className="font-bold text-[#EFE6D8]">
          [+] Running 3/3{" "}
          <span className="font-normal text-[#5A6072]">(demo-stack.compose.yml)</span>
        </div>
        <div>
          Creating demo-api... <span className="font-bold text-[#E8503A]">done</span>{" "}
          <span className="text-[#5A6072]">(0.6s)</span>
        </div>
        <div>
          Creating demo-db... <span className="font-bold text-[#E8503A]">done</span>{" "}
          <span className="text-[#5A6072]">(0.4s)</span>
        </div>
        <div>
          Creating demo-cache... <span className="font-bold text-[#E8503A]">done</span>{" "}
          <span className="text-[#5A6072]">(0.3s)</span>
        </div>
      </div>
    );
  }

  if (cmd === "terraform plan") {
    return (
      <div className="space-y-1 text-[#EFE6D8]">
        <div>
          <span className="font-bold text-[#E8503A]">+</span>{" "}
          module.eks.aws_eks_node_group.spot_workers
        </div>
        <div>
          <span className="font-bold text-[#E8503A]">+</span>{" "}
          module.observability.helm_release.otel_collector
        </div>
        <div>
          <span className="font-bold text-[#E8503A]">~</span>{" "}
          module.rds.aws_db_instance.ledger_primary
        </div>
        <div className="pt-1 text-[#EFE6D8]">
          <span className="font-bold text-[#EFE6D8]">Plan:</span> 2 to add, 1 to change, 0 to
          destroy. <span className="font-bold text-[#E8503A]">Zero drift detected.</span>
        </div>
      </div>
    );
  }

  if (cmd === "sudo hire shanto") {
    return (
      <div className="space-y-1.5 text-[#EFE6D8]">
        <div className="text-[#5A6072]">[sudo] password for recruiter: ********</div>
        <div className="font-bold text-[#E8503A]">
          ACCESS GRANTED — Shanto provisioned for Platform / DevOps leadership.
        </div>
        <div>
          →{" "}
          <a
            href="mailto:hello@shanto.dev"
            className="font-bold text-[#E8503A] underline hover:text-[#EFE6D8]"
          >
            hello@shanto.dev
          </a>{" "}
          <span className="text-[#5A6072]">or</span>{" "}
          <a
            href="#scale"
            className="font-bold text-[#E8503A] underline hover:text-[#EFE6D8]"
          >
            jump to contact ↓
          </a>
        </div>
      </div>
    );
  }

  return <div className="text-[#5A6072]">command not found — try help</div>;
}

export function HeroTerminal() {
  const framerReduced = useReducedMotion();
  const [reduce, setReduce] = useState<boolean>(() => getInitialReducedMotion(framerReduced));
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextIdRef = useRef<number>(1);

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
    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history, inputValue]);

  const executeCommand = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const res = renderCommandOutput(trimmed);
    if (res === "CLEAR") {
      setHistory([]);
      return;
    }
    const id = nextIdRef.current++;
    setHistory((prev) => [...prev, { id, command: trimmed, output: res }]);
  };

  const handlePillClick = (command: string) => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    if (reduce) {
      setIsTyping(false);
      setInputValue("");
      executeCommand(command);
      return;
    }

    setIsTyping(true);
    setInputValue("");
    let idx = 0;

    typingTimerRef.current = setInterval(() => {
      idx += 1;
      if (idx <= command.length) {
        setInputValue(command.slice(0, idx));
      } else {
        if (typingTimerRef.current) {
          clearInterval(typingTimerRef.current);
          typingTimerRef.current = null;
        }
        setIsTyping(false);
        setInputValue("");
        executeCommand(command);
      }
    }, TYPING_CHAR_MS);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isTyping) return;
    const current = inputValue;
    setInputValue("");
    executeCommand(current);
  };

  const isCursorBlinking = !reduce && !isTyping;
  const showPlaceholder = inputValue.length === 0 && !isTyping && history.length === 0;

  return (
    <div className="w-full max-w-full min-w-0 font-mono">
      {/* Large rounded terminal window with macOS window chrome */}
      <div
        data-terminal-window="true"
        className="flex h-[320px] w-full flex-col overflow-hidden rounded-3xl border border-[#3A4152] bg-[#10151F] text-[#EFE6D8] shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)] sm:h-[360px] lg:h-[390px] xl:h-[420px]"
      >
        {/* Header bar: macOS traffic-light dots + terminal title */}
        <div
          data-terminal-header="true"
          className="relative flex items-center gap-3 border-b border-[#3A4152] bg-[#10151F] px-5 py-3.5 font-mono text-xs text-[#5A6072]"
        >
          <div
            data-terminal-dots="true"
            className="flex items-center gap-2"
            aria-hidden="true"
          >
            <span
              data-terminal-dot="close"
              className="h-3 w-3 rounded-full bg-[#FF5F56]"
            />
            <span
              data-terminal-dot="minimize"
              className="h-3 w-3 rounded-full bg-[#FFBD2E]"
            />
            <span
              data-terminal-dot="expand"
              className="h-3 w-3 rounded-full bg-[#27C93F]"
            />
          </div>
          <span className="ml-1 tracking-wide text-[#5A6072]">shanto@platform:~</span>
        </div>

        {/* Scrollable terminal body */}
        <div
          ref={bodyRef}
          data-terminal-body="true"
          onClick={() => inputRef.current?.focus()}
          className="flex-1 cursor-text overflow-y-auto p-5 font-mono text-xs leading-relaxed text-[#EFE6D8] sm:p-6 sm:text-[13px]"
        >
          {history.map((entry) => (
            <div key={entry.id} className="mb-3.5 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#E8503A]">$</span>
                <span className="font-semibold text-[#E8503A]">{entry.command}</span>
              </div>
              <div className="pl-4">{entry.output}</div>
            </div>
          ))}

          {/* Active prompt line with block cursor and idle placeholder */}
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <span className="shrink-0 font-bold text-[#E8503A]">$</span>
            <div className="relative flex min-w-0 flex-1 flex-wrap items-center">
              {inputValue && (
                <span
                  data-terminal-typed="true"
                  className="whitespace-pre font-semibold text-[#E8503A]"
                >
                  {inputValue}
                </span>
              )}
              <span
                data-terminal-cursor="true"
                data-cursor-blinking={isCursorBlinking ? "true" : "false"}
                aria-hidden="true"
                className={`inline-block h-[15px] w-[9px] shrink-0 rounded-[2px] bg-[#E8503A] align-middle ${
                  isCursorBlinking ? "terminal-cursor-blink" : ""
                }`}
              />
              {showPlaceholder && (
                <span
                  data-terminal-placeholder="true"
                  className="ml-2 select-none text-[#5A6072]"
                >
                  type a command, try help
                </span>
              )}
              <input
                ref={inputRef}
                type="text"
                aria-label="Terminal command input"
                value={inputValue}
                onChange={(e) => {
                  if (!isTyping) {
                    setInputValue(e.target.value);
                  }
                }}
                className="absolute inset-0 h-full w-full bg-transparent font-mono text-xs text-transparent caret-transparent focus:outline-none sm:text-[13px]"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Row of clickable rounded command pills below the terminal body */}
      <div
        data-terminal-pills="true"
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Preset terminal commands"
      >
        {TERMINAL_PILLS.map((cmd) => (
          <button
            key={cmd}
            type="button"
            data-terminal-pill={cmd}
            onClick={() => handlePillClick(cmd)}
            className="rounded-full border border-[#3A4152] bg-[#10151F] px-3.5 py-1.5 font-mono text-xs text-[#EFE6D8] transition-colors hover:border-[#E8503A] hover:text-[#E8503A] focus-visible:border-[#E8503A] focus-visible:text-[#E8503A] focus-visible:outline-none"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}

