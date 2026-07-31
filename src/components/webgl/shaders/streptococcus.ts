/**
 * Streptococcus chains — the hero background (replaces the Gray-Scott field).
 *
 * TECHNIQUE: instanced ellipsoid impostors. Each cell is a single camera-facing
 * quad; the fragment stage reconstructs a sphere normal analytically from the
 * quad's own coordinates (n.z = sqrt(1 - x² - y²)) and lights it. That buys
 * real, smooth, perfectly round shading at any zoom for two triangles a cell,
 * in one draw call for the whole field — where actual sphere geometry would
 * cost hundreds of triangles each and still facet at the silhouette.
 *
 * It also makes depth of field free. A blurred cell is not a post-process: it
 * is the same impostor with a softer alpha falloff and its modelling flattened
 * out, which is exactly what an out-of-focus cell looks like down a microscope.
 * No postprocessing pass, so this runs at tier 2 on a mid-range Android.
 *
 * There is deliberately NO pointer interaction. The previous hero seeded
 * colonies under the cursor; the client asked for that to go, and a background
 * that reacts to the mouse pulls attention off the headline.
 */

export const strepVertexShader = /* glsl */ `
  precision highp float;

  // ox, oy = chain origin;  dx, dy = unit direction along the chain
  attribute vec4 aChain;
  // along, chainLen, speed, delay
  attribute vec4 aPath;
  // rx, ry, blur, alpha
  attribute vec4 aShape;
  // waveAmp, waveFreq, wavePhase, unused
  attribute vec4 aWave;
  // curveAmp, curveFreq, curvePhase, unused
  attribute vec4 aCurve;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uGrowDuration;
  uniform float uFade;

  varying vec2  vQuad;
  varying float vBlur;
  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    vec2 dir = aChain.zw;
    vec2 nrm = vec2(-dir.y, dir.x);

    // Cells cycle within the chain's own length. Because spacing divides the
    // chain evenly and the chain overhangs both edges, a cell leaving the
    // right reappears at the left with the spacing intact — an endless chain
    // whose seam is always off-screen.
    float along = mod(aPath.x + uTime * aPath.z, aPath.y);

    // The chain's own bend, plus a slow undulation. The bend is static in the
    // chain's frame, so a cell traces the curve as it travels — the chain
    // keeps its shape while its contents move through it, which is what a
    // filament of cocci actually does.
    float bend = sin(along * aCurve.y + aCurve.z) * aCurve.x;
    float sway = sin(uTime * 0.55 + along * aWave.y + aWave.z) * aWave.x;

    vec2 base = aChain.xy + dir * along + nrm * (bend + sway);

    // Orient the cell to the TANGENT of the curved path, not to the chain's
    // straight-line direction. Without this the ellipses stay axis-aligned
    // while the chain bends around them and the chain visibly comes apart.
    float slope = cos(along * aCurve.y + aCurve.z) * aCurve.x * aCurve.y;
    vec2 tangent = normalize(dir + nrm * slope);
    vec2 tnrm = vec2(-tangent.y, tangent.x);

    // Formation. easeOutBack gives each cell a small overshoot as it appears,
    // which is what makes the chain look like it is being laid down rather
    // than faded in.
    float g = clamp((uTime - aPath.w) / uGrowDuration, 0.0, 1.0);
    float k = 1.70158;
    float m = g - 1.0;
    float grow = max(0.0, 1.0 + (k + 1.0) * m * m * m + k * m * m);

    vec2 local = position.xy * aShape.xy * grow;
    vec2 world = base + tangent * local.x + tnrm * local.y;

    vQuad  = position.xy;
    vBlur  = aShape.z;
    // Alpha leads the scale slightly so a cell is never a hard-edged dot at
    // the instant it appears.
    vAlpha = aShape.w * clamp(g * 1.6, 0.0, 1.0) * uFade;
    vColor = aColor;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(world, 0.0, 1.0);
  }
`;

export const strepFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uDeep;
  uniform vec3 uRim;

  varying vec2  vQuad;
  varying float vBlur;
  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    float r = length(vQuad);
    if (r > 1.0) discard;

    // Analytic sphere normal from the impostor's own coordinates.
    float z = sqrt(max(0.0, 1.0 - r * r));
    vec3 N = normalize(vec3(vQuad, z));
    vec3 L = normalize(vec3(-0.42, 0.58, 0.70));

    float diff = max(0.0, dot(N, L));
    // Stained cocci are DARKEST at the silhouette, where the line of sight
    // passes through the most cell wall. Brightening the rim instead — which
    // the first revision did — puts a halo round every cell and is most of why
    // they read as plastic beads rather than as stained cells.
    float edgeDepth = pow(1.0 - z, 1.9);

    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    // Low exponent: a broad soft sheen across the lit shoulder, not a tight
    // glossy dot. Cell walls are matt.
    float spec = pow(max(0.0, dot(N, H)), 11.0);

    // Cheap surface grain, so the cell is not a perfectly smooth solid.
    float grain = fract(sin(dot(vQuad, vec2(91.7, 47.3))) * 4371.31) - 0.5;

    vec3 col = mix(uDeep, vColor, pow(diff, 0.8));
    col = mix(col, uDeep, edgeDepth * 0.5);
    col += uRim * spec * 0.42;
    col *= 1.0 + grain * 0.05 * (1.0 - vBlur);

    // Out of focus, a cell stops being a modelled sphere and becomes a soft
    // disc of colour. Flattening the shading is what sells that; keeping the
    // highlight would make it read as a shiny ball behind frosted glass.
    col = mix(col, vColor, vBlur * 0.88);

    float edge = mix(0.07, 0.92, vBlur);
    float alpha = (1.0 - smoothstep(1.0 - edge, 1.0, r)) * vAlpha;

    gl_FragColor = vec4(col, alpha);
  }
`;
