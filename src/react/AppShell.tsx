import { useEffect, useMemo } from "react";
import { BejeweledRuntime } from "../phaser/runtime";
import { createBejeweledGame } from "../phaser/game";
import type { GameSnapshot } from "../types";

export function AppShell() {
  const runtime = useMemo(() => new BejeweledRuntime(), []);

  useEffect(() => {
    const container = document.getElementById("game-root");
    if (!container) {
      throw new Error("Missing #game-root");
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

  return (
    <div className="h-screen w-screen overflow-hidden">
      <div id="game-root" className="h-full w-full" />
    </div>
  );
}

declare global {
  interface Window {
    advanceTime: (ms: number) => void;
    render_game_to_text: () => string;
  }
}

function _keepTypesUsed(_snapshot: GameSnapshot) {
  return _snapshot;
}
void _keepTypesUsed;
