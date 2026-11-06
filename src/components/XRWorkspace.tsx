"use client";

import { Canvas } from "@react-three/fiber";
import { VRButton, XR, Controllers, Hands } from "@react-three/xr";
import { Text, OrbitControls } from "@react-three/drei";
import { useState } from "react";

function SpatialPanel({
  position,
  title,
  content,
  color,
}: {
  position: [number, number, number];
  title: string;
  content: string;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <group position={position}>
      {/* Panel Background Mesh */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setActive(!active)}
        scale={active ? 1.05 : 1}
      >
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial
          color={hovered ? "#1e293b" : "#0f172a"}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Header Accent Bar */}
      <mesh position={[0, 0.38, 0.01]}>
        <planeGeometry args={[1.2, 0.04]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Panel Title */}
      <Text
        position={[-0.5, 0.28, 0.02]}
        fontSize={0.06}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
      >
        {title}
      </Text>

      {/* Panel Content Body */}
      <Text
        position={[-0.5, 0.05, 0.02]}
        fontSize={0.04}
        maxWidth={1.0}
        lineHeight={1.3}
        color="#94a3b8"
        anchorX="left"
        anchorY="top"
      >
        {content}
      </Text>

      {/* Status Pill */}
      <mesh position={[0.4, 0.28, 0.02]}>
        <planeGeometry args={[0.25, 0.08]} />
        <meshBasicMaterial color={active ? "#10b981" : "#334155"} />
      </mesh>
      <Text
        position={[0.4, 0.28, 0.03]}
        fontSize={0.03}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {active ? "ACTIVE" : "READY"}
      </Text>
    </group>
  );
}

export default function XRWorkspace() {
  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col items-center justify-center">
      {/* Top Header */}
      <header className="absolute top-6 left-6 z-10 flex items-center gap-3 bg-slate-900/80 backdrop-blur border border-slate-800 px-5 py-3 rounded-2xl text-white">
        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
        <div>
          <h1 className="text-sm font-bold tracking-wide">SpatialAgent OS</h1>
          <p className="text-xs text-slate-400">Meta VR Seated-First WebXR Architecture</p>
        </div>
      </header>

      {/* Official WebXR Enter VR Button */}
      <VRButton className="!absolute !bottom-8 !z-20 !px-6 !py-3 !bg-blue-600 !hover:bg-blue-500 !text-white !font-semibold !rounded-xl !shadow-lg !transition-all" />

      {/* 3D WebXR Canvas */}
      <Canvas
        camera={{ position: [0, 1.2, 1.5], fov: 60 }}
        className="w-full h-full"
      >
        <XR>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 5]} intensity={1.5} />
          <pointLight position={[0, 2, 0]} intensity={1} color="#38bdf8" />

          {/* Hands & Controllers Tracking */}
          <Controllers />
          <Hands />

          {/* Orbit Controls for Desktop testing */}
          <OrbitControls target={[0, 1.2, 0]} />

          {/* Left Panel */}
          <SpatialPanel
            position={[-0.9, 1.2, -0.6]}
            title="AI Agentic Pipeline"
            content="Task: Live Knowledge Retrieval & Synthesis&#10;Latency: 120ms&#10;Model: Gemini 2.5 Flash&#10;Status: Monitoring context stream..."
            color="#38bdf8"
          />

          {/* Center Panel */}
          <SpatialPanel
            position={[0, 1.2, -0.7]}
            title="Executive Workspace"
            content="• Touch or pinch panels to toggle focus.&#10;• Designed for seated 2-ft operational envelope.&#10;• Hands-first native: zero controller requirement."
            color="#a855f7"
          />

          {/* Right Panel */}
          <SpatialPanel
            position={[0.9, 1.2, -0.6]}
            title="System Diagnostics"
            content="WebXR API: Hand Tracking Active&#10;FPS: 90 Hz Locked&#10;Target: Meta Quest 3 / Pro Emulation"
            color="#22c55e"
          />

          {/* Spatial Grid Floor Reference */}
          <gridHelper args={[10, 20, "#334155", "#1e293b"]} position={[0, 0, 0]} />
        </XR>
      </Canvas>
    </div>
  );
}