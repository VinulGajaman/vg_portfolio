"use client";

/**
 * <Cursor>: portvio's difference dot + context states (DESIGN.md §2.5, U13).
 * Base (portvio exact): 14px #FFF circle, radius 100, mix-blend-mode difference, fixed, z 60,
 * pointer-events none; follows with springCursor (k400 c60 m1); offset +16/+16 with
 * bottom-centre alignment; native cursor stays visible; starts at opacity 0 and fades in on the
 * first move / out on leaving the document (springFade). First move jumps, no fly-in.
 * States from [data-cursor] on the nearest ancestor (label override: [data-cursor-label]):
 *   view 88px "View" (centred, normal blend, native cursor hidden) · open 64px "Open"
 *   copy 64px "Copy" → "Copied" for 1.2s after a click · play 88px "Play"
 *   link (any a/button without a state) 7px · hide (inputs) opacity 0
 * The element is always 88px and only `scale` animates (14/88 = .159 at rest), on springUI.
 * The label fades in over 0.15s `out` once the scale passes ~70%. Position lives in motion
 * values, so pointer moves never re-render React. Hidden during the preloader and page
 * transitions. Fine pointers only; off under reduced motion. `portvio` profile: dot only.
 */
import { useEffect, useRef, useState } from "react";
import { m, useMotionValue, useSpring } from "motion/react";
import { usePointerFine, useReducedMotion } from "@/lib/hooks";
import { BEZIER, isPlus, SPRING } from "@/lib/motion-tokens";
import { useUI } from "@/lib/store";

type CursorState = "default" | "view" | "open" | "copy" | "play" | "link" | "hide";

const SIZE = 88;
const SCALE: Record<CursorState, number> = {
  default: 14 / SIZE,
  link: 7 / SIZE,
  view: 1,
  play: 1,
  open: 64 / SIZE,
  copy: 64 / SIZE,
  hide: 14 / SIZE,
};
const LABEL: Partial<Record<CursorState, string>> = {
  view: "View",
  open: "Open",
  copy: "Copy",
  play: "Play",
};
const CENTRED: CursorState[] = ["view", "play", "open", "copy"];
/** Rest offset: +16 / +16 with translate(-50%, 0) puts the dot centre at (+16, +23). */
const REST_OFFSET = { x: 16, y: 16 + 7 };

export function Cursor() {
  const fine = usePointerFine();
  const reduce = useReducedMotion();
  if (!fine || reduce) return null;
  return <CursorInner />;
}

function CursorInner() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, SPRING.springCursor);
  const sy = useSpring(y, SPRING.springCursor);
  const [state, setState] = useState<CursorState>("default");
  const [label, setLabel] = useState("");
  const [visible, setVisible] = useState(false);
  const busy = useUI((s) => s.preloader || s.transitioning);
  const pointer = useRef({ x: -200, y: -200, seen: false });
  const stateRef = useRef<CursorState>("default");
  const copiedUntil = useRef(0);

  useEffect(() => {
    document.documentElement.classList.add("has-cursor");
    return () => document.documentElement.classList.remove("has-cursor");
  }, []);

  useEffect(() => {
    const offsetFor = (s: CursorState) => (isPlus && CENTRED.includes(s) ? { x: 0, y: 0 } : REST_OFFSET);

    const place = (jump = false) => {
      const o = offsetFor(stateRef.current);
      const tx = pointer.current.x + o.x;
      const ty = pointer.current.y + o.y;
      if (jump) {
        x.jump(tx);
        y.jump(ty);
        sx.jump(tx);
        sy.jump(ty);
      } else {
        x.set(tx);
        y.set(ty);
      }
    };

    const resolve = (target: EventTarget | null) => {
      const el = target instanceof Element ? target : null;
      let next: CursorState = "default";
      let text = "";
      if (el) {
        const host = el.closest<HTMLElement>("[data-cursor]");
        if (host && isPlus) {
          next = (host.dataset.cursor as CursorState) ?? "default";
          text = host.dataset.cursorLabel ?? LABEL[next] ?? "";
          if (next === "copy" && performance.now() < copiedUntil.current) text = "Copied";
        } else if (el.closest("input, textarea, select")) {
          next = "hide";
        } else if (el.closest("a, button, [role='button'], label, summary")) {
          next = isPlus ? "link" : "default";
        }
      }
      if (next !== stateRef.current) {
        stateRef.current = next;
        setState(next);
        place();
      }
      setLabel(text);
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      if (!pointer.current.seen) {
        pointer.current.seen = true;
        resolve(e.target);
        place(true);
        setVisible(true);
        return;
      }
      place();
    };
    const over = (e: PointerEvent) => {
      if (e.pointerType === "mouse") resolve(e.target);
    };
    const leave = () => setVisible(false);
    const enter = () => {
      if (pointer.current.seen) setVisible(true);
    };
    const click = (e: MouseEvent) => {
      const host = (e.target as Element | null)?.closest?.<HTMLElement>("[data-cursor='copy']");
      if (host) {
        copiedUntil.current = performance.now() + 1200;
        setLabel("Copied");
        window.setTimeout(() => resolve(document.elementFromPoint(pointer.current.x, pointer.current.y)), 1210);
      } else {
        // Labels can change on click (e.g. an accordion row opens).
        requestAnimationFrame(() => resolve(e.target));
      }
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.addEventListener("pointerenter", enter);
    document.addEventListener("click", click);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.removeEventListener("pointerenter", enter);
      document.removeEventListener("click", click);
    };
  }, [x, y, sx, sy]);

  const show = visible && !busy && state !== "hide";
  const hasLabel = Boolean(label) && CENTRED.includes(state);
  const blend = CENTRED.includes(state) ? "normal" : "difference";

  return (
    <m.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60]"
      style={{ x: sx, y: sy, mixBlendMode: blend }}
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      transition={SPRING.springFade}
    >
      <m.div
        className="absolute flex items-center justify-center rounded-full bg-white will-change-transform"
        style={{ width: SIZE, height: SIZE, left: -SIZE / 2, top: -SIZE / 2 }}
        initial={{ scale: SCALE.default }}
        animate={{ scale: SCALE[state] }}
        transition={SPRING.springUI}
      >
        <m.span
          className="type-micro select-none whitespace-nowrap text-canvas"
          initial={{ opacity: 0 }}
          animate={{ opacity: hasLabel ? 1 : 0 }}
          transition={{ duration: 0.15, ease: BEZIER.out, delay: hasLabel ? 0.17 : 0 }}
          style={{ scale: state === "open" || state === "copy" ? SIZE / 64 : 1 }}
        >
          {label}
        </m.span>
      </m.div>
    </m.div>
  );
}
