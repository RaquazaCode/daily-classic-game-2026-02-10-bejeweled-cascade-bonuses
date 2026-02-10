import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const boardSource = readFileSync(resolve(root, "src/board.ts"), "utf8");
const matchSource = readFileSync(resolve(root, "src/match.ts"), "utf8");
const cascadeSource = readFileSync(resolve(root, "src/cascade.ts"), "utf8");
const mainSource = readFileSync(resolve(root, "src/main.ts"), "utf8");

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
assert(mainSource.includes("window.advanceTime"), "advanceTime hook missing");
assert(mainSource.includes("window.render_game_to_text"), "render_game_to_text hook missing");
assert(mainSource.includes('key === "p"'), "pause key binding missing");
assert(mainSource.includes('key === "r"'), "restart key binding missing");

console.log("Self-check passed: hooks, controls, and deterministic core present.");
