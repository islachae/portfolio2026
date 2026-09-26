"use client";

import dynamic from "next/dynamic";

const ShaderGradientCanvas = dynamic(
  () => import("shadergradient").then((mod) => mod.ShaderGradientCanvas),
  { ssr: false }
);
const ShaderGradient = dynamic(
  () => import("shadergradient").then((mod) => mod.ShaderGradient),
  { ssr: false }
);

export default function ShaderHero() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <ShaderGradientCanvas style={{ position: "fixed", inset: 0 }} fov={50} pixelDensity={3}>
        <ShaderGradient
          type="waterPlane"
          animate="on"
          uTime={3.7}
          uSpeed={0.12}
          uStrength={1.3}
          uDensity={1.5}
          uFrequency={5.5}
          uAmplitude={1}
          positionX={-0.4}
          positionY={0.1}
          positionZ={0}
          rotationX={0}
          rotationY={10}
          rotationZ={50}
          color1="#ffffff"
          color2="#fdfafd"
          color3="#c19dff"
          reflection={0}
          wireframe={false}
          shader="defaults"
          cAzimuthAngle={181}
          cPolarAngle={84}
          cDistance={2.64}
          cameraZoom={1}
          lightType="3d"
          brightness={1}
          envPreset="city"
          grain="on"
          zoomOut={false}
          toggleAxis={false}
          enableTransition={false}
        />
      </ShaderGradientCanvas>
    </div>
  );
}