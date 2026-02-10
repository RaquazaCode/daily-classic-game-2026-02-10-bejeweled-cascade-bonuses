import "./style.css";
import { BejeweledRuntime } from "./phaser/runtime";
import { createBejeweledGame } from "./phaser/game";
import type { Cell } from "./types";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("App root missing");
}

app.innerHTML = `
  <div class="shell">
    <div id="game-root"></div>
  </div>
`;

const runtime = new BejeweledRuntime();
const game = createBejeweledGame("game-root", runtime);

const params = new URLSearchParams(window.location.search);
const autostart = params.has("autostart");
const scriptedSwap = params.has("scripted_swap");

function bootRuntimeFromParams() {
  if (!autostart && !scriptedSwap) {
    return;
  }

  game.scene.stop("menu");
  runtime.startGame();
  game.scene.start("game");

  if (scriptedSwap) {
    const from: Cell = { row: 0, col: 2 };
    const to: Cell = { row: 0, col: 3 };
    runtime.applyScriptedSwap(from, to);
  }
}

game.events.once("ready", bootRuntimeFromParams);

window.advanceTime = (ms: number) => {
  runtime.advanceTime(ms);
};

window.render_game_to_text = () => {
  return JSON.stringify(runtime.getSnapshot());
};

declare global {
  interface Window {
    advanceTime: (ms: number) => void;
    render_game_to_text: () => string;
  }
}
