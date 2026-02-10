import Phaser from "phaser";
import { createButton, createGlassPanel, drawBackdrop } from "../ui/components";
import { UI_FONT, UI_THEME } from "../ui/theme";
import { getRuntime } from "../runtime_store";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    const runtime = getRuntime();
    runtime.enterMenu();

    drawBackdrop(this);
    const width = this.scale.width;
    const height = this.scale.height;

    createGlassPanel(this, width / 2, height / 2, Math.min(760, width - 100), Math.min(520, height - 100));

    this.add
      .text(width / 2, height * 0.24, "Bejeweled: Cascading Bonuses", {
        fontFamily: UI_FONT,
        fontSize: "58px",
        fontStyle: "700",
        color: UI_THEME.textPrimary,
        align: "center",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.33, "Swap adjacent gems. Trigger chains. Stack cascade multipliers.", {
        fontFamily: UI_FONT,
        fontSize: "27px",
        color: UI_THEME.textMuted,
        align: "center",
      })
      .setOrigin(0.5);

    const startButton = createButton(this, {
      x: width / 2,
      y: height * 0.5,
      width: Math.min(420, width - 180),
      height: 82,
      label: "Start Game",
      onClick: () => {
        runtime.startGame();
        this.scene.start("game");
      },
    });

    const howToButton = createButton(this, {
      x: width / 2,
      y: height * 0.65,
      width: Math.min(420, width - 180),
      height: 82,
      label: "How To Play",
      onClick: () => {
        runtime.enterHowTo();
        this.scene.start("howto");
      },
    });

    this.tweens.add({
      targets: [startButton.container, howToButton.container],
      y: "+=6",
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    this.add
      .text(width / 2, height * 0.82, "Keyboard: P pause, R restart, F fullscreen", {
        fontFamily: UI_FONT,
        fontSize: "22px",
        color: UI_THEME.textMuted,
        align: "center",
      })
      .setOrigin(0.5);
  }
}
