import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const boardSource = readFileSync(resolve(root, "src/board.ts"), "utf8");
const matchSource = readFileSync(resolve(root, "src/match.ts"), "utf8");
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
assert(mainSource.includes("state"), "state bootstrap missing");

console.log("Self-check passed: board + match primitives present.");
