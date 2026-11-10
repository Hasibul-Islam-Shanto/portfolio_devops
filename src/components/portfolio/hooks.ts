import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Types `text` out once `start` is true. Reduced motion shows it instantly. */
export function useTyped(text: string, start: boolean, speed = 28) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (reduce) {
      setN(text.length);
      return;
    }
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, start, speed, reduce]);
  return { out: text.slice(0, n), done: n >= text.length };
}

export type Mode = "light" | "dark" | "signal";
