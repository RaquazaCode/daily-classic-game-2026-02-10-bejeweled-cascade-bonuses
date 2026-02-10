import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const mainSource = readFileSync(resolve(root, "src/main.ts"), "utf8");

if (!mainSource.includes("canvas")) {
  console.error("Self-check failed: canvas mount missing");
  process.exit(1);
}

console.log("Self-check passed: base scaffold present.");
