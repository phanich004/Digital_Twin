import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Sky,
  Stars,
  Float,
  Text,
  Html,
  MeshTransmissionMaterial,
  Sparkles,
  useTexture,
} from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import {
  Users,
  Thermometer,
  Zap,
  Clock,
  TrendingUp,
  Building2,
  Layers,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { FloorConfig, RoomType, ViewMode } from '../types';
import { BUILDING_WIDTH, BUILDING_DEPTH, FLOOR_HEIGHT, ZONE_COLORS } from '../constants';
import { calculateEnvironment, calculateOccupancy, calculateEnergy } from '../services/simulationService';

// Animated gradient material for the building
const GlassMaterial: React.FC<{ opacity?: number }> = ({ opacity = 0.3 }) => (
  <meshPhysicalMaterial
    color="#60a5fa"
    transparent
    opacity={opacity}
    roughness={0.05}
    metalness={0.1}
    transmission={0.9}
    thickness={0.5}
    envMapIntensity={1}
  />
);

// Animated floor component with glow effects
const AnimatedFloor: React.FC<{
  level: number;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: () => void;
  rooms: any[];
  occupancyData: Record<string, number>;
  showZones: boolean;
  time: number;
}> = ({ level, isSelected, isDimmed, onClick, rooms, occupancyData, showZones, time }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth floating animation when selected
      const targetY = level * FLOOR_HEIGHT + (isSelected ? Math.sin(state.clock.elapsedTime * 2) * 0.1 : 0);
      const targetZ = isSelected ? BUILDING_DEPTH * 0.6 : 0;
      
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 4);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 3);
    }
  });

  const floorColor = useMemo(() => {
    if (isSelected) return '#06b6d4';
    if (hovered) return '#3b82f6';
    return '#e2e8f0';
  }, [isSelected, hovered]);

  return (
    <group
      ref={groupRef}
      position={[0, level * FLOOR_HEIGHT, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Floor Slab with edge glow */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[BUILDING_WIDTH, 0.3, BUILDING_DEPTH]} />
        <meshStandardMaterial
          color={floorColor}
          transparent
          opacity={isDimmed ? 0.2 : 1}
          emissive={isSelected ? '#06b6d4' : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
        />
      </mesh>

      {/* Glass facade */}
      {!isSelected && (
        <>
          {/* Front glass */}
          <mesh position={[0, FLOOR_HEIGHT / 2, BUILDING_DEPTH / 2 - 0.1]}>
            <boxGeometry args={[BUILDING_WIDTH - 0.5, FLOOR_HEIGHT - 0.5, 0.1]} />
            <GlassMaterial opacity={isDimmed ? 0.1 : 0.25} />
          </mesh>
          {/* Back glass */}
          <mesh position={[0, FLOOR_HEIGHT / 2, -BUILDING_DEPTH / 2 + 0.1]}>
            <boxGeometry args={[BUILDING_WIDTH - 0.5, FLOOR_HEIGHT - 0.5, 0.1]} />
            <GlassMaterial opacity={isDimmed ? 0.1 : 0.25} />
          </mesh>
          {/* Side glass */}
          <mesh position={[BUILDING_WIDTH / 2 - 0.1, FLOOR_HEIGHT / 2, 0]}>
            <boxGeometry args={[0.1, FLOOR_HEIGHT - 0.5, BUILDING_DEPTH - 0.5]} />
            <GlassMaterial opacity={isDimmed ? 0.1 : 0.25} />
          </mesh>
          <mesh position={[-BUILDING_WIDTH / 2 + 0.1, FLOOR_HEIGHT / 2, 0]}>
            <boxGeometry args={[0.1, FLOOR_HEIGHT - 0.5, BUILDING_DEPTH - 0.5]} />
            <GlassMaterial opacity={isDimmed ? 0.1 : 0.25} />
          </mesh>
        </>
      )}

      {/* Room zones when visible */}
      {(showZones || isSelected) && rooms.map((room: any) => {
        const count = occupancyData[room.id] || 0;
        const intensity = Math.min(1, count / 20);
        
        return (
          <group key={room.id}>
            {/* Zone highlight */}
            <mesh position={[room.x, 0.2, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[room.width - 0.5, room.depth - 0.5]} />
              <meshBasicMaterial
                color={ZONE_COLORS[room.type as RoomType]}
                transparent
                opacity={0.4 + intensity * 0.3}
              />
            </mesh>

            {/* People dots */}
            {Array.from({ length: Math.min(count, 15) }).map((_, i) => (
              <mesh
                key={i}
                position={[
                  room.x + (Math.random() - 0.5) * (room.width - 2),
                  0.8,
                  room.z + (Math.random() - 0.5) * (room.depth - 2),
                ]}
                castShadow
              >
                <capsuleGeometry args={[0.15, 0.6, 4, 8]} />
                <meshStandardMaterial
                  color="#ef4444"
                  emissive="#ef4444"
                  emissiveIntensity={0.3}
                />
              </mesh>
            ))}

            {/* Label when selected */}
            {isSelected && (
              <Html position={[room.x, 2, room.z]} center distanceFactor={15}>
                <div className="bg-slate-900/90 text-white text-xs px-3 py-2 rounded-lg backdrop-blur-sm border border-slate-700 whitespace-nowrap">
                  <div className="font-semibold">{room.label}</div>
                  <div className="text-cyan-400">{count} people</div>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Floor label */}
      <Html position={[-BUILDING_WIDTH / 2 - 2, FLOOR_HEIGHT / 2, 0]} center>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          isSelected
            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
            : 'bg-slate-800/80 text-slate-300'
        }`}>
          {level === 0 ? 'Ground' : `Floor ${level}`}
        </div>
      </Html>
    </group>
  );
};

// Parking level component
const ParkingLevel: React.FC<{ visible: boolean }> = ({ visible }) => {
  const carColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];
  
  const cars = useMemo(() => {
    const _cars = [];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 8; col++) {
        if (Math.random() > 0.35) {
          _cars.push({
            x: (col - 3.5) * 4,
            z: row === 0 ? -5 : 5,
            color: carColors[Math.floor(Math.random() * carColors.length)],
            rot: row === 0 ? Math.PI : 0,
          });
        }
      }
    }
    return _cars;
  }, []);

  if (!visible) return null;

  return (
    <group position={[0, -FLOOR_HEIGHT, 0]}>
      {/* Parking floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[BUILDING_WIDTH, BUILDING_DEPTH]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Parking lines */}
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[(i - 4) * 4, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.1, BUILDING_DEPTH - 4]} />
          <meshBasicMaterial color="#fcd34d" />
        </mesh>
      ))}

      {/* Cars */}
      {cars.map((car, i) => (
        <group key={i} position={[car.x, 0, car.z]} rotation={[0, car.rot, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[1.6, 0.5, 3.5]} />
            <meshStandardMaterial color={car.color} metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.8, -0.3]}>
            <boxGeometry args={[1.4, 0.4, 1.5]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Pillars */}
      {[-10, 0, 10].map(x => (
        <mesh key={x} position={[x, FLOOR_HEIGHT / 2, 0]} castShadow>
          <boxGeometry args={[0.8, FLOOR_HEIGHT, 0.8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      ))}
    </group>
  );
};

// Environment and lighting
const SceneLighting: React.FC<{ time: number }> = ({ time }) => {
  const isNight = time < 6 || time > 19;
  const sunAngle = ((time - 6) / 12) * Math.PI;
  const sunX = Math.cos(sunAngle) * 50;
  const sunY = Math.max(5, Math.sin(sunAngle) * 50);
  const intensity = isNight ? 0.1 : Math.max(0.3, Math.sin(sunAngle));

  return (
    <>
      <ambientLight intensity={isNight ? 0.2 : 0.5} color={isNight ? '#1e40af' : '#ffffff'} />
      <directionalLight
        position={[sunX, sunY, 20]}
        intensity={intensity * 1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color={time < 8 || time > 17 ? '#fcd34d' : '#ffffff'}
      >
        <orthographicCamera attach="shadow-camera" args={[-50, 50, 50, -50]} />
      </directionalLight>
      
      {isNight && (
        <>
          <pointLight position={[0, 15, 0]} intensity={0.8} color="#60a5fa" distance={40} />
          <pointLight position={[15, 10, 15]} intensity={0.5} color="#a78bfa" distance={30} />
        </>
      )}

      <Sky
        sunPosition={[sunX, sunY, 20]}
        turbidity={isNight ? 10 : 0.5}
        rayleigh={isNight ? 0.1 : 0.5}
        mieCoefficient={0.005}
      />
      
      {isNight && (
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      )}

      <Environment preset={isNight ? 'night' : 'city'} background={false} />
      <fog attach="fog" args={[isNight ? '#0f172a' : '#64748b', 80, 200]} />
    </>
  );
};

// Surrounding buildings
const SurroundingBuildings: React.FC = () => (
  <group>
    {/* Left building cluster */}
    <mesh position={[-55, 25, 0]} castShadow receiveShadow>
      <boxGeometry args={[25, 50, 25]} />
      <meshStandardMaterial color="#64748b" />
    </mesh>
    <mesh position={[-55, 35, -20]} castShadow receiveShadow>
      <boxGeometry args={[20, 70, 20]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>

    {/* Back buildings */}
    <mesh position={[0, 20, -55]} castShadow receiveShadow>
      <boxGeometry args={[40, 40, 15]} />
      <meshStandardMaterial color="#cbd5e1" />
    </mesh>
    <mesh position={[35, 30, -50]} castShadow receiveShadow>
      <boxGeometry args={[25, 60, 18]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>

    {/* Right building */}
    <mesh position={[55, 15, 10]} castShadow receiveShadow>
      <boxGeometry args={[20, 30, 35]} />
      <meshStandardMaterial color="#78716c" />
    </mesh>

    {/* Trees */}
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 45 + Math.random() * 15;
      return (
        <group key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
          <mesh position={[0, 2, 0]} castShadow>
            <coneGeometry args={[2, 6, 8]} />
            <meshStandardMaterial color="#059669" />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 1]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>
      );
    })}
  </group>
);

// Ground plane with grid
const Ground: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
    {/* Grid lines */}
    <gridHelper args={[200, 40, '#334155', '#1e293b']} position={[0, -0.49, 0]} />
  </group>
);

// Main 3D Overview component
const Overview3D: React.FC = () => {
  const [time, setTime] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [showParking, setShowParking] = useState(false);
  const [showZones, setShowZones] = useState(true);
  const [occupancyData, setOccupancyData] = useState<Record<string, number>>({});

  // Building floor configuration
  const floors: FloorConfig[] = useMemo(() => {
    const _floors: FloorConfig[] = [];
    
    _floors.push({
      level: 0,
      rooms: [
        { id: '0-lobby', type: RoomType.LOBBY, x: 0, z: 6, width: 35, depth: 8, label: 'Main Lobby' },
        { id: '0-core', type: RoomType.CORE, x: 0, z: -2, width: 8, depth: 6, label: 'Core' },
        { id: '0-cafe', type: RoomType.PANTRY, x: 12, z: -6, width: 12, depth: 8, label: 'Café' },
        { id: '0-conf', type: RoomType.MEETING, x: -12, z: -6, width: 12, depth: 8, label: 'Conference' },
      ],
    });

    for (let i = 1; i <= 4; i++) {
      _floors.push({
        level: i,
        rooms: [
          { id: `${i}-core`, type: RoomType.CORE, x: 0, z: 0, width: 6, depth: 6, label: 'Elevators' },
          { id: `${i}-office-w`, type: RoomType.OFFICE, x: -12, z: 0, width: 16, depth: 16, label: 'West Office' },
          { id: `${i}-office-e`, type: RoomType.OFFICE, x: 12, z: 0, width: 16, depth: 16, label: 'East Office' },
          { id: `${i}-meet`, type: RoomType.MEETING, x: 0, z: 7, width: 8, depth: 4, label: 'Meeting Room' },
          { id: `${i}-pantry`, type: RoomType.PANTRY, x: 0, z: -7, width: 8, depth: 4, label: 'Break Room' },
        ],
      });
    }

    return _floors;
  }, []);

  // Simulation update
  useEffect(() => {
    const updateSimulation = () => {
      const env = calculateEnvironment(time);
      const newOccupancy: Record<string, number> = {};
      
      floors.forEach(floor => {
        floor.rooms.forEach(room => {
          const area = room.width * room.depth;
          const maxCap = Math.floor(area / 4);
          newOccupancy[room.id] = calculateOccupancy(time, room.type, maxCap);
        });
      });
      
      setOccupancyData(newOccupancy);
    };

    updateSimulation();
  }, [time, floors]);

  // Time animation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTime(t => (t + 0.1) % 24);
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const totalOccupancy = Object.values(occupancyData).reduce((a, b) => a + b, 0);
  const env = calculateEnvironment(time);

  const formatTime = (t: number) => {
    const hours = Math.floor(t);
    const mins = Math.floor((t - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex">
      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas
          shadows
          camera={{ position: [60, 50, 60], fov: 45 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        >
          <SceneLighting time={time} />
          
          <group>
            {floors.map(floor => (
              <AnimatedFloor
                key={floor.level}
                level={floor.level}
                rooms={floor.rooms}
                isSelected={selectedFloor === floor.level}
                isDimmed={selectedFloor !== null && selectedFloor !== floor.level}
                onClick={() => setSelectedFloor(selectedFloor === floor.level ? null : floor.level)}
                occupancyData={occupancyData}
                showZones={showZones}
                time={time}
              />
            ))}
            
            <ParkingLevel visible={showParking} />
            <Ground />
            <SurroundingBuildings />
          </group>

          {/* Sparkles for atmosphere */}
          <Sparkles count={100} scale={100} size={2} speed={0.3} opacity={0.3} color="#60a5fa" />

          <OrbitControls
            makeDefault
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2.1}
            minDistance={30}
            maxDistance={150}
            target={[0, 10, 0]}
            enableDamping
            dampingFactor={0.05}
          />

          <EffectComposer disableNormalPass>
            <Bloom
              luminanceThreshold={0.9}
              luminanceSmoothing={0.9}
              intensity={0.5}
              mipmapBlur
            />
            <Vignette offset={0.3} darkness={0.5} />
          </EffectComposer>
        </Canvas>

        {/* Time Control Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-700">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 flex items-center justify-center text-cyan-400 transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-2xl font-mono font-bold text-white w-16">{formatTime(time)}</span>
          </div>
          
          <input
            type="range"
            min={0}
            max={24}
            step={0.1}
            value={time}
            onChange={e => setTime(parseFloat(e.target.value))}
            className="w-48 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          
          <button
            onClick={() => setTime(10)}
            className="w-10 h-10 rounded-xl bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Sidebar */}
      <div className="w-80 bg-slate-900/80 backdrop-blur-xl border-l border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            Building Overview
          </h2>
          <p className="text-sm text-slate-400 mt-1">Real-time digital twin</p>
        </div>

        {/* Stats */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs">Occupancy</span>
              </div>
              <div className="text-2xl font-bold text-white">{totalOccupancy}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Thermometer className="w-4 h-4" />
                <span className="text-xs">Temperature</span>
              </div>
              <div className="text-2xl font-bold text-white">{(env.temperature || 22).toFixed(1)}°C</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-xs">Energy</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {Math.round((env.solarRadiation || 0) / 10)} kW
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Layers className="w-4 h-4" />
                <span className="text-xs">Floors</span>
              </div>
              <div className="text-2xl font-bold text-white">{floors.length}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase">View Controls</h3>
            
            <button
              onClick={() => setShowZones(!showZones)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                showZones ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}
            >
              <span className="text-sm font-medium">Zone Visualization</span>
              {showZones ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowParking(!showParking)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                showParking ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}
            >
              <span className="text-sm font-medium">Parking Level</span>
              {showParking ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Floor Selection */}
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase">Floor Selection</h3>
            <div className="grid grid-cols-3 gap-2">
              {floors.map(floor => (
                <button
                  key={floor.level}
                  onClick={() => setSelectedFloor(selectedFloor === floor.level ? null : floor.level)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFloor === floor.level
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {floor.level === 0 ? 'G' : `F${floor.level}`}
                </button>
              ))}
            </div>
            {selectedFloor !== null && (
              <button
                onClick={() => setSelectedFloor(null)}
                className="w-full py-2 rounded-lg text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>

        {/* Environment */}
        <div className="mt-auto p-6 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Environment</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Humidity</span>
              <span className="text-white">{(env.humidity || 50).toFixed(0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Wind</span>
              <span className="text-white">{(env.windSpeed || 5).toFixed(1)} m/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Solar</span>
              <span className="text-white">{(env.solarRadiation || 0).toFixed(0)} W/m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <span className="text-emerald-400">Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview3D;

