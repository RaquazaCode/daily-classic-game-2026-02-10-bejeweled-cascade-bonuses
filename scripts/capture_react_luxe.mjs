import fs from "node:fs";
import path from "node:path";
import { chromium } from "/Users/testaccountforsystem-wideissues/.codex/skills/develop-web-game/node_modules/playwright/index.mjs";

const root = new URL("..", import.meta.url).pathname;
const outDir = path.join(root, "playwright", "react-luxe");

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function writeState(page, index, label) {
  const stateText = await page.evaluate(() => {
    if (typeof window.render_game_to_text === "function") {
      return window.render_game_to_text();
    }
    return null;
  });
  if (stateText) {
    await fs.promises.writeFile(path.join(outDir, `state-${index}.json`), stateText);
  }
  await page.screenshot({
    path: path.join(outDir, `shot-${index}-${label}.png`),
    fullPage: true,
  });
}

async function run() {
  const url = process.env.WEB_GAME_URL ?? "http://127.0.0.1:4173/";

  await ensureDir(outDir);

  const browser = await chromium.launch({
    headless: true,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });

  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push({ type: "console.error", text: msg.text() });
    }
  });
  page.on("pageerror", (err) => {
    errors.push({ type: "pageerror", text: String(err) });
  });

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);

  await writeState(page, 0, "menu");

  await page.getByRole("button", { name: "How To Play" }).click();
  await page.waitForTimeout(250);
  await writeState(page, 1, "howto-1");

  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForTimeout(220);
  await writeState(page, 2, "howto-2");

  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForTimeout(220);
  await writeState(page, 3, "howto-3");

  await page.getByRole("button", { name: "Start Game" }).click();
  await page.waitForTimeout(350);
  await writeState(page, 4, "playing");

  await page.mouse.click(456, 254);
  await page.waitForTimeout(120);
  await page.mouse.click(456, 334);
  await page.waitForTimeout(450);
  await writeState(page, 5, "invalid-swap");

  await page.keyboard.press("P");
  await page.waitForTimeout(220);
  await writeState(page, 6, "paused");

  await page.keyboard.press("P");
  await page.waitForTimeout(220);
  await writeState(page, 7, "resumed");

  await page.keyboard.press("R");
  await page.waitForTimeout(300);
  await writeState(page, 8, "restart-menu");

  if (errors.length) {
    await fs.promises.writeFile(path.join(outDir, "errors-headed.json"), JSON.stringify(errors, null, 2));
  }

  await browser.close();

  console.log(`React luxe captures written to ${outDir}`);
  if (errors.length) {
    console.log(`Captured ${errors.length} console/page errors in errors-headed.json`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
