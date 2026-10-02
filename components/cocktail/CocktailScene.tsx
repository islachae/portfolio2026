"use client";

/**
 * The 3D layer of Word Cocktail: one canvas behind the page's type.
 * Loaded on demand (three.js is already in the bundle for the Home gradient).
 */
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Bar, type BarStore } from "./bar";
import { studioEnvironment } from "./kit";

function BarScene({ store, bg, onReady }: { store: BarStore; bg: string; onReady: () => void }) {
  const { gl, scene, camera } = useThree();
  const bar = useMemo(() => new Bar(), []);
  const frames = useRef(0);

  useEffect(() => {
    const env = studioEnvironment(gl);
    scene.environment = env;
    return () => {
      env.dispose();
      scene.environment = null;
    };
  }, [gl, scene]);

  useEffect(() => {
    // The canvas paints the page colour itself (glass and gems refract what's behind them)
    scene.background = new THREE.Color(bg);
  }, [bg, scene]);

  useFrame(() => {
    bar.update(store, camera as THREE.PerspectiveCamera);
    frames.current += 1;
    if (frames.current === 2) onReady();
  });

  return <primitive object={bar.root} />;
}

export default function CocktailScene({
  store,
  active,
  bg,
  onReady,
}: {
  store: BarStore;
  active: boolean;
  bg: string;
  onReady: () => void;
}) {
  return (
    <Canvas
      className="wc-canvas"
      // away from the page it draws once (to compile everything) and then waits
      frameloop={active ? "always" : "demand"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 22, position: [0, 0, 16], near: 1, far: 60 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
        gl.toneMappingExposure = 1;
      }}
      aria-hidden
    >
      <BarScene store={store} bg={bg} onReady={onReady} />
    </Canvas>
  );
}
