import React, { useMemo } from 'react';
import * as THREE from 'three';
import { BUILDING_WIDTH, BUILDING_DEPTH, FLOOR_HEIGHT } from '../../constants';

const Car: React.FC<{ position: [number, number, number], color: string, rotationY: number }> = ({ position, color, rotationY }) => (
  <group position={position} rotation={[0, rotationY, 0]}>
    <mesh position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1.8, 0.6, 4]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.7} />
    </mesh>
    <mesh position={[0, 1.0, -0.2]}>
      <boxGeometry args={[1.6, 0.5, 2]} />
      <meshStandardMaterial color="#cbd5e1" />
    </mesh>
    {/* Wheels */}
    <mesh position={[0.9, 0.3, 1.2]}>
      <cylinderGeometry args={[0.3, 0.3, 0.2]} rotation={[0,0,Math.PI/2]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
    <mesh position={[-0.9, 0.3, 1.2]}>
      <cylinderGeometry args={[0.3, 0.3, 0.2]} rotation={[0,0,Math.PI/2]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
    <mesh position={[0.9, 0.3, -1.2]}>
      <cylinderGeometry args={[0.3, 0.3, 0.2]} rotation={[0,0,Math.PI/2]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
    <mesh position={[-0.9, 0.3, -1.2]}>
      <cylinderGeometry args={[0.3, 0.3, 0.2]} rotation={[0,0,Math.PI/2]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
  </group>
);

const ParkingFloor: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  // Generate random cars
  const spots = useMemo(() => {
    const _spots = [];
    const rows = 2;
    const cols = 8;
    const spotWidth = 3.0;
    const aisleWidth = 8;

    for (let r = 0; r < rows; r++) {
       const zPos = r === 0 ? -6 : 6;
       const rot = r === 0 ? Math.PI : 0;
       
       for(let c = 0; c < cols; c++) {
           const xPos = (c - cols/2) * 3.5 + 1.75;
           const hasCar = Math.random() > 0.3;
           _spots.push({
               x: xPos,
               z: zPos,
               rot,
               hasCar,
               color: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#64748b'][Math.floor(Math.random()*5)]
           });
       }
    }
    return _spots;
  }, []);

  if (!isVisible) return null;

  return (
    <group position={[0, -FLOOR_HEIGHT, 0]}>
       {/* Floor */}
       <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow>
          <planeGeometry args={[BUILDING_WIDTH, BUILDING_DEPTH]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
       </mesh>
       
       {/* Walls (Concrete box for parking) */}
       <mesh position={[0, FLOOR_HEIGHT/2, -BUILDING_DEPTH/2]}>
         <boxGeometry args={[BUILDING_WIDTH, FLOOR_HEIGHT, 1]} />
         <meshStandardMaterial color="#475569" />
       </mesh>
       <mesh position={[0, FLOOR_HEIGHT/2, BUILDING_DEPTH/2]}>
         <boxGeometry args={[BUILDING_WIDTH, FLOOR_HEIGHT, 1]} />
         <meshStandardMaterial color="#475569" />
       </mesh>

       {/* Spots */}
       {spots.map((spot, i) => (
         <group key={i}>
            {/* Painted Lines */}
            <mesh position={[spot.x - 1.5, 0.02, spot.z]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[0.1, 5]} />
                <meshBasicMaterial color="#fcd34d" />
            </mesh>
            <mesh position={[spot.x + 1.5, 0.02, spot.z]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[0.1, 5]} />
                <meshBasicMaterial color="#fcd34d" />
            </mesh>
            
            {spot.hasCar && (
                <Car position={[spot.x, 0, spot.z]} rotationY={spot.rot} color={spot.color} />
            )}
         </group>
       ))}

       {/* Pillars */}
       <mesh position={[0, FLOOR_HEIGHT/2, 0]}>
          <boxGeometry args={[1, FLOOR_HEIGHT, 1]} />
          <meshStandardMaterial color="#64748b" />
       </mesh>
       <mesh position={[10, FLOOR_HEIGHT/2, 0]}>
          <boxGeometry args={[1, FLOOR_HEIGHT, 1]} />
          <meshStandardMaterial color="#64748b" />
       </mesh>
       <mesh position={[-10, FLOOR_HEIGHT/2, 0]}>
          <boxGeometry args={[1, FLOOR_HEIGHT, 1]} />
          <meshStandardMaterial color="#64748b" />
       </mesh>
    </group>
  );
};

export default ParkingFloor;
