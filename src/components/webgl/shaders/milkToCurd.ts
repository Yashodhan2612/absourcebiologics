/**
 * "Milk to curd" — the scroll-driven phase transition (Section 7A.4).
 *
 * This is the product's actual physical transformation, and it is the most
 * persuasive thing the site can show a dahi buyer: milk flows, thickens, sets,
 * and then takes a clean cut. The payoff at the end is not decoration — a
 * clean break face is precisely the quality attribute a curd manufacturer is
 * judged on, and it is what the culture in the sachet is sold on.
 *
 * The lighting is a wrapped-diffuse approximation rather than physically
 * correct subsurface scattering. Real SSS is not worth its cost here; wrapped
 * lighting plus a thickness term reads correctly as set dairy and runs on a
 * mid-range phone.
 *
 * Noise is a compact 3D gradient noise written for this file, so there is no
 * third-party shader licence to track in CREDITS.md.
 */

export const milkVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;   // 0 = flowing milk, 1 = set curd, cleanly cut
  uniform float uAmplitude;
  uniform float uFrequency;

  varying vec2  vUv;
  varying vec3  vNormal;
  varying vec3  vPosition;
  varying float vHeight;

  /* --- compact 3D gradient noise ---------------------------------------- */

  vec3 hash3(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float gnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);   // smoothstep interpolant

    return mix(
      mix(
        mix(dot(hash3(i + vec3(0,0,0)), f - vec3(0,0,0)),
            dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
        mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
            dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
      mix(
        mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
            dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
        mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
            dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y),
      u.z);
  }

  /** Three octaves is enough for a liquid surface and cheap enough for tier 2. */
  float fbm(vec3 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
      total += gnoise(p) * amplitude;
      p *= 2.02;
      amplitude *= 0.5;
    }
    return total;
  }

  float surfaceAt(vec2 uv, float t) {
    return fbm(vec3(uv * uFrequency, t)) * uAmplitude;
  }

  /**
   * Position of the cut, in uv.x.
   *
   * The knife only travels across the last quarter of the scroll, and it stops
   * at 0.62 rather than crossing the whole plane. Both matter: a sweep tied to
   * the full range spends the entire section wiping relief away, and one that
   * crosses completely leaves a blank plane at the end. Stopping partway is
   * what produces the actual picture — set curd on one side, a flat matte
   * break face on the other, with a clean edge between them.
   */
  float cutLine(float progress) {
    return mix(-0.25, 0.62, smoothstep(0.75, 1.0, progress));
  }

  void main() {
    vUv = uv;

    // Flow slows as the curd sets, and stops entirely by the time it is set.
    float flow = uTime * 0.35 * (1.0 - smoothstep(0.0, 0.72, uProgress));

    float h = surfaceAt(uv, flow);

    // Behind the sweep the surface is a cut face: dead flat, no relief at all.
    // That flatness IS the clean cut, so it must be exact rather than damped.
    float line = cutLine(uProgress);
    float cut = smoothstep(line - 0.012, line + 0.012, uv.x);
    h *= cut;

    vHeight = h;

    // Normals by finite difference against the same field. Cheaper and more
    // stable than recomputing them on the CPU every frame.
    float e = 0.012;
    float hx = surfaceAt(uv + vec2(e, 0.0), flow) * cut;
    float hy = surfaceAt(uv + vec2(0.0, e), flow) * cut;
    vec3 n = normalize(vec3(-(hx - h) / e, -(hy - h) / e, 1.0));

    vNormal = normalize(normalMatrix * n);

    vec3 displaced = position + vec3(0.0, 0.0, h);
    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
    vPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const milkFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uProgress;
  uniform vec3  uMilk;
  uniform vec3  uChill;
  uniform vec3  uTank;

  varying vec2  vUv;
  varying vec3  vNormal;
  varying vec3  vPosition;
  varying float vHeight;

  /** Must stay identical to cutLine() in the vertex stage. */
  float cutLine(float progress) {
    return mix(-0.25, 0.62, smoothstep(0.75, 1.0, progress));
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(vec3(0.45, 0.7, 0.85));
    vec3 V = normalize(-vPosition);

    // Wrapped diffuse: light bleeds past the terminator the way it does
    // through a translucent solid. uWrap widens as the curd sets, which is
    // what makes set dairy read as dense rather than as painted plastic.
    float wrap = mix(0.25, 0.62, uProgress);
    float diffuse = max(0.0, (dot(N, L) + wrap) / (1.0 + wrap));

    // Specular collapses as the surface roughens. Flowing milk is glossy; set
    // curd is not. This single term does most of the phase-change work.
    float gloss = mix(58.0, 6.0, smoothstep(0.0, 0.8, uProgress));
    float strength = mix(0.55, 0.06, smoothstep(0.0, 0.8, uProgress));
    vec3 H = normalize(L + V);
    float specular = pow(max(0.0, dot(N, H)), gloss) * strength;

    // The surface sits on an ab-tank section, so the shadow end of the ramp
    // goes most of the way to tank. Rendering white-on-white — which is what
    // the first revision did — produced a surface with no readable form at
    // all; a white material only shows its shape against a dark ground.
    vec3 shadow = mix(uTank, uChill, 0.30);
    vec3 color = mix(shadow, uMilk, pow(diffuse, 0.85));

    // Relief shading: troughs pick up the tank tint, which is where the
    // surface reads as having depth rather than as a flat gradient.
    color = mix(color, uTank, clamp(-vHeight * 3.0, 0.0, 1.0) * 0.45);
    color += specular;

    // The cut edge itself: a thin whey sheen where the plane passed through.
    float line = cutLine(uProgress);
    float edge = 1.0 - smoothstep(0.0, 0.010, abs(vUv.x - line));
    color = mix(color, uMilk, edge * 0.65 * step(0.0, line));

    // The break face reads matte, and slightly cooler than the curd beside it.
    float face = 1.0 - smoothstep(line - 0.012, line + 0.012, vUv.x);
    color = mix(color, mix(uChill, uMilk, 0.55), face * 0.35 * step(0.0, line));

    gl_FragColor = vec4(color, 1.0);
  }
`;
