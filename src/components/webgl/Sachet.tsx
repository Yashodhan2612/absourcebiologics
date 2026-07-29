"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { PresentationControls } from "@react-three/drei";
import * as THREE from "three";

/**
 * Moment 4 — "The sachet" (Section 7A.6).
 *
 * The most commercially useful 3D element on the site: a real, turnable model
 * of the foil sachet the buyer will actually receive, carrying that SKU's own
 * pack artwork. A QA manager evaluating a strain wants to recognise the pack
 * on their bench.
 *
 * ONE model, one texture swap per SKU. Do not author thirteen models.
 *
 * Lighting is three lights and no environment map. A baked HDR would be a
 * second network request inside a lazy chunk for a gain nobody would notice on
 * a matt foil pouch, and loading one from a CDN is not an option under the
 * site's own asset rules.
 */

const WIDTH = 1.5;
const HEIGHT = 2.0;
/** Half-thickness of the pouch at its fullest point. */
const BULGE = 0.19;
/** Fraction of the height taken by the crimped seal at each end. */
const SEAL = 0.09;

/**
 * Pillow-pouch profile.
 *
 * Returns the outward displacement at (u, v). It falls to exactly zero at
 * every edge and across both seal bands, which is what lets the front and back
 * shells meet without a seam — they share their boundary vertices' positions
 * even though they are separate geometries.
 */
function bulgeAt(u: number, v: number): number {
  if (v < SEAL || v > 1 - SEAL) return 0;
  const vv = (v - SEAL) / (1 - 2 * SEAL);
  // The exponent flattens the centre and steepens the shoulders, which is how
  // a filled foil pouch actually sits. A plain sine reads like a cushion.
  const across = Math.pow(Math.sin(Math.PI * u), 0.65);
  const along = Math.pow(Math.sin(Math.PI * vv), 0.65);
  return BULGE * across * along;
}

/** Sawtooth crimp across the seal bands, the detail that reads as "sealed". */
function crimpAt(v: number, u: number): number {
  const inTopSeal = v < SEAL;
  const inBottomSeal = v > 1 - SEAL;
  if (!inTopSeal && !inBottomSeal) return 0;
  return Math.sin(u * Math.PI * 46) * 0.006;
}

function makeShell(sign: 1 | -1): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT, 60, 80);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const uv = geometry.attributes.uv as THREE.BufferAttribute;

  for (let i = 0; i < position.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    position.setZ(i, sign * (bulgeAt(u, v) + crimpAt(v, u)));
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function Pouch({ texture }: { texture: THREE.Texture }) {
  const group = useRef<THREE.Group>(null);

  const { front, back } = useMemo(
    () => ({ front: makeShell(1), back: makeShell(-1) }),
    []
  );

  useEffect(() => {
    return () => {
      front.dispose();
      back.dispose();
    };
  }, [front, back]);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }, [texture]);

  // Slow idle rotation. A pack that whirls looks like a stock asset rather
  // than a real product, so this is a drift, not a spin.
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.28;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
  });

  return (
    <group ref={group}>
      <mesh geometry={front}>
        <meshStandardMaterial
          map={texture}
          roughness={0.42}
          metalness={0.22}
          side={THREE.FrontSide}
        />
      </mesh>
      {/* The reverse is unprinted foil. Mirroring the artwork onto it would
          show the strain code backwards, which a buyer will notice. */}
      <mesh geometry={back} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial
          color="#e9edee"
          roughness={0.35}
          metalness={0.35}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  );
}

export default function Sachet({
  image,
  onFailed,
}: {
  image: string;
  onFailed?: () => void;
}) {
  const texture = useLoader(THREE.TextureLoader, image);

  return (
    <Canvas
      // Decorative: the pack image, name and strain code are all in the DOM.
      aria-hidden="true"
      role="presentation"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4.9], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            onFailed?.();
          },
          { once: true }
        );
      }}
    >
      <ambientLight intensity={0.75} />
      {/* Key, fill and a cool rim — the rim is what makes the foil read as
          foil rather than as paper. */}
      <directionalLight position={[2.4, 3.2, 4]} intensity={1.5} />
      <directionalLight position={[-3, 1, 2]} intensity={0.45} />
      <directionalLight position={[0, -2, -3]} intensity={0.7} color="#dce7e7" />

      <PresentationControls
        global={false}
        snap
        speed={1.1}
        zoom={1}
        rotation={[0, 0, 0]}
        polar={[-0.35, 0.35]}
        azimuth={[-0.7, 0.7]}
      >
        <Pouch texture={texture} />
      </PresentationControls>
    </Canvas>
  );
}
