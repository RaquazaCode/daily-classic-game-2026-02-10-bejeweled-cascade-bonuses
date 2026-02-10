import { BejeweledRuntime } from "./runtime";

let runtime: BejeweledRuntime | null = null;

export function setRuntime(nextRuntime: BejeweledRuntime) {
  runtime = nextRuntime;
}

export function getRuntime() {
  if (!runtime) {
    throw new Error("Runtime has not been initialized");
  }
  return runtime;
}
