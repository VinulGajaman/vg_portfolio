"use client";

/**
 * Background music (`/media/bg-music.mp3`) + an animated sound toggle.
 *   - One shared <audio> for the whole site (module singleton), looping, volume faded in to 0.35.
 *   - Autoplay: tries on load; browsers usually block sound until the visitor interacts, so it
 *     also starts on the first click / tap / key press anywhere (unless the visitor turned it off).
 *   - The choice is remembered (localStorage "vg-sound": "on" | "off").
 *   - Pauses while the tab is hidden, resumes when visible again.
 *   - The toggle only renders once the file is known to exist (it hides itself if the mp3 is missing).
 * Toggle: four bars that dance while playing and settle to a flat line when muted.
 */
import { useEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

const SRC = "/media/bg-music.mp3";
const VOLUME = 0.35;

type State = { ready: boolean; playing: boolean };
let state: State = { ready: false, playing: false };
const subs = new Set<() => void>();
const emit = (next: Partial<State>) => {
  state = { ...state, ...next };
  subs.forEach((f) => f());
};

let audio: HTMLAudioElement | null = null;
let fadeRaf = 0;
let wantOn = true; // the visitor's choice
let booted = false;

const pref = {
  get: () => {
    try {
      return localStorage.getItem("vg-sound");
    } catch {
      return null;
    }
  },
  set: (v: "on" | "off") => {
    try {
      localStorage.setItem("vg-sound", v);
    } catch {
      /* private mode */
    }
  },
};

function fadeTo(target: number, ms: number, done?: () => void) {
  if (!audio) return;
  cancelAnimationFrame(fadeRaf);
  const a = audio;
  const from = a.volume;
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    a.volume = from + (target - from) * t;
    if (t < 1) fadeRaf = requestAnimationFrame(tick);
    else done?.();
  };
  fadeRaf = requestAnimationFrame(tick);
}

function play() {
  if (!audio || !state.ready) return;
  audio.volume = audio.paused ? 0 : audio.volume;
  audio
    .play()
    .then(() => {
      emit({ playing: true });
      fadeTo(VOLUME, 1500);
    })
    .catch(() => {
      /* blocked until the first interaction; the unlock listeners retry */
    });
}

function pause(remember: boolean) {
  if (!audio) return;
  if (remember) wantOn = false;
  emit({ playing: false });
  fadeTo(0, 500, () => audio?.pause());
}

function boot() {
  if (booted || typeof window === "undefined") return;
  booted = true;
  wantOn = pref.get() !== "off";
  audio = new Audio();
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;
  audio.addEventListener("canplaythrough", () => {
    if (state.ready) return;
    emit({ ready: true });
    if (wantOn) play();
  });
  audio.addEventListener("error", () => emit({ ready: false }));
  audio.src = SRC;

  // First interaction unlocks audio in every browser.
  const unlock = () => {
    if (wantOn && !state.playing) play();
    if (state.playing || !wantOn) {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchend", unlock);
    }
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
  window.addEventListener("touchend", unlock);

  document.addEventListener("visibilitychange", () => {
    if (!audio || !wantOn) return;
    if (document.hidden) audio.pause();
    else if (state.playing) audio.play().catch(() => {});
  });
}

function toggle() {
  if (state.playing) {
    pause(true);
    pref.set("off");
  } else {
    wantOn = true;
    pref.set("on");
    play();
  }
}

export function SoundToggle({ className }: { className?: string }) {
  const s = useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => state,
    () => state,
  );
  useEffect(boot, []);

  if (!s.ready) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      aria-pressed={s.playing}
      aria-label={s.playing ? "Turn background music off" : "Turn background music on"}
      className={cn("pressable group grid size-10 place-items-center text-current", className)}
    >
      <span aria-hidden className="flex h-4 items-end gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "w-[2px] origin-bottom rounded-full bg-current transition-[height] duration-500",
              s.playing ? "h-4 animate-[eq_1s_ease-in-out_infinite_alternate]" : "h-[2px]",
            )}
            style={s.playing ? { animationDelay: `${[-0.2, -0.6, -0.1, -0.45][i]}s` } : undefined}
          />
        ))}
      </span>
    </button>
  );
}
