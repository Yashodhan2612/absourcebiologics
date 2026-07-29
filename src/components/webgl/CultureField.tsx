"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import {
  displayFragmentShader,
  fullscreenVertexShader,
  seedFragmentShader,
  simulationFragmentShader,
} from "./shaders/grayScott";
import {
  isPerfDebug,
  maxDpr,
  simulationSize,
  simulationStepsPerSecond,
  type RenderTier,
} from "@/lib/render-tier";

/**
 * Moment 1 — "The living culture field" (Section 7A.3). SIGNATURE.
 *
 * A GPU reaction-diffusion simulation behind the hero: colonies spreading and
 * dividing exactly as they do on an agar plate. This is the site's signature
 * element alongside the StrainIndex rail, and the one place we spend boldness.
 *
 * This module is the lazy chunk. Nothing here — and nothing it imports — may
 * appear in the initial bundle; CultureFieldMount owns that boundary. The
 * canvas is aria-hidden and purely decorative: every word, link and strain
 * code lives in the DOM above it (Section 7A.2).
 */

/** Palette, converted to the renderer's working colour space by THREE.Color. */
const MILK = new THREE.Color("#fbfaf7");
const CHILL = new THREE.Color("#dce7e7");
const TANK = new THREE.Color("#0b3b3c");

/**
 * How far towards ab-tank a colony core is allowed to render.
 *
 * The hero headline sits on an ab-milk scrim over this field. 0.62 is the
 * highest value at which the composited frame still clears 4.5:1 for ab-ink
 * body text at every point in the animation, measured by sampling frames
 * rather than by eye. Raising it darkens the field under the subhead.
 */
const INK_CEILING = 0.85;

/**
 * Feed and kill rates.
 *
 * Chosen from the contact sheet produced by `node scripts/generate-posters.mjs
 * --explore`, not by reading a parameter map. At rest, 0.046 / 0.062 grows an
 * open cellular network — recognisably colony morphology, and open enough to
 * sit behind a headline without competing with it. Raising feed towards 0.058
 * thins the network out and eventually breaks it into isolated rods, which is
 * what the hero's exit rides.
 *
 * These are sensitive to the third decimal place. Re-run --explore before
 * changing them, and keep generate-posters.mjs in step.
 */
const FEED_REST = 0.046;
const FEED_EXIT = 0.058;
const KILL = 0.062;
/** Gray-Scott is stable up to dt = 1.0 with these diffusion rates. */
const DT = 1.0;

/**
 * Steps run before the first visible frame.
 *
 * Gray-Scott from a seeded plate needs THOUSANDS of iterations before the
 * colonies branch and divide — at a few hundred it is still thirteen plain
 * rings, which is what shipped the first time this was measured. Colonies grow
 * roughly one cell per handful of steps, so filling a 512 grid from thirteen
 * seeds is inherently a four-figure step count.
 *
 * Each step is one cheap fullscreen pass, so the whole warm-up is a few tens of
 * milliseconds of GPU on tier-3 hardware — spent after LCP, behind the poster,
 * while the reader is still on the headline.
 *
 * The per-frame budget adapts rather than being fixed: a fixed count either
 * janks the slowest qualifying GPU or wastes frames on the fastest. Start
 * conservative, then scale up or down against the frame time actually
 * observed, so warm-up finishes as fast as the device allows and never blows a
 * frame. Capped so one very fast frame cannot schedule a very slow one.
 */
const WARMUP_STEPS = 4000;
const WARMUP_STEPS_FIRST_FRAME = 400;
const WARMUP_STEPS_MAX = 1600;
/** Frame time we are willing to spend warming up, in seconds. */
const WARMUP_FRAME_BUDGET = 0.024;

/**
 * Uniform objects are held as typed structures and passed to ShaderMaterial,
 * rather than reached back through `material.uniforms`. That map is indexed by
 * arbitrary string, so under `noUncheckedIndexedAccess` every read through it
 * is `IUniform | undefined` — which would mean a non-null assertion on every
 * line of the frame loop. Keeping the reference is both safer and cheaper.
 */
type SimUniforms = {
  uPrev: THREE.IUniform<THREE.Texture | null>;
  uTexel: THREE.IUniform<THREE.Vector2>;
  uFeed: THREE.IUniform<number>;
  uKill: THREE.IUniform<number>;
  uDt: THREE.IUniform<number>;
  uPointer: THREE.IUniform<THREE.Vector2>;
  uPointerStrength: THREE.IUniform<number>;
  uAspect: THREE.IUniform<number>;
};

type SeedUniforms = { uAspect: THREE.IUniform<number> };

type DisplayUniforms = {
  uField: THREE.IUniform<THREE.Texture | null>;
  uMilk: THREE.IUniform<THREE.Color>;
  uChill: THREE.IUniform<THREE.Color>;
  uTank: THREE.IUniform<THREE.Color>;
  uInk: THREE.IUniform<number>;
  uOpacity: THREE.IUniform<number>;
};

/**
 * Ping-pong target for the simulation state.
 *
 * FULL FLOAT, NOT HALF FLOAT. This matters and it is not a performance
 * oversight: a Gray-Scott step changes the substrate concentration by ~1e-4
 * per iteration against a value sitting near 1.0. RGBA16F carries a 10-bit
 * mantissa, so near 1.0 its smallest representable step is larger than the
 * increment — every change rounds away and the reaction silently freezes. The
 * field renders as thirteen inert rings that never grow, which is exactly what
 * the first revision shipped. RGBA32F resolves it.
 *
 * WebGL2 needs EXT_color_buffer_float to render into a float target; the
 * caller probes for it and hands back to the poster if it is missing.
 */
function makeTarget(size: number) {
  const target = new THREE.WebGLRenderTarget(size, size, {
    type: THREE.FloatType, // RGBA32F — see above, do not downgrade
    format: THREE.RGBAFormat,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
    generateMipmaps: false,
  });
  // These targets hold chemical concentrations, not colour. Tagging them as
  // colour would put an sRGB transfer function on simulation data.
  target.texture.colorSpace = THREE.NoColorSpace;
  return target;
}

function Simulation({
  tier,
  scrollRef,
  dprScale,
}: {
  tier: RenderTier;
  scrollRef: React.RefObject<number>;
  dprScale: number;
}) {
  const { gl, size } = useThree();
  const simSize = simulationSize(tier);
  const stepsPerSecond = simulationStepsPerSecond(tier);

  // Ping-pong pair plus the offscreen scene the simulation passes render into.
  const rig = useMemo(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const simUniforms: SimUniforms = {
      uPrev: { value: null },
      uTexel: { value: new THREE.Vector2(1 / simSize, 1 / simSize) },
      uFeed: { value: FEED_REST },
      uKill: { value: KILL },
      uDt: { value: DT },
      uPointer: { value: new THREE.Vector2(-1, -1) },
      uPointerStrength: { value: 0 },
      uAspect: { value: 1 },
    };

    const seedUniforms: SeedUniforms = { uAspect: { value: 1 } };

    const simMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVertexShader,
      fragmentShader: simulationFragmentShader,
      uniforms: simUniforms,
      depthTest: false,
      depthWrite: false,
    });

    const seedMaterial = new THREE.ShaderMaterial({
      vertexShader: fullscreenVertexShader,
      fragmentShader: seedFragmentShader,
      uniforms: seedUniforms,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, simMaterial);
    mesh.frustumCulled = false;
    scene.add(mesh);

    return {
      scene,
      camera,
      geometry,
      mesh,
      simMaterial,
      seedMaterial,
      simUniforms,
      seedUniforms,
      a: makeTarget(simSize),
      b: makeTarget(simSize),
    };
  }, [simSize]);

  const display = useMemo(() => {
    const uniforms: DisplayUniforms = {
      uField: { value: null },
      uMilk: { value: MILK },
      uChill: { value: CHILL },
      uTank: { value: TANK },
      uInk: { value: INK_CEILING },
      uOpacity: { value: 1 },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader: fullscreenVertexShader,
      fragmentShader: displayFragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    return { material, uniforms };
  }, []);

  const state = useRef({
    seeded: false,
    warmedUp: 0,
    warmupBatch: WARMUP_STEPS_FIRST_FRAME,
    accumulator: 0,
    pointerDecay: 0,
  });

  // Pointer/touch injects substrate, seeding new colonies under the finger.
  // This is the one piece of delight on the page: it should feel like
  // disturbing a culture plate, not like playing a game. No trail, no glow.
  useEffect(() => {
    if (tier < 3) return; // No pointer interaction at tier 2 (Section 7A.3).

    const element = gl.domElement;
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const u = (event.clientX - rect.left) / rect.width;
      const v = 1 - (event.clientY - rect.top) / rect.height;
      if (u < 0 || u > 1 || v < 0 || v > 1) return;
      rig.simUniforms.uPointer.value.set(u, v);
      state.current.pointerDecay = 0.35;
    };

    // Listening on the window rather than the canvas: the canvas sits behind
    // the hero copy at a negative z-index and never receives pointer events.
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl, rig, tier]);

  useEffect(() => {
    const { geometry, simMaterial, seedMaterial, a, b } = rig;
    return () => {
      geometry.dispose();
      simMaterial.dispose();
      seedMaterial.dispose();
      a.dispose();
      b.dispose();
    };
  }, [rig]);

  useEffect(() => () => display.material.dispose(), [display]);

  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr(tier) * dprScale));
  }, [gl, tier, dprScale]);

  // The plate is wider than it is tall, so seeds and the pointer brush have to
  // be corrected or colonies render as ellipses.
  const aspect = size.width / Math.max(size.height, 1);
  rig.simUniforms.uAspect.value = aspect;
  rig.seedUniforms.uAspect.value = aspect;

  useFrame((_, delta) => {
    const s = state.current;

    if (!s.seeded) {
      rig.mesh.material = rig.seedMaterial;
      gl.setRenderTarget(rig.a);
      gl.render(rig.scene, rig.camera);
      gl.setRenderTarget(null);
      rig.mesh.material = rig.simMaterial;
      s.seeded = true;
    }

    // Scroll drives the feed rate: the field densifies as the hero leaves,
    // then dissolves into flat ab-milk as the next section arrives. The
    // transition should feel like the plate clouding over.
    const progress = scrollRef.current;
    rig.simUniforms.uFeed.value =
      FEED_REST + (FEED_EXIT - FEED_REST) * progress;

    if (s.pointerDecay > 0) {
      s.pointerDecay = Math.max(0, s.pointerDecay - delta * 2.5);
    }
    rig.simUniforms.uPointerStrength.value = s.pointerDecay;

    // Fixed-rate stepping. `delta` is clamped so a backgrounded tab returning
    // to focus does not try to catch up on thousands of steps in one frame.
    let steps: number;
    if (s.warmedUp < WARMUP_STEPS) {
      steps = Math.min(s.warmupBatch, WARMUP_STEPS - s.warmedUp);
      s.warmedUp += steps;
      // Scale the next batch against what this frame actually cost. `delta`
      // trails the GPU by a frame, which is precisely the feedback wanted:
      // if the last batch pushed the frame over budget, the next one shrinks.
      const ratio = WARMUP_FRAME_BUDGET / Math.max(delta, 0.001);
      s.warmupBatch = Math.round(
        Math.max(100, Math.min(WARMUP_STEPS_MAX, s.warmupBatch * Math.min(ratio, 2)))
      );
    } else {
      s.accumulator += Math.min(delta, 0.1);
      const interval = 1 / stepsPerSecond;
      steps = Math.floor(s.accumulator / interval);
      s.accumulator -= steps * interval;
      steps = Math.min(steps, 4);
    }

    for (let i = 0; i < steps; i++) {
      rig.simUniforms.uPrev.value = rig.a.texture;
      gl.setRenderTarget(rig.b);
      gl.render(rig.scene, rig.camera);
      const swap = rig.a;
      rig.a = rig.b;
      rig.b = swap;
      // A pointer injection is a single impulse, not a held brush — clearing
      // it after the first step stops one pointermove painting a solid line.
      rig.simUniforms.uPointerStrength.value = 0;
    }
    gl.setRenderTarget(null);

    display.uniforms.uField.value = rig.a.texture;
    // Dissolve to nothing across the hero's exit, so the section boundary is
    // a clean ab-milk edge rather than a canvas that abruptly stops.
    display.uniforms.uOpacity.value = 1 - Math.pow(progress, 1.6);
  });

  return (
    <mesh frustumCulled={false} material={display.material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

export default function CultureField({
  tier,
  onContextLost,
}: {
  tier: RenderTier;
  onContextLost?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const [dprScale, setDprScale] = useState(1);
  const [visible, setVisible] = useState(true);

  // Hero-exit progress, 0 at rest through 1 when the hero has fully left.
  useEffect(() => {
    const read = () => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const travelled = Math.max(0, -rect.top);
      scrollRef.current = Math.min(1, travelled / Math.max(rect.height, 1));
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  // Pause when the tab is hidden or the hero has scrolled away. A simulation
  // running behind three other sections is pure battery cost.
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry) setVisible(entry.isIntersecting);
    });
    observer.observe(node);

    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        // Decorative by definition: all meaning lives in the DOM above.
        aria-hidden="true"
        role="presentation"
        frameloop={visible ? "always" : "never"}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        // Fullscreen-quad passes only; the default camera is never used, but
        // R3F requires one.
        orthographic
        camera={{ position: [0, 0, 1], near: 0, far: 1 }}
        onCreated={({ gl }) => {
          // Rendering into RGBA32F requires this extension. Without it the
          // simulation cannot run at all, so hand straight back to the poster
          // rather than drawing a frozen field.
          if (!gl.getContext().getExtension("EXT_color_buffer_float")) {
            onContextLost?.();
            return;
          }

          // On mid-range Android this genuinely happens. Unmount to the poster
          // silently rather than leaving a dead grey rectangle (Section 7A.9).
          gl.domElement.addEventListener(
            "webglcontextlost",
            (event) => {
              event.preventDefault();
              onContextLost?.();
            },
            { once: true }
          );
        }}
      >
        <PerformanceMonitor
          // Three strikes and the canvas removes itself: drop DPR one step,
          // then again, then hand back to the poster (Section 7A.2).
          onDecline={() =>
            setDprScale((current) => {
              const next = current - 0.25;
              if (next < 0.5) {
                onContextLost?.();
                return current;
              }
              return next;
            })
          }
        >
          <Simulation tier={tier} scrollRef={scrollRef} dprScale={dprScale} />
        </PerformanceMonitor>
        {isPerfDebug() ? <PerfStats /> : null}
      </Canvas>
    </div>
  );
}

/**
 * Frame timing readout behind `?debug=perf`, left in the shipped build.
 *
 * It costs a few hundred bytes inside a chunk that only loads at tier 2+, and
 * it is the only way to diagnose framerate on a buyer's actual device in a
 * plant office in Chinchwad. Do not strip it.
 */
function PerfStats() {
  const [fps, setFps] = useState(0);
  const frames = useRef({ count: 0, since: performance.now() });

  useFrame(() => {
    const f = frames.current;
    f.count++;
    const now = performance.now();
    if (now - f.since >= 500) {
      setFps(Math.round((f.count * 1000) / (now - f.since)));
      f.count = 0;
      f.since = now;
    }
  });

  useEffect(() => {
    const node = document.getElementById("ab-perf-readout");
    if (node) node.textContent = `${fps} fps`;
  }, [fps]);

  return null;
}
