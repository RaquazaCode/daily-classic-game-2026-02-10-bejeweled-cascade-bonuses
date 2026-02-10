import Phaser from "phaser";
import { UI_FONT, UI_THEME } from "./theme";

type ButtonOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  onClick: () => void;
};

export type UiButton = {
  container: Phaser.GameObjects.Container;
  setEnabled: (enabled: boolean) => void;
};

export function drawBackdrop(scene: Phaser.Scene) {
  const width = scene.scale.width;
  const height = scene.scale.height;

  const bg = scene.add.graphics();
  const gradientSteps = 22;
  for (let i = 0; i < gradientSteps; i += 1) {
    const t = i / (gradientSteps - 1);
    const color = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(UI_THEME.bgTop),
      Phaser.Display.Color.ValueToColor(UI_THEME.bgBottom),
      gradientSteps - 1,
      i,
    );
    bg.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
    bg.fillRect(0, (height / gradientSteps) * i, width, height / gradientSteps + 2);
  }

  bg.lineStyle(2, UI_THEME.border, 0.18);
  for (let i = 0; i < 14; i += 1) {
    const x = 80 + i * ((width - 160) / 13);
    bg.beginPath();
    bg.moveTo(x, 10 + i * 2);
    bg.lineTo(x - 50, 120 + i * 4);
    bg.strokePath();
  }

  return bg;
}

export function createGlassPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha = 0.9,
) {
  const panel = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, width, height, UI_THEME.panel, alpha).setOrigin(0.5);
  const glow = scene.add.rectangle(0, 0, width + 2, height + 2, UI_THEME.border, 0.07).setOrigin(0.5);
  const border = scene.add.rectangle(0, 0, width, height).setOrigin(0.5);
  border.setStrokeStyle(2, UI_THEME.border, 0.42);

  panel.add([glow, bg, border]);
  return panel;
}

export function createButton(scene: Phaser.Scene, options: ButtonOptions): UiButton {
  const { x, y, width, height, label, onClick } = options;

  const container = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, width, height, UI_THEME.buttonFill, 0.95).setOrigin(0.5);
  const border = scene.add.rectangle(0, 0, width, height).setOrigin(0.5);
  border.setStrokeStyle(2, UI_THEME.border, 0.55);
  const text = scene.add
    .text(0, 0, label, {
      fontFamily: UI_FONT,
      fontSize: "30px",
      fontStyle: "700",
      color: UI_THEME.buttonText,
      align: "center",
    })
    .setOrigin(0.5);

  container.add([bg, border, text]);
  container.setSize(width, height);
  container.setInteractive(
    new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
    Phaser.Geom.Rectangle.Contains,
  );

  let enabled = true;

  const press = () => {
    bg.setFillStyle(UI_THEME.buttonPressed, 1);
    container.setScale(0.985);
  };

  const release = () => {
    bg.setFillStyle(UI_THEME.buttonFill, 0.95);
    container.setScale(1);
  };

  container.on("pointerover", () => {
    if (!enabled) return;
    bg.setFillStyle(UI_THEME.buttonHover, 1);
    scene.tweens.add({
      targets: container,
      scale: 1.03,
      duration: 100,
      ease: "Sine.Out",
    });
  });

  container.on("pointerout", () => {
    if (!enabled) return;
    release();
  });

  container.on("pointerdown", () => {
    if (!enabled) return;
    press();
  });

  container.on("pointerup", () => {
    if (!enabled) return;
    release();
    onClick();
  });

  return {
    container,
    setEnabled(nextEnabled) {
      enabled = nextEnabled;
      container.disableInteractive();
      if (enabled) {
        container.setInteractive(
          new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
          Phaser.Geom.Rectangle.Contains,
        );
        bg.setFillStyle(UI_THEME.buttonFill, 1);
      } else {
        bg.setFillStyle(UI_THEME.buttonFill, 0.45);
      }
    },
  };
}
