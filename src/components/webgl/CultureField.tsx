"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { strepFragmentShader, strepVertexShader } from "./shaders/streptococcus";
import { buildStrepField, CELL_DEEP, CELL_RIM } from "./strepLayout";
import { isPerfDebug, maxDpr, type RenderTier } from "@/lib/render-tier";

/**
 * The hero background: chains of Streptococcus forming and drifting across the
 * page (Section 7A.3, revised).
 *
 * On load the chains lay themselves down one cell at a time, sweeping left to
 * right across the viewport, then drift slowly rightward with a gentle
 * undulation. There is no pointer interaction of any kind — deliberately.
 *
 * This module is the lazy chunk. Nothing here, and nothing it imports, may
 * appear in the initial bundle; CultureFieldMount owns that boundary. The
 * canvas is aria-hidden and purely decorative: every word, link and strain
 * code lives in the DOM above it.
 */

/** sRGB triple to a linear-space THREE.Color, matching the renderer's space. */
function linear(c: readonly [number, number, number]): THREE.Color {
  return new THREE.Color().setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace);
}

type FieldUniforms = {
  uTime: THREE.IUniform<number>;
  uGrowDuration: THREE.IUniform<number>;
  uFade: THREE.IUniform<number>;
  uDeep: THREE.IUniform<THREE.Color>;
  uRim: THREE.IUniform<THREE.Color>;
};

function Chains({
  tier,
  fadeRef,
  dprScale,
}: {
  tier: RenderTier;
  fadeRef: React.RefObject<number>;
  dprScale: number;
}) {
  const { gl, camera, size } = useThree();
  const aspect = size.width / Math.max(size.height, 1);

  // Regenerating on a material aspect change is what makes this work on a
  // phone without a second design: chain length is derived from the aspect, so
  // a portrait viewport gets short chains and a desktop gets long ones, with
  // identical vertical composition. Quantised so ordinary resize jitter — and
  // mobile browser chrome collapsing on scroll — does not rebuild the field.
  const aspectKey = Math.round(aspect * 8) / 8;

  const field = useMemo(
    () => buildStrepField({ aspect: aspectKey, tier: tier >= 3 ? 3 : 2 }),
    [aspectKey, tier]
  );

  const { geometry, material, uniforms } = useMemo(() => {
    const base = new THREE.PlaneGeometry(2, 2, 1, 1);
    const instanced = new THREE.InstancedBufferGeometry();
    instanced.index = base.index;
    instanced.attributes.position = base.attributes.position!;
    instanced.attributes.uv = base.attributes.uv!;
    instanced.instanceCount = field.instances.length;
    base.dispose();

    const n = field.instances.length;
    const chain = new Float32Array(n * 4);
    const path = new Float32Array(n * 4);
    const shape = new Float32Array(n * 4);
    const wave = new Float32Array(n * 4);
    const curve = new Float32Array(n * 4);
    const color = new Float32Array(n * 3);

    field.instances.forEach((it, i) => {
      chain.set([it.ox, it.oy, it.dx, it.dy], i * 4);
      path.set([it.along, it.chainLen, it.speed, it.delay], i * 4);
      shape.set([it.rx, it.ry, it.blur, it.alpha], i * 4);
      wave.set([it.waveAmp, it.waveFreq, it.wavePhase, 0], i * 4);
      curve.set([it.curveAmp, it.curveFreq, it.curvePhase, 0], i * 4);

      // Instanced attributes bypass THREE's colour management entirely — they
      // are raw floats — so the sRGB to linear conversion has to happen here.
      // Skipping it makes every cell noticeably washed out.
      const c = linear(it.color);
      color.set([c.r, c.g, c.b], i * 3);
    });

    instanced.setAttribute("aChain", new THREE.InstancedBufferAttribute(chain, 4));
    instanced.setAttribute("aPath", new THREE.InstancedBufferAttribute(path, 4));
    instanced.setAttribute("aShape", new THREE.InstancedBufferAttribute(shape, 4));
    instanced.setAttribute("aWave", new THREE.InstancedBufferAttribute(wave, 4));
    instanced.setAttribute("aCurve", new THREE.InstancedBufferAttribute(curve, 4));
    instanced.setAttribute("aColor", new THREE.InstancedBufferAttribute(color, 3));

    const u: FieldUniforms = {
      uTime: { value: 0 },
      uGrowDuration: { value: field.growDuration },
      uFade: { value: 1 },
      uDeep: { value: linear(CELL_DEEP) },
      uRim: { value: linear(CELL_RIM) },
    };

    return {
      geometry: instanced,
      uniforms: u,
      material: new THREE.ShaderMaterial({
        vertexShader: strepVertexShader,
        fragmentShader: strepFragmentShader,
        uniforms: u,
        transparent: true,
        // The instances are pre-sorted back to front in strepLayout, so draw
        // order is the depth order. Depth testing translucent impostors would
        // punch holes in the cells behind them.
        depthTest: false,
        depthWrite: false,
      }),
    };
  }, [field]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Orthographic frame: half-height pinned to 1, half-width follows the
  // aspect. strepLayout depends on this exact convention.
  useEffect(() => {
    const cam = camera as THREE.OrthographicCamera;
    cam.left = -aspect;
    cam.right = aspect;
    cam.top = 1;
    cam.bottom = -1;
    cam.updateProjectionMatrix();
  }, [camera, aspect]);

  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr(tier) * dprScale));
  }, [gl, tier, dprScale]);

  useFrame((_, delta) => {
    // Clamped only to stop a backgrounded tab, restored after minutes away,
    // jumping the formation and the drift forward by that whole interval.
    //
    // The ceiling has to stay well above a plausible frame time. At the 0.05
    // this first shipped with, any device rendering below 20fps advanced the
    // animation slower than real time — the formation crawled and the field
    // sat half-built. A clamp is a safety net for pathological deltas, not a
    // frame budget.
    uniforms.uTime.value += Math.min(delta, 0.25);
    uniforms.uFade.value = fadeRef.current;
  });

  return <mesh frustumCulled={false} geometry={geometry} material={material} />;
}

export default function CultureField({
  tier,
  onContextLost,
}: {
  tier: RenderTier;
  onContextLost?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef(1);
  const [dprScale, setDprScale] = useState(1);
  const [visible, setVisible] = useState(true);

  // The field dissolves as the hero leaves, so the section boundary is a clean
  // ab-milk edge rather than a canvas that abruptly stops.
  useEffect(() => {
    const read = () => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const travelled = Math.max(0, -rect.top);
      const progress = Math.min(1, travelled / Math.max(rect.height, 1));
      fadeRef.current = 1 - Math.pow(progress, 1.5);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);

  // Pause when the tab is hidden or the hero has scrolled away.
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
        orthographic
        camera={{ position: [0, 0, 1], near: 0, far: 2, left: -1, right: 1, top: 1, bottom: -1 }}
        onCreated={({ gl }) => {
          // On mid-range Android this genuinely happens. Hand back to the
          // poster silently rather than leaving a dead rectangle.
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
          // then again, then hand back to the poster.
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
          <Chains tier={tier} fadeRef={fadeRef} dprScale={dprScale} />
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
