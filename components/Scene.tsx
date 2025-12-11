import React, { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Stars, BakeShadows, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { FloorConfig, RoomType, ViewMode } from '../types';
import BuildingFloor from './SceneComponents/BuildingFloor';
import ParkingFloor from './SceneComponents/ParkingFloor';
import { BUILDING_DEPTH, BUILDING_WIDTH } from '../constants';

interface SceneProps {
  floors: FloorConfig[];
  viewMode: ViewMode;
  time: number;
  occupancyData: Record<string, number>;
  selectedFloor: number | null;
  onSelectFloor: (level: number) => void;
  showParking: boolean;
  showZones: boolean;
}

const Lighting: React.FC<{ time: number }> = ({ time }) => {
  // Sun movement logic
  // Time 0-24. Sun rises at 6, sets at 18 roughly.
  // Angle changes from -PI to PI
  const sunAngle = ((time - 6) / 12) * Math.PI; // 0 at 6am, PI at 6pm
  const isNight = time < 5 || time > 19;
  
  const sunX = Math.cos(sunAngle) * 50;
  const sunY = Math.sin(sunAngle) * 50;
  
  // Emulate moon/night light
  const intensity = isNight ? 0 : Math.max(0, Math.sin(sunAngle) * 1.5);
  const ambientIntensity = isNight ? 0.3 : 0.6;

  return (
    <>
      <ambientLight intensity={ambientIntensity} color={isNight ? "#1e293b" : "#ffffff"} />
      <directionalLight
        position={[sunX, Math.max(5, sunY), 20]} // Offset Z to give depth shadows
        intensity={intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        color={time < 8 || time > 16 ? "#fdba74" : "#ffffff"} // Golden hour tint
      >
        <orthographicCamera attach="shadow-camera" args={[-40, 40, 40, -40]} />
      </directionalLight>
      {isNight && (
         <pointLight position={[10, 20, 10]} intensity={0.5} color="#60a5fa" distance={50} />
      )}
      <Sky sunPosition={[sunX, sunY, 20]} turbidity={0.5} rayleigh={isNight ? 0.1 : 0.5} mieCoefficient={0.005} />
      {isNight && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
      <Environment preset={isNight ? "city" : "apartment"} background={false} />
    </>
  );
};

const CameraHandler: React.FC<{ selectedFloor: number | null }> = ({ selectedFloor }) => {
    const { camera, controls } = useThree() as any;
    
    useEffect(() => {
        if (controls && selectedFloor !== null) {
            // controls.target.set(0, selectedFloor * 4, 0);
            // Don't force move camera aggressively, just update target slightly maybe?
            // Actually, for "Drawer" mode, standard orbit is fine.
        }
    }, [selectedFloor, controls]);
    return null;
}

const Scene: React.FC<SceneProps> = ({ 
    floors, 
    viewMode, 
    time, 
    occupancyData, 
    selectedFloor, 
    onSelectFloor,
    showParking,
    showZones
}) => {
  return (
    <Canvas shadows camera={{ position: [40, 40, 40], fov: 45 }} gl={{ antialias: true, toneMapping: THREE.ReinhardToneMapping, toneMappingExposure: 1.2 }}>
      <Lighting time={time} />
      
      <group position={[0, 0, 0]}>
        {/* Main Building Floors */}
        {floors.map((floor) => (
          <BuildingFloor
            key={floor.level}
            config={floor}
            isSelected={selectedFloor === floor.level}
            isDimmed={selectedFloor !== null && selectedFloor !== floor.level}
            onSelect={onSelectFloor}
            viewMode={viewMode}
            time={time}
            occupancyData={occupancyData}
            showZones={showZones}
          />
        ))}
        
        {/* Ground Plane (Hide if parking is main focus, or keep transparent) */}
        {!showParking && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
             <planeGeometry args={[200, 200]} />
             <meshStandardMaterial color="#334155" />
          </mesh>
        )}

        <ParkingFloor isVisible={showParking} />

        {/* Surrounding Context (Simple Low Poly) */}
        <group>
           {/* Left Building */}
           <mesh position={[-50, 20, 0]} receiveShadow castShadow>
             <boxGeometry args={[30, 40, 30]} />
             <meshStandardMaterial color="#94a3b8" />
           </mesh>
           {/* Back Building */}
           <mesh position={[0, 30, -50]} receiveShadow castShadow>
             <boxGeometry args={[40, 60, 20]} />
             <meshStandardMaterial color="#cbd5e1" />
           </mesh>
           {/* Trees/Environment placeholders */}
           {[...Array(5)].map((_, i) => (
              <mesh key={i} position={[30 + Math.random()*20, 2, 20 + Math.random()*20]} castShadow>
                  <coneGeometry args={[2, 6, 8]} />
                  <meshStandardMaterial color="#059669" />
              </mesh>
           ))}
        </group>
      </group>

      <CameraHandler selectedFloor={selectedFloor} />
      
      <OrbitControls 
        makeDefault 
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2.1} // Prevent going under ground
        maxDistance={150}
        target={[0, 10, 0]}
      />
      
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={1} mipmapBlur intensity={0.5} radius={0.4} />
      </EffectComposer>
      
      <BakeShadows />
    </Canvas>
  );
};

export default Scene;
