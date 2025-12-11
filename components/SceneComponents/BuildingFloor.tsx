import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { FloorConfig, RoomType, ViewMode } from '../../types';
import { BUILDING_WIDTH, BUILDING_DEPTH, FLOOR_HEIGHT, COLOR_PALETTE, ZONE_COLORS } from '../../constants';

interface BuildingFloorProps {
  config: FloorConfig;
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: (level: number) => void;
  viewMode: ViewMode;
  time: number;
  occupancyData: Record<string, number>;
  showZones: boolean;
}

const Furniture: React.FC<{ type: RoomType; x: number; z: number; w: number; d: number }> = ({ type, x, z, w, d }) => {
  // Simple procedural furniture generation based on room type
  const items = useMemo(() => {
    const _items: React.ReactNode[] = [];
    if (type === RoomType.OFFICE) {
      // Create grid of desks
      const rows = Math.floor(d / 3);
      const cols = Math.floor(w / 3);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
           _items.push(
             <group key={`desk-${i}-${j}`} position={[x - w/2 + 1.5 + j*3, 0, z - d/2 + 1.5 + i*3]}>
               <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                 <boxGeometry args={[1.8, 0.8, 0.8]} />
                 <meshStandardMaterial color={COLOR_PALETTE.furniture} />
               </mesh>
               <mesh position={[0, 0.5, -0.3]}>
                 <boxGeometry args={[0.5, 0.5, 0.05]} />
                 <meshStandardMaterial color="#1e293b" />
               </mesh>
             </group>
           );
        }
      }
    } else if (type === RoomType.MEETING) {
      // Big table
      _items.push(
        <group key="mtg-table" position={[x, 0, z]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[w * 0.6, 0.8, d * 0.4]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        </group>
      );
    }
    return _items;
  }, [type, x, z, w, d]);

  return <>{items}</>;
};

const People: React.FC<{ count: number; x: number; z: number; w: number; d: number }> = ({ count, x, z, w, d }) => {
  // Generate random people positions
  const peoplePos = useMemo(() => {
    // Ensure count is a valid non-negative integer to prevent RangeError
    const safeCount = Math.floor(Math.max(0, count || 0));
    return new Array(safeCount).fill(0).map(() => ({
      rx: (Math.random() - 0.5) * (w - 1),
      rz: (Math.random() - 0.5) * (d - 1),
    }));
  }, [count, w, d]); // Re-roll positions when count changes significantly (handled by simulation update rate)

  return (
    <group position={[x, 0, z]}>
      {peoplePos.map((p, i) => (
        <mesh key={i} position={[p.rx, 0.9, p.rz]} castShadow>
          <capsuleGeometry args={[0.2, 1, 4, 8]} />
          <meshStandardMaterial color={COLOR_PALETTE.people} emissive="#7f1d1d" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  );
};

const BuildingFloor: React.FC<BuildingFloorProps> = ({
  config,
  isSelected,
  isDimmed,
  onSelect,
  viewMode,
  time,
  occupancyData,
  showZones
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Drawer animation logic
      const targetX = isSelected ? BUILDING_WIDTH * 0.6 : 0;
      // We pull out along the X axis (short side visual, actually length of building)
      // Actually, building is Width=40, Depth=20. Pulling along Z makes more sense for "Drawer".
      // Let's pull along Z (depth).
      const targetZ = isSelected ? BUILDING_DEPTH * 0.8 : 0;
      
      // Smooth lerp
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 3);
    }
  });

  const getMaterial = (transparent = false, color = COLOR_PALETTE.floor) => (
    <meshStandardMaterial
      color={color}
      transparent={transparent || (isDimmed && !isSelected)}
      opacity={isDimmed && !isSelected ? 0.1 : (transparent ? 0.4 : 1)}
      roughness={0.2}
      metalness={0.1}
    />
  );

  return (
    <group
      ref={groupRef}
      position={[0, config.level * FLOOR_HEIGHT, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(config.level);
      }}
    >
      {/* Floor Slab */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[BUILDING_WIDTH, 0.2, BUILDING_DEPTH]} />
        {getMaterial(false, '#e2e8f0')}
      </mesh>

      {/* Ceiling Slab (Top) */}
      <mesh position={[0, FLOOR_HEIGHT - 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[BUILDING_WIDTH, 0.2, BUILDING_DEPTH]} />
        {getMaterial(false, '#f8fafc')}
      </mesh>

      {/* External Glass Walls (Simple) - Only show if not selected to see inside better, or keep transparent */}
      {!isSelected && (
        <group>
           <mesh position={[0, FLOOR_HEIGHT/2, BUILDING_DEPTH/2]}>
             <boxGeometry args={[BUILDING_WIDTH, FLOOR_HEIGHT, 0.1]} />
             <meshPhysicalMaterial 
                color={COLOR_PALETTE.glass} 
                transparent 
                opacity={0.3} 
                roughness={0} 
                transmission={0.5} 
                thickness={0.5}
             />
           </mesh>
           <mesh position={[0, FLOOR_HEIGHT/2, -BUILDING_DEPTH/2]}>
             <boxGeometry args={[BUILDING_WIDTH, FLOOR_HEIGHT, 0.1]} />
             <meshPhysicalMaterial 
                color={COLOR_PALETTE.glass} 
                transparent 
                opacity={0.3} 
                roughness={0} 
                transmission={0.5} 
                thickness={0.5}
             />
           </mesh>
           <mesh position={[BUILDING_WIDTH/2, FLOOR_HEIGHT/2, 0]} rotation={[0, Math.PI/2, 0]}>
             <boxGeometry args={[BUILDING_DEPTH, FLOOR_HEIGHT, 0.1]} />
             <meshPhysicalMaterial 
                color={COLOR_PALETTE.glass} 
                transparent 
                opacity={0.3} 
                roughness={0} 
                transmission={0.5} 
                thickness={0.5}
             />
           </mesh>
           <mesh position={[-BUILDING_WIDTH/2, FLOOR_HEIGHT/2, 0]} rotation={[0, Math.PI/2, 0]}>
             <boxGeometry args={[BUILDING_DEPTH, FLOOR_HEIGHT, 0.1]} />
             <meshPhysicalMaterial 
                color={COLOR_PALETTE.glass} 
                transparent 
                opacity={0.3} 
                roughness={0} 
                transmission={0.5} 
                thickness={0.5}
             />
           </mesh>
        </group>
      )}

      {/* Rooms & Interior */}
      {config.rooms.map((room) => {
        const isHovered = hoveredRoom === room.id;
        const count = occupancyData[room.id] || 0;
        
        return (
          <group 
            key={room.id}
            onPointerOver={(e) => { e.stopPropagation(); setHoveredRoom(room.id); }}
            onPointerOut={() => setHoveredRoom(null)}
          >
            {/* Room Floor Highlight if selected/hovered */}
            {(isHovered || showZones) && (
               <mesh position={[room.x, 0.1, room.z]} rotation={[-Math.PI/2, 0, 0]}>
                 <planeGeometry args={[room.width - 0.2, room.depth - 0.2]} />
                 <meshBasicMaterial color={ZONE_COLORS[room.type]} transparent opacity={0.4} />
               </mesh>
            )}

            {/* Partitions (Walls) */}
            {/* Visual simplification: Just corners or faint lines, or simple boxes */}
            
            {/* Furniture */}
            {viewMode !== ViewMode.HEATMAP && (
              <Furniture type={room.type} x={room.x} z={room.z} w={room.width} d={room.depth} />
            )}

            {/* People */}
            {config.level >= 0 && (
              <People count={count} x={room.x} z={room.z} w={room.width} d={room.depth} />
            )}

            {/* Heatmap Visualization */}
            {viewMode === ViewMode.HEATMAP && (
              <mesh position={[room.x, FLOOR_HEIGHT / 2, room.z]}>
                 <boxGeometry args={[room.width - 0.5, FLOOR_HEIGHT - 0.5, room.depth - 0.5]} />
                 {/* Color based on occupancy/time simulation logic roughly */}
                 <meshBasicMaterial 
                    color={new THREE.Color().setHSL(0.6 - (count/20)*0.6, 1, 0.5)} 
                    transparent 
                    opacity={0.3} 
                    depthWrite={false}
                 />
              </mesh>
            )}

            {/* Labels when extracted */}
            {isSelected && (
              <Html position={[room.x, 2, room.z]} center distanceFactor={10}>
                <div className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm whitespace-nowrap pointer-events-none">
                  {room.label}
                  {viewMode === ViewMode.PEOPLE && <div className="font-bold text-red-400">{count} ppl</div>}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

export default BuildingFloor;