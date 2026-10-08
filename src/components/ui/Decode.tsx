"use client";

/**
 * <Decode>: text that scrambles through random glyphs and resolves left to right whenever `text`
 * changes (the glitch-signal effect). `enabled={false}` renders the text plainly.
 */
import { useEffect, useRef } from "react";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#%&01";

/** Text that decodes from random glyphs into `text`, left to right, whenever `text` changes. */
export function Decode({ text, delay = 0, enabled }: { text: string; delay?: number; enabled: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!enabled) {
      el.textContent = text;
      return;
    }
    const start = performance.now() + delay;
    const dur = 420 + text.length * 22;
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - start) / dur;
      if (t >= 1) {
        el.textContent = text;
        return;
      }
      const done = Math.max(0, Math.floor(t * text.length));
      let out = text.slice(0, done);
      for (let i = done; i < text.length; i++)
        out += text[i] === " " ? " " : t < 0 && i > 0 ? "" : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      el.textContent = out || " ";
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, delay, enabled]);
  return <span ref={ref}>{text}</span>;
}

