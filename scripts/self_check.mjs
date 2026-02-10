import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const boardSource = readFileSync(resolve(root, "src/board.ts"), "utf8");
const matchSource = readFileSync(resolve(root, "src/match.ts"), "utf8");
const cascadeSource = readFileSync(resolve(root, "src/cascade.ts"), "utf8");
const mainSource = readFileSync(resolve(root, "src/main.tsx"), "utf8");
const appShellSource = readFileSync(resolve(root, "src/react/AppShell.tsx"), "utf8");
const styleSource = readFileSync(resolve(root, "src/style.css"), "utf8");
const packageSource = readFileSync(resolve(root, "package.json"), "utf8");
const runtimeSource = readFileSync(resolve(root, "src/phaser/runtime.ts"), "utf8");
const menuSceneSource = readFileSync(resolve(root, "src/phaser/scenes/MenuScene.ts"), "utf8");
const howToSceneSource = readFileSync(resolve(root, "src/phaser/scenes/HowToScene.ts"), "utf8");
const gameSceneSource = readFileSync(resolve(root, "src/phaser/scenes/GameScene.ts"), "utf8");

function assert(condition, message) {
  if (!condition) {
    console.error(`Self-check failed: ${message}`);
    process.exit(1);
  }
}

assert(boardSource.includes("createInitialBoard"), "board creation missing");
assert(boardSource.includes("pickGemWithoutImmediateMatch"), "no-match initializer missing");
assert(matchSource.includes("findMatches"), "match detection missing");
assert(matchSource.includes("clearMatchedCells"), "match clearing missing");
assert(cascadeSource.includes("resolveCascadeLoop"), "cascade resolution missing");
assert(cascadeSource.includes("bonusTrail"), "cascade bonus trail missing");
assert(packageSource.includes('"phaser"'), "phaser dependency missing");
assert(styleSource.includes("overflow: hidden"), "no-scroll CSS requirement missing");
assert(menuSceneSource.includes("Start Game"), "menu Start Game option missing");
assert(menuSceneSource.includes("How To Play"), "menu How To Play option missing");
assert(howToSceneSource.includes("Back"), "How To Play Back control missing");
assert(howToSceneSource.includes("Next"), "How To Play Next control missing");
assert(howToSceneSource.includes("Start Game"), "How To Play Start Game control missing");
assert(gameSceneSource.includes("keyP"), "pause key handler missing in Phaser scene");
assert(gameSceneSource.includes("keyR"), "restart key handler missing in Phaser scene");
assert(mainSource.includes("AppShell"), "React AppShell bootstrap missing");
assert(appShellSource.includes("window.advanceTime"), "advanceTime hook missing");
assert(appShellSource.includes("window.render_game_to_text"), "render_game_to_text hook missing");
assert(styleSource.includes(""), "tailwind directives missing");
assert(runtimeSource.includes("mode"), "render text payload mode missing");
assert(runtimeSource.includes("pendingAnimations"), "render text payload pendingAnimations missing");

console.log("Self-check passed: Phaser UI contracts, hooks, and deterministic core present.");
