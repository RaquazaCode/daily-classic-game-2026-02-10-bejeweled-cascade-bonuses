import Phaser from "phaser";

const FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;
uniform float uTime;

void main(void) {
  vec2 uv = outTexCoord;
  vec4 color = texture2D(uMainSampler, uv);

  float dist = distance(uv, vec2(0.5, 0.5));
  float vignette = smoothstep(0.85, 0.24, dist);
  float shimmer = 0.012 * sin((uv.y * 26.0) + (uTime * 0.9));

  color.rgb += vec3(0.0, 0.02, 0.06) * shimmer;
  color.rgb *= vignette;

  gl_FragColor = color;
}
`;

export class LuxeVignettePipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game: Phaser.Game) {
    super({
      game,
      name: "LuxeVignette",
      fragShader: FRAGMENT_SHADER,
    });
  }

  onPreRender() {
    this.set1f("uTime", this.game.loop.time / 1000);
  }
}
