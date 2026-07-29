"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { milkFragmentShader, milkVertexShader } from "./shaders/milkToCurd";
import { maxDpr, type RenderTier } from "@/lib/render-tier";

/**
 * Moment 2 — "Milk to curd" (Section 7A.4). The site's ONLY pinned section.
 *
 * Scroll progress 0 -> 1 runs the surface through flowing milk, thickening,
 * setting, and finally a clean cut. The pin and the scrub live in the parent
 * section; this component only consumes a progress ref, which keeps the GSAP
 * timeline and the render loop from fighting over who owns scroll.
 */

const MILK = new THREE.Color("#fbfaf7");
const CHILL = new THREE.Color("#dce7e7");
const TANK = new THREE.Color("#0b3b3c");

type MilkUniforms = {
  uTime: THREE.IUniform<number>;
  uProgress: THREE.IUniform<number>;
  uAmplitude: THREE.IUniform<number>;
  uFrequency: THREE.IUniform<number>;
  uMilk: THREE.IUniform<THREE.Color>;
  uChill: THREE.IUniform<THREE.Color>;
  uTank: THREE.IUniform<THREE.Color>;
};

function Surface({
  tier,
  progressRef,
}: {
  tier: RenderTier;
  progressRef: React.RefObject<number>;
}) {
  // Tier 2 halves the tessellation. The surface is smooth enough that the
  // difference is invisible at a glance and the vertex cost halves.
  const segments = tier >= 3 ? 180 : 90;

  const { material, uniforms } = useMemo(() => {
    const u: MilkUniforms = {
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uAmplitude: { value: 0.34 },
      uFrequency: { value: 3.1 },
      uMilk: { value: MILK },
      uChill: { value: CHILL },
      uTank: { value: TANK },
    };
    return {
      uniforms: u,
      material: new THREE.ShaderMaterial({
        vertexShader: milkVertexShader,
        fragmentShader: milkFragmentShader,
        uniforms: u,
      }),
    };
  }, []);

  useEffect(() => () => material.dispose(), [material]);

  useFrame((_, delta) => {
    const p = progressRef.current;
    uniforms.uTime.value += delta;
    uniforms.uProgress.value = p;
    // Relief falls away as the curd sets; frequency climbs slightly so the
    // structure gets finer rather than simply flatter, which is what setting
    // actually looks like.
    uniforms.uAmplitude.value = 0.34 * (1 - 0.72 * Math.pow(p, 0.8)) + 0.03;
    uniforms.uFrequency.value = 3.1 + p * 2.2;
  });

  return (
    <mesh material={material} rotation={[-0.42, 0, 0]}>
      <planeGeometry args={[7.2, 4.6, segments, segments]} />
    </mesh>
  );
}

export default function MilkToCurd({
  tier,
  progressRef,
  onContextLost,
}: {
  tier: RenderTier;
  progressRef: React.RefObject<number>;
  onContextLost?: () => void;
}) {
  const [visible, setVisible] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = wrapRef.current;
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
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        aria-hidden="true"
        role="presentation"
        frameloop={visible ? "always" : "never"}
        dpr={[1, maxDpr(tier)]}
        camera={{ position: [0, 0, 4.4], fov: 42 }}
        gl={{ antialias: tier >= 3, alpha: true }}
        onCreated={({ gl }) => {
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
        <Surface tier={tier} progressRef={progressRef} />
      </Canvas>
    </div>
  );
}
