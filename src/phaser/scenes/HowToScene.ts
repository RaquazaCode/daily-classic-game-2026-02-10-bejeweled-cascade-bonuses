import Phaser from "phaser";
import { CASCADE_MULTIPLIERS, SCORE_PER_GEM } from "../../constants";
import { createButton, createGlassPanel, drawBackdrop, type UiButton } from "../ui/components";
import { UI_FONT, UI_THEME } from "../ui/theme";
import { getRuntime } from "../runtime_store";

type HowToPanel = {
  title: string;
  body: string;
};

const PANELS: HowToPanel[] = [
  {
    title: "1. Objective + Controls",
    body:
      "Match 3 or more gems horizontally or vertically. Click one gem, then click an adjacent gem to swap. Keyboard: P pauses, R restarts the run with the same seed, F toggles fullscreen.",
  },
  {
    title: "2. Valid vs Invalid Swaps",
    body:
      "A swap only counts when it creates at least one match. Invalid swaps are rolled back with no move score. Valid swaps consume one move, clear matches, drop gems, then refill.",
  },
  {
    title: "3. Cascades + Scoring",
    body: `Base score is ${SCORE_PER_GEM} per cleared gem. Chain depth boosts score with multipliers ${CASCADE_MULTIPLIERS.join(
      " -> x",
    )}+. Deeper cascades increase best chain and total score faster.`,
  },
];

export class HowToScene extends Phaser.Scene {
  private panelIndex = 0;
  private titleText?: Phaser.GameObjects.Text;
  private bodyText?: Phaser.GameObjects.Text;
  private stepText?: Phaser.GameObjects.Text;
  private nextButton?: UiButton;

  constructor() {
    super("howto");
  }

  create() {
    const runtime = getRuntime();
    runtime.enterHowTo();

    drawBackdrop(this);
    const width = this.scale.width;
    const height = this.scale.height;

    createGlassPanel(this, width / 2, height / 2, Math.min(860, width - 90), Math.min(560, height - 90));

    this.titleText = this.add
      .text(width / 2, height * 0.24, "", {
        fontFamily: UI_FONT,
        fontSize: "44px",
        fontStyle: "700",
        color: UI_THEME.textPrimary,
        align: "center",
      })
      .setOrigin(0.5);

    this.bodyText = this.add
      .text(width / 2, height * 0.43, "", {
        fontFamily: UI_FONT,
        fontSize: "29px",
        color: UI_THEME.textMuted,
        align: "center",
        wordWrap: { width: Math.min(760, width - 140), useAdvancedWrap: true },
        lineSpacing: 10,
      })
      .setOrigin(0.5);

    this.stepText = this.add
      .text(width / 2, height * 0.62, "", {
        fontFamily: UI_FONT,
        fontSize: "24px",
        color: UI_THEME.accent,
        align: "center",
      })
      .setOrigin(0.5);

    createButton(this, {
      x: width * 0.24,
      y: height * 0.77,
      width: 220,
      height: 70,
      label: "Back",
      onClick: () => {
        runtime.enterMenu();
        this.scene.start("menu");
      },
    });

    this.nextButton = createButton(this, {
      x: width * 0.5,
      y: height * 0.77,
      width: 220,
      height: 70,
      label: "Next",
      onClick: () => {
        this.panelIndex = Math.min(PANELS.length - 1, this.panelIndex + 1);
        this.refreshPanel();
      },
    });

    createButton(this, {
      x: width * 0.76,
      y: height * 0.77,
      width: 260,
      height: 70,
      label: "Start Game",
      onClick: () => {
        runtime.startGame();
        this.scene.start("game");
      },
    });

    this.panelIndex = 0;
    this.refreshPanel();
  }

  private refreshPanel() {
    const panel = PANELS[this.panelIndex];
    this.titleText?.setText(panel.title);
    this.bodyText?.setText(panel.body);
    this.stepText?.setText(`Panel ${this.panelIndex + 1} of ${PANELS.length}`);

    if (this.nextButton) {
      this.nextButton.setEnabled(this.panelIndex < PANELS.length - 1);
    }
  }
}
