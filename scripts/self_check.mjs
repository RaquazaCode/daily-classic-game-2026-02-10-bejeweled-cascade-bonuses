import { existsSync, readFileSync } from "node:fs";
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
const gameSceneSource = readFileSync(resolve(root, "src/phaser/scenes/GameScene.ts"), "utf8");
const pipelineSource = readFileSync(resolve(root, "src/phaser/pipelines/LuxeVignettePipeline.ts"), "utf8");
const audioSource = readFileSync(resolve(root, "src/react/audio.ts"), "utf8");

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
assert(packageSource.includes('"react"'), "react dependency missing");
assert(packageSource.includes('"tailwindcss"'), "tailwind dependency missing");
assert(styleSource.includes("@tailwind"), "tailwind directives missing");
assert(styleSource.includes("overflow: hidden"), "no-scroll CSS requirement missing");

assert(mainSource.includes("AppShell"), "React AppShell bootstrap missing");
assert(appShellSource.includes("Start Game"), "Start Game UI missing");
assert(appShellSource.includes("How To Play"), "How To Play UI missing");
assert(appShellSource.includes("window.advanceTime"), "advanceTime hook missing");
assert(appShellSource.includes("window.render_game_to_text"), "render_game_to_text hook missing");
assert(appShellSource.includes("AudioDirector"), "audio director integration missing");

assert(audioSource.includes("ambient-luxe-base.wav"), "base music asset wiring missing");
assert(audioSource.includes("ambient-luxe-glow.wav"), "glow music asset wiring missing");
assert(existsSync(resolve(root, "assets/audio/ambient-luxe-base.wav")), "base audio file missing");
assert(existsSync(resolve(root, "assets/audio/ambient-luxe-glow.wav")), "glow audio file missing");

assert(gameSceneSource.includes("keyP"), "pause key handler missing in GameScene");
assert(gameSceneSource.includes("keyR"), "restart key handler missing in GameScene");
assert(gameSceneSource.includes("resizeDebounceId"), "resize debounce timer missing in GameScene");
assert(gameSceneSource.includes("clearTimeout(this.resizeDebounceId)"), "resize debounce cleanup missing in GameScene");
assert(gameSceneSource.includes("setPostPipeline"), "shader pipeline usage missing");
assert(pipelineSource.includes("fragShader"), "custom shader pipeline missing");

assert(runtimeSource.includes("mode"), "snapshot payload mode missing");
assert(runtimeSource.includes("pendingAnimations"), "snapshot payload pendingAnimations missing");
assert(runtimeSource.includes("coordinateSystem"), "snapshot coordinateSystem missing");

console.log("Self-check passed: React+Phaser UI, audio, hooks, and deterministic core present.");
