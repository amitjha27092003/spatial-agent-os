"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Text, OrbitControls, Float } from "@react-three/drei";
import { useState, useRef, useEffect } from "react";
import * as THREE from "three";

interface TaskNode {
  id: number;
  label: string;
  status: "pending" | "processing" | "completed";
  progress: string;
}

const INITIAL_TASKS: TaskNode[] = [
  { id: 1, label: "Deconstruct Workspace Objectives", status: "completed", progress: "100%" },
  { id: 2, label: "Index Contextual Memory Nodes", status: "processing", progress: "64%" },
  { id: 3, label: "Synthesize Multi-Modal Insights", status: "pending", progress: "0%" },
  { id: 4, label: "Dispatch Spatial Artifacts", status: "pending", progress: "0%" },
];

const playSpatialChime = (freq = 440, duration = 0.12) => {
  if (typeof window === "undefined") return;
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch {
    // audio policy ignore
  }
};

function FloatingAgentCore({ isProcessing }: { isProcessing: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (isProcessing ? 3.0 : 0.8);
      meshRef.current.rotation.x += delta * (isProcessing ? 1.5 : 0.4);
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1} floatIntensity={1.2}>
      <mesh ref={meshRef} position={[0, 1.9, -0.9]}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial
          color={isProcessing ? "#22c55e" : "#38bdf8"}
          wireframe
          emissive={isProcessing ? "#16a34a" : "#0284c7"}
          emissiveIntensity={isProcessing ? 1.6 : 0.8}
        />
      </mesh>
      <Text
        position={[0, 2.15, -0.9]}
        fontSize={0.04}
        color={isProcessing ? "#4ade80" : "#38bdf8"}
        anchorX="center"
        anchorY="middle"
      >
        {isProcessing ? "AGENT: ACTIVE EXECUTION" : "AGENT: STANDBY (READY)"}
      </Text>
    </Float>
  );
}

function TaskCardMesh({
  task,
  position,
  onClick,
}: {
  task: TaskNode;
  position: [number, number, number];
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const statusColor =
    task.status === "completed"
      ? "#22c55e"
      : task.status === "processing"
      ? "#38bdf8"
      : "#64748b";

  return (
    <group position={position}>
      <mesh
        onPointerOver={() => {
          setHovered(true);
          playSpatialChime(620, 0.05);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          playSpatialChime(880, 0.15);
          onClick();
        }}
      >
        <planeGeometry args={[1.05, 0.11]} />
        <meshStandardMaterial
          color={hovered ? "#1e293b" : "#0f172a"}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      <mesh position={[-0.51, 0, 0.01]}>
        <planeGeometry args={[0.02, 0.11]} />
        <meshBasicMaterial color={statusColor} />
      </mesh>

      <Text
        position={[-0.47, 0, 0.02]}
        fontSize={0.034}
        color="#f1f5f9"
        anchorX="left"
        anchorY="middle"
      >
        {task.label}
      </Text>

      <Text
        position={[0.48, 0, 0.02]}
        fontSize={0.03}
        color={statusColor}
        anchorX="right"
        anchorY="middle"
      >
        {task.progress}
      </Text>
    </group>
  );
}

export default function XRWorkspace() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [tasks, setTasks] = useState<TaskNode[]>(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState<TaskNode | null>(null);
  const [activeModel, setActiveModel] = useState("Gemini 2.5 Flash");

  const triggerLiveAgentLoop = async () => {
    const nextState = !isProcessing;
    setIsProcessing(nextState);
    playSpatialChime(nextState ? 523.25 : 329.63, 0.18);

    if (nextState) {
      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ objective: "Optimize Seated WebXR Workflow" }),
        });
        const data = await res.json();
        if (data.tasks) {
          setTasks(data.tasks);
        }
        if (data.model) {
          setActiveModel(data.model);
        }
      } catch {
        // fallback
      }
    }
  };

  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.status === "processing") {
            const current = parseInt(t.progress, 10) || 0;
            if (current >= 100) {
              return { ...t, status: "completed", progress: "100%" };
            }
            return { ...t, progress: `${Math.min(100, current + 15)}%` };
          }
          if (t.status === "pending" && Math.random() > 0.4) {
            return { ...t, status: "processing", progress: "25%" };
          }
          return t;
        })
      );
    }, 1400);

    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col items-center justify-center select-none font-sans">
      <header className="absolute top-6 left-6 z-10 flex items-center gap-3 bg-slate-900/90 backdrop-blur border border-slate-800 px-5 py-3 rounded-2xl text-white shadow-xl">
        <div className={`w-3 h-3 rounded-full ${isProcessing ? "bg-emerald-400 animate-ping" : "bg-cyan-400"}`} />
        <div>
          <h1 className="text-sm font-bold tracking-wide">SpatialAgent OS</h1>
          <p className="text-xs text-slate-400">Meta VR Seated-First WebXR Architecture</p>
        </div>
      </header>

      <div className="absolute top-6 right-6 z-10 flex gap-2">
        <button
          onClick={triggerLiveAgentLoop}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase border transition-all cursor-pointer shadow-lg ${
            isProcessing
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/10"
              : "bg-slate-900 text-slate-300 border-slate-700 hover:border-cyan-500 hover:text-white"
          }`}
        >
          {isProcessing ? "● Agent Running" : "▶ Trigger AI Loop"}
        </button>
      </div>

      <div className="absolute bottom-8 z-10 bg-slate-900/80 backdrop-blur px-4 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
        <span>Airplane Seat Envelope: <span className="text-emerald-400 font-medium">Calibrated (2-ft Seated Radius)</span></span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-400 font-mono">Audio Haptics: Active</span>
      </div>

      <Canvas
        camera={{ position: [0, 1.25, 1.35], fov: 62 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <pointLight
          position={[0, 1.8, -0.6]}
          intensity={2.2}
          color={isProcessing ? "#4ade80" : "#38bdf8"}
        />

        <OrbitControls
          target={[0, 1.25, -0.8]}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />

        <FloatingAgentCore isProcessing={isProcessing} />

        <group position={[-1.18, 1.25, -0.72]} rotation={[0, 0.38, 0]}>
          <mesh>
            <planeGeometry args={[1.15, 0.78]} />
            <meshStandardMaterial color="#090d16" roughness={0.15} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.37, 0.01]}>
            <planeGeometry args={[1.15, 0.03]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
          <Text position={[-0.5, 0.28, 0.02]} fontSize={0.052} color="#ffffff" anchorX="left" anchorY="middle">
            Agentic Pipeline
          </Text>
          <Text position={[-0.5, 0.12, 0.02]} fontSize={0.033} color="#94a3b8" anchorX="left" anchorY="middle">
            • Mode: Autonomous Spatial Worker
          </Text>
          <Text position={[-0.5, 0.03, 0.02]} fontSize={0.033} color="#94a3b8" anchorX="left" anchorY="middle">
            • Engine: {activeModel}
          </Text>
          <Text position={[-0.5, -0.06, 0.02]} fontSize={0.033} color="#94a3b8" anchorX="left" anchorY="middle">
            • Context Cache: Synced (Sub-120ms)
          </Text>
          <Text position={[-0.5, -1.15, 0.02]} fontSize={0.033} color="#94a3b8" anchorX="left" anchorY="middle">
            • Execution: Hands-First Event Bus
          </Text>
        </group>

        <group position={[0, 1.25, -0.88]} rotation={[0, 0, 0]}>
          <mesh>
            <planeGeometry args={[1.2, 0.78]} />
            <meshStandardMaterial color="#0b0f19" roughness={0.15} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.37, 0.01]}>
            <planeGeometry args={[1.2, 0.03]} />
            <meshBasicMaterial color="#c084fc" />
          </mesh>
          <Text position={[-0.53, 0.28, 0.02]} fontSize={0.052} color="#ffffff" anchorX="left" anchorY="middle">
            Executive Task Matrix
          </Text>

          {tasks.map((task, idx) => (
            <TaskCardMesh
              key={task.id}
              task={task}
              position={[0, 0.12 - idx * 0.14, 0.02]}
              onClick={() => setSelectedTask(task)}
            />
          ))}
        </group>

        <group position={[1.18, 1.25, -0.72]} rotation={[0, -0.38, 0]}>
          <mesh>
            <planeGeometry args={[1.15, 0.78]} />
            <meshStandardMaterial color="#090d16" roughness={0.15} metalness={0.85} />
          </mesh>
          <mesh position={[0, 0.37, 0.01]}>
            <planeGeometry args={[1.15, 0.03]} />
            <meshBasicMaterial color="#4ade80" />
          </mesh>
          <Text position={[-0.5, 0.28, 0.02]} fontSize={0.052} color="#ffffff" anchorX="left" anchorY="middle">
            Inspector & Telemetry
          </Text>
          <Text position={[-0.5, 0.14, 0.02]} fontSize={0.034} color="#f8fafc" anchorX="left" anchorY="middle">
            Target Focus:
          </Text>
          <Text position={[-0.5, 0.05, 0.02]} fontSize={0.031} color="#38bdf8" maxWidth={0.95} anchorX="left" anchorY="middle">
            {selectedTask ? selectedTask.label : "Tap any task node in center panel"}
          </Text>
          <Text position={[-0.5, -0.06, 0.02]} fontSize={0.033} color="#94a3b8" anchorX="left" anchorY="middle">
            Status: {selectedTask ? selectedTask.status.toUpperCase() : "IDLE"}
          </Text>
          <Text position={[-0.5, -0.15, 0.02]} fontSize={0.033} color="#94a3b8" anchorX="left" anchorY="middle">
            Framerate: 90 Hz Locked (WebXR)
          </Text>
        </group>

        <gridHelper args={[12, 24, "#38bdf8", "#1e293b"]} position={[0, 0, 0]} />
      </Canvas>
    </div>
  );
}