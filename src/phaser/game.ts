import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants";
import { BejeweledRuntime } from "./runtime";
import { setRuntime } from "./runtime_store";
import { GameScene } from "./scenes/GameScene";
import { HowToScene } from "./scenes/HowToScene";
import { MenuScene } from "./scenes/MenuScene";

export function createBejeweledGame(parent: string, runtime: BejeweledRuntime) {
  setRuntime(runtime);

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.CANVAS,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#050d20",
    scene: [MenuScene, HowToScene, GameScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    input: {
      activePointers: 1,
      keyboard: true,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
  };

  return new Phaser.Game(config);
}
