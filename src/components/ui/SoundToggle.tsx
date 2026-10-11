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

// iOS Safari ignores `audio.volume`, so volume goes through a Web Audio gain node when available.
let actx: AudioContext | null = null;
let gain: GainNode | null = null;
function ensureGraph() {
  if (!audio || gain) return;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  try {
    actx = new Ctx();
    const srcNode = actx.createMediaElementSource(audio);
    gain = actx.createGain();
    gain.gain.value = 0;
    srcNode.connect(gain).connect(actx.destination);
    audio.volume = 1;
  } catch {
    actx = null;
    gain = null;
  }
}
const getVol = () => (gain ? gain.gain.value : (audio?.volume ?? 0));
const setVol = (v: number) => {
  const x = Math.min(1, Math.max(0, v));
  if (gain) gain.gain.value = x;
  else if (audio) audio.volume = x;
};

function fadeTo(target: number, ms: number, done?: () => void) {
  if (!audio) return;
  cancelAnimationFrame(fadeRaf);
  const from = getVol();
  const start = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / ms);
    setVol(from + (target - from) * t);
    if (t < 1) fadeRaf = requestAnimationFrame(tick);
    else done?.();
  };
  fadeRaf = requestAnimationFrame(tick);
}

function play() {
  if (!audio) return;
  // Must run inside the user's gesture: iOS only starts audio (and the AudioContext) from one.
  // Do not wait for "canplaythrough": iOS never preloads audio, so it would never fire.
  ensureGraph();
  void actx?.resume();
  if (audio.paused) setVol(0);
  audio
    .play()
    .then(() => {
      emit({ ready: true, playing: true });
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
  // Desktop browsers preload; once playable, show the toggle. Playback itself waits for a user
  // gesture (browsers block audible autoplay), so the AudioContext is only created inside one.
  audio.addEventListener("canplaythrough", () => {
    if (state.ready) return;
    emit({ ready: true }); // the first click / tap (or the splash Enter) starts it
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
    else if (state.playing) {
      void actx?.resume();
      audio.play().catch(() => {});
    }
  });
}

/** Called from the splash "Enter" click: that click is the user gesture browsers require. */
export function startMusic() {
  boot();
  if (wantOn) play();
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
