/**
 * Gray-Scott reaction-diffusion — the shaders behind the hero culture field
 * (Section 7A.3).
 *
 * Gray-Scott is not an arbitrary choice of pretty maths. It produces exactly
 * the morphology of bacterial colonies spreading and dividing on an agar
 * plate, which is precisely what ABsource manufactures. Every 3D moment on
 * this site depicts something that physically happens in a dairy fermentation;
 * this one depicts the thing in the sachet.
 *
 * GLSL lives in a .ts module rather than in .glsl files imported raw. That
 * avoids a webpack loader rule in next.config.ts purely to move three strings,
 * and it keeps the shaders inside the type-checked, linted graph. If the
 * shader set grows past a few hundred lines, revisit that trade.
 */

/** Shared fullscreen-quad vertex shader. */
export const fullscreenVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Seeding pass.
 *
 * Initialises the field to pure substrate (A = 1, B = 0) and drops THIRTEEN
 * colony seeds into it — one per DVS culture line. That is not decorative
 * trivia. Keep it at thirteen if you edit this, and keep the positions
 * deterministic: the tier-1 poster is a pre-rendered still of this exact
 * field, and the two must not drift apart.
 */
export const seedFragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uAspect;

  // Thirteen seeds, one per culture line, scattered but deterministic.
  const int SEED_COUNT = 13;
  vec2 seedAt(int i) {
    if (i ==  0) return vec2(0.18, 0.72);
    if (i ==  1) return vec2(0.31, 0.41);
    if (i ==  2) return vec2(0.47, 0.79);
    if (i ==  3) return vec2(0.62, 0.33);
    if (i ==  4) return vec2(0.74, 0.62);
    if (i ==  5) return vec2(0.86, 0.28);
    if (i ==  6) return vec2(0.12, 0.24);
    if (i ==  7) return vec2(0.55, 0.57);
    if (i ==  8) return vec2(0.92, 0.71);
    if (i ==  9) return vec2(0.39, 0.17);
    if (i == 10) return vec2(0.68, 0.88);
    if (i == 11) return vec2(0.26, 0.92);
    return vec2(0.81, 0.48);
  }

  void main() {
    float b = 0.0;
    for (int i = 0; i < SEED_COUNT; i++) {
      vec2 d = (vUv - seedAt(i)) * vec2(uAspect, 1.0);
      // Soft-edged disc: a hard disc produces a visible square artefact at
      // low simulation resolutions.
      b += smoothstep(0.045, 0.008, length(d));
    }
    gl_FragColor = vec4(1.0, clamp(b, 0.0, 1.0), 0.0, 1.0);
  }
`;

/**
 * Simulation pass — one Gray-Scott step.
 *
 * Run at a FIXED 30 steps/sec (20 at tier 2) decoupled from render framerate,
 * so the field behaves identically on a 60Hz laptop and a 120Hz phone. If you
 * ever tie this to frame delta, the morphology changes with the device and the
 * pre-rendered poster stops matching what people see.
 */
export const simulationFragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uPrev;
  uniform vec2  uTexel;
  uniform float uFeed;      // ~0.037, scroll-driven up to ~0.058
  uniform float uKill;      // ~0.060
  uniform float uDt;

  // Pointer seeding: injects colony where the reader touches the plate.
  uniform vec2  uPointer;
  uniform float uPointerStrength;
  uniform float uAspect;

  vec2 laplacian() {
    vec2 sum = vec2(0.0);
    sum += texture2D(uPrev, vUv + vec2(-1.0,  0.0) * uTexel).xy * 0.20;
    sum += texture2D(uPrev, vUv + vec2( 1.0,  0.0) * uTexel).xy * 0.20;
    sum += texture2D(uPrev, vUv + vec2( 0.0, -1.0) * uTexel).xy * 0.20;
    sum += texture2D(uPrev, vUv + vec2( 0.0,  1.0) * uTexel).xy * 0.20;
    sum += texture2D(uPrev, vUv + vec2(-1.0, -1.0) * uTexel).xy * 0.05;
    sum += texture2D(uPrev, vUv + vec2( 1.0, -1.0) * uTexel).xy * 0.05;
    sum += texture2D(uPrev, vUv + vec2(-1.0,  1.0) * uTexel).xy * 0.05;
    sum += texture2D(uPrev, vUv + vec2( 1.0,  1.0) * uTexel).xy * 0.05;
    return sum - texture2D(uPrev, vUv).xy;
  }

  void main() {
    vec2 c = texture2D(uPrev, vUv).xy;   // x = A (substrate), y = B (colony)
    vec2 lap = laplacian();
    float reaction = c.x * c.y * c.y;

    float a = c.x + (1.0 * lap.x - reaction + uFeed * (1.0 - c.x)) * uDt;
    float b = c.y + (0.5 * lap.y + reaction - (uKill + uFeed) * c.y) * uDt;

    if (uPointerStrength > 0.0) {
      vec2 d = (vUv - uPointer) * vec2(uAspect, 1.0);
      b += smoothstep(0.035, 0.004, length(d)) * uPointerStrength;
    }

    gl_FragColor = vec4(clamp(a, 0.0, 1.0), clamp(b, 0.0, 1.0), 0.0, 1.0);
  }
`;

/**
 * Display pass — maps colony concentration through the brand palette.
 *
 * ab-milk at zero, ab-chill in the mid range, ab-tank at the colony cores.
 * NO THIRD COLOUR, and ab-ghee never appears here (Section 7A.3, Section 16).
 *
 * `uInk` caps how far towards ab-tank the darkest cores are allowed to go.
 * It exists so the hero headline clears 4.5:1 against the composited frame at
 * every point in the animation — that is verified by sampling the frame, not
 * by eyeballing it. Do not raise it without re-running that check.
 */
export const displayFragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;

  uniform sampler2D uField;
  uniform vec3  uMilk;
  uniform vec3  uChill;
  uniform vec3  uTank;
  uniform float uInk;      // ceiling on how dark a colony core may render
  uniform float uOpacity;

  void main() {
    float b = texture2D(uField, vUv).y;

    vec3 color = mix(uMilk, uChill, smoothstep(0.04, 0.18, b));
    color = mix(color, uTank, smoothstep(0.16, 0.42, b) * uInk);

    // A faint rim where concentration changes fastest reads as the glossy
    // edge of a colony under lab light. Cheap, and it is what sells the
    // surface as biological rather than as a gradient.
    float edge = smoothstep(0.20, 0.26, b) * (1.0 - smoothstep(0.30, 0.38, b));
    color = mix(color, uMilk, edge * 0.14);

    gl_FragColor = vec4(color, uOpacity);
  }
`;
