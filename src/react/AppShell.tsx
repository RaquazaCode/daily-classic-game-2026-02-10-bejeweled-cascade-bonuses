import { useEffect, useMemo, useRef, useState } from "react";
import { createBejeweledGame } from "../phaser/game";
import { BejeweledRuntime } from "../phaser/runtime";
import { HOW_TO_PANELS } from "./howto_panels";
import { useRuntimeSnapshot } from "./useRuntimeSnapshot";
import { AudioDirector, type AudioStatus } from "./audio";

const EMPTY_AUDIO_STATUS: AudioStatus = {
  enabled: true,
  blocked: false,
  started: false,
};

export function AppShell() {
  const runtime = useMemo(() => new BejeweledRuntime(), []);
  const snapshot = useRuntimeSnapshot(runtime);

  const [panelIndex, setPanelIndex] = useState(0);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>(EMPTY_AUDIO_STATUS);

  const gameHostRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<AudioDirector | null>(null);

  useEffect(() => {
    const host = gameHostRef.current;
    if (!host) {
      throw new Error("Missing game host element");
    }

    const game = createBejeweledGame("game-root", runtime);

    const params = new URLSearchParams(window.location.search);
    const autostart = params.has("autostart");
    const scriptedSwap = params.has("scripted_swap");

    const bootFromParams = () => {
      if (!autostart && !scriptedSwap) {
        return;
      }

      runtime.startGame();
      if (scriptedSwap) {
        runtime.applyScriptedSwap({ row: 0, col: 2 }, { row: 0, col: 3 });
      }
    };

    game.events.once("ready", bootFromParams);

    window.advanceTime = (ms: number) => {
      runtime.advanceTime(ms);
    };

    window.render_game_to_text = () => {
      return JSON.stringify(runtime.getSnapshot());
    };

    return () => {
      game.destroy(true);
    };
  }, [runtime]);

  useEffect(() => {
    const director = new AudioDirector((status) => {
      setAudioStatus(status);
    });
    audioRef.current = director;

    void director.start();

    const unlockAudio = () => {
      void director.start();
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      director.destroy();
    };
  }, []);

  useEffect(() => {
    audioRef.current?.sync(snapshot.mode, snapshot.chainDepth);
  }, [snapshot.mode, snapshot.chainDepth]);

  useEffect(() => {
    if (snapshot.mode !== "howto") {
      setPanelIndex(0);
    }
  }, [snapshot.mode]);

  const chainProgress = Math.max(0, Math.min(1, snapshot.chainDepth / 3));

  const currentPanel = HOW_TO_PANELS[panelIndex];

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-luxe-950 font-body text-luxe-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,#1f4d8f_0%,#0a1736_42%,#030815_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(94,171,255,0.15),rgba(23,53,104,0.10),rgba(6,17,38,0.02))] bg-[length:220%_220%] animate-gradient-pan" />
      <div className="pointer-events-none absolute -top-20 left-1/2 h-[55vh] w-[78vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(130,210,255,0.20),transparent_65%)] blur-3xl" />

      <div className="relative z-10 flex h-full w-full items-center justify-center p-0 sm:p-3">
        <div className="relative h-full w-full overflow-hidden border border-luxe-300/25 bg-luxe-900/25 shadow-luxe sm:rounded-[26px]">
          <div id="game-root" ref={gameHostRef} className="absolute inset-0" />

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[56%] h-[min(66vw,64vh)] w-[min(66vw,64vh)] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-luxe-300/25 shadow-[0_0_80px_rgba(86,186,255,0.15)]" />
            <div className="absolute left-1/2 top-[56%] h-[min(66vw,64vh)] w-[min(66vw,64vh)] -translate-x-1/2 -translate-y-1/2 rounded-[22px] bg-[radial-gradient(circle_at_25%_18%,rgba(154,216,255,0.12),transparent_60%)]" />
          </div>

          <header className="pointer-events-none absolute inset-x-0 top-0 px-3 pt-3 sm:px-8 sm:pt-6">
            <div className="rounded-2xl border border-luxe-300/25 bg-luxe-900/50 px-4 py-3 shadow-panel backdrop-blur-md sm:px-6 sm:py-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-luxe-100">
                <h1 className="font-display text-3xl leading-none sm:text-6xl">Bejeweled: Cascading Bonuses</h1>
                <span className="rounded-full border border-luxe-300/30 bg-luxe-800/70 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-luxe-200 sm:text-base">
                  {snapshot.mode}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-luxe-200 sm:text-[1.65rem] sm:leading-[1.95rem]">
                <span>Score: {snapshot.score}</span>
                <span>Moves: {snapshot.moves}</span>
                <span>Chain: {snapshot.chainDepth}</span>
                <span>Best: {snapshot.bestChain}</span>
                <span>Last multiplier: x{Math.max(1, snapshot.chainDepth)}</span>
              </div>

              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-luxe-950/70">
                <div
                  className="h-full bg-gradient-to-r from-gem-cyan via-gem-mint to-gem-gold transition-all duration-500"
                  style={{ width: `${Math.max(8, chainProgress * 100)}%` }}
                />
              </div>

              <div className="mt-2 text-sm text-luxe-300 sm:text-lg">{snapshot.message}</div>
            </div>
          </header>

          <div className="pointer-events-none absolute bottom-4 right-3 sm:right-8">
            <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-luxe-300/35 bg-luxe-900/65 px-3 py-2 text-xs sm:text-base">
              <button
                type="button"
                onClick={() => {
                  audioRef.current?.setEnabled(!audioStatus.enabled);
                }}
                className="rounded-lg border border-luxe-300/45 bg-luxe-700/60 px-3 py-1 font-semibold text-luxe-100 transition hover:bg-luxe-500/65"
              >
                {audioStatus.enabled ? "Music On" : "Music Off"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (snapshot.mode === "paused") {
                    runtime.resume();
                  } else {
                    runtime.pause();
                  }
                }}
                className="rounded-lg border border-luxe-300/45 bg-luxe-700/60 px-3 py-1 font-semibold text-luxe-100 transition hover:bg-luxe-500/65"
              >
                {snapshot.mode === "paused" ? "Resume" : "Pause"}
              </button>
              <button
                type="button"
                onClick={() => runtime.restart()}
                className="rounded-lg border border-luxe-300/45 bg-luxe-700/60 px-3 py-1 font-semibold text-luxe-100 transition hover:bg-luxe-500/65"
              >
                Restart
              </button>
            </div>
            {audioStatus.blocked ? (
              <div className="mt-2 rounded-lg border border-amber-300/45 bg-amber-200/20 px-3 py-1 text-xs text-amber-100 sm:text-sm">
                Audio blocked by browser. Click anywhere to unlock music.
              </div>
            ) : null}
          </div>

          {snapshot.mode === "title" ? (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="w-full max-w-[46rem] rounded-3xl border border-luxe-300/35 bg-luxe-900/72 p-6 shadow-luxe backdrop-blur-lg sm:p-10">
                <h2 className="font-display text-4xl text-luxe-100 sm:text-6xl">Luxury Match Flow</h2>
                <p className="mt-3 text-base text-luxe-200 sm:text-2xl">
                  Swap adjacent gems, trigger polished cascades, and stack multipliers while the ambient soundtrack evolves with your chain depth.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => runtime.startGame()}
                    className="rounded-2xl border border-luxe-200/55 bg-gradient-to-r from-luxe-500/85 to-luxe-700/90 px-5 py-4 text-xl font-bold text-luxe-100 shadow-panel transition hover:brightness-110"
                  >
                    Start Game
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPanelIndex(0);
                      runtime.enterHowTo();
                    }}
                    className="rounded-2xl border border-luxe-300/45 bg-luxe-800/80 px-5 py-4 text-xl font-bold text-luxe-100 shadow-panel transition hover:bg-luxe-700/80"
                  >
                    How To Play
                  </button>
                </div>
                <p className="mt-6 text-sm text-luxe-300 sm:text-lg">Keyboard: P pause, R restart, F fullscreen</p>
              </div>
            </div>
          ) : null}

          {snapshot.mode === "howto" ? (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="w-full max-w-[56rem] rounded-3xl border border-luxe-300/35 bg-luxe-900/78 p-6 shadow-luxe backdrop-blur-lg sm:p-10">
                <h3 className="font-display text-4xl text-luxe-100 sm:text-5xl">{currentPanel.title}</h3>
                <p className="mt-5 text-base leading-relaxed text-luxe-200 sm:text-3xl sm:leading-[1.25]">{currentPanel.body}</p>
                <div className="mt-6 text-lg font-semibold text-luxe-300 sm:text-2xl">
                  Panel {panelIndex + 1} of {HOW_TO_PANELS.length}
                </div>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => runtime.enterMenu()}
                    className="rounded-2xl border border-luxe-300/45 bg-luxe-800/80 px-5 py-4 text-xl font-bold text-luxe-100 transition hover:bg-luxe-700/80"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setPanelIndex((prev) => Math.min(HOW_TO_PANELS.length - 1, prev + 1))}
                    disabled={panelIndex >= HOW_TO_PANELS.length - 1}
                    className="rounded-2xl border border-luxe-300/45 bg-luxe-700/75 px-5 py-4 text-xl font-bold text-luxe-100 transition enabled:hover:bg-luxe-500/85 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={() => runtime.startGame()}
                    className="rounded-2xl border border-luxe-200/55 bg-gradient-to-r from-luxe-500/85 to-luxe-700/90 px-5 py-4 text-xl font-bold text-luxe-100 transition hover:brightness-110"
                  >
                    Start Game
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {snapshot.mode === "paused" ? (
            <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-luxe-300/40 bg-luxe-900/80 px-5 py-2 text-sm font-semibold text-luxe-100 sm:text-lg">
              Paused. Press P or Resume.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    advanceTime: (ms: number) => void;
    render_game_to_text: () => string;
  }
}
