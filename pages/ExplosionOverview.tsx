import React, { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Users,
  Shield,
  Activity,
  Phone,
  Radio,
} from 'lucide-react';
import { generateIncident, buildingFloors, generateZones } from '../data/mockData';

// 3D Building with explosion visualization
const ExplosionBuilding: React.FC<{ affectedFloors: typeof buildingFloors }> = ({ affectedFloors }) => {
  return (
    <group>
      {affectedFloors.map((floor, idx) => {
        const isAffected = floor.affected;
        const severity = floor.severity || 0;
        
        return (
          <group key={floor.level} position={[0, floor.level * 4, 0]}>
            {/* Floor slab */}
            <mesh position={[0, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[30, 0.3, 20]} />
              <meshStandardMaterial
                color={isAffected ? new THREE.Color().lerpColors(
                  new THREE.Color('#475569'),
                  new THREE.Color('#ef4444'),
                  severity
                ) : '#475569'}
                emissive={isAffected ? '#ff0000' : '#000000'}
                emissiveIntensity={isAffected ? severity * 0.3 : 0}
              />
            </mesh>
            
            {/* Walls */}
            <mesh position={[0, 2, 10]} castShadow>
              <boxGeometry args={[30, 3.5, 0.2]} />
              <meshPhysicalMaterial
                color={isAffected ? '#fca5a5' : '#94a3b8'}
                transparent
                opacity={0.6}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[0, 2, -10]} castShadow>
              <boxGeometry args={[30, 3.5, 0.2]} />
              <meshPhysicalMaterial
                color={isAffected ? '#fca5a5' : '#94a3b8'}
                transparent
                opacity={0.6}
              />
            </mesh>
            
            {/* Affected zone indicator */}
            {isAffected && severity > 0.5 && (
              <group position={[8, 2, 0]}>
                <mesh>
                  <sphereGeometry args={[2, 16, 16]} />
                  <meshBasicMaterial
                    color="#ef4444"
                    transparent
                    opacity={0.3 + Math.sin(Date.now() * 0.005) * 0.1}
                  />
                </mesh>
                <Html center>
                  <div className="bg-red-500/90 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap animate-pulse">
                    IMPACT ZONE
                  </div>
                </Html>
              </group>
            )}
            
            {/* Floor label */}
            <Html position={[-16, 2, 0]}>
              <div className={`px-2 py-1 rounded text-xs font-mono whitespace-nowrap ${
                isAffected ? 'bg-red-500/80 text-white' : 'bg-slate-700/80 text-slate-300'
              }`}>
                {floor.name}
              </div>
            </Html>
          </group>
        );
      })}
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};

const ExplosionOverview: React.FC = () => {
  const incident = useMemo(() => generateIncident(), []);
  const zones = useMemo(() => generateZones(), []);
  const affectedZones = zones.filter(z => incident.affectedZones.includes(z.id));

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const timeSinceIncident = Math.floor((Date.now() - incident.timestamp.getTime()) / 1000 / 60);

  return (
    <div className="h-full flex">
      {/* 3D View */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [50, 40, 50], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[20, 30, 10]} intensity={1} castShadow />
          <pointLight position={[8, 10, 0]} intensity={2} color="#ef4444" distance={20} />
          
          <ExplosionBuilding affectedFloors={buildingFloors} />
          
          <OrbitControls makeDefault target={[0, 8, 0]} />
          <Environment preset="city" background={false} />
          <fog attach="fog" args={['#0f172a', 50, 150]} />
        </Canvas>
        
        {/* Overlay Alert */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
              </div>
              <div className="flex-1">
                <h2 className="text-red-400 font-bold text-lg">ACTIVE INCIDENT - {incident.type.toUpperCase()}</h2>
                <p className="text-red-300/80 text-sm">{incident.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-red-400">{timeSinceIncident}m</div>
                <div className="text-xs text-red-300/60">since detection</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xl rounded-xl p-4 border border-slate-700">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Impact Severity</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-xs text-slate-300">Critical (100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500" />
              <span className="text-xs text-slate-300">High (50-99%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span className="text-xs text-slate-300">Medium (20-49%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-500" />
              <span className="text-xs text-slate-300">Unaffected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Panel */}
      <div className="w-96 bg-slate-900/50 border-l border-slate-800 flex flex-col">
        {/* Incident Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              incident.status === 'active' ? 'bg-red-500/20 text-red-400' :
              incident.status === 'contained' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {incident.status}
            </span>
            <span className="text-xs text-slate-500 font-mono">{incident.id}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Time</span>
              </div>
              <div className="text-white font-semibold">{formatTime(incident.timestamp)}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs">Location</span>
              </div>
              <div className="text-white font-semibold text-sm">Floor 2, East</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs">Responders</span>
              </div>
              <div className="text-white font-semibold">{incident.responders}</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-xs">Severity</span>
              </div>
              <div className="text-red-400 font-bold uppercase">{incident.severity}</div>
            </div>
          </div>
        </div>

        {/* Affected Zones */}
        <div className="flex-1 overflow-auto p-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Affected Zones ({affectedZones.length})</h3>
          <div className="space-y-3">
            {affectedZones.map(zone => (
              <div key={zone.id} className="bg-slate-800/50 rounded-xl p-4 border border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">{zone.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    zone.status === 'alarm' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {zone.status.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div>Capacity: {zone.capacity}</div>
                  <div>Current: {zone.currentOccupancy}</div>
                  <div>Temp: {zone.temperature.toFixed(1)}°C</div>
                  <div>Humidity: {zone.humidity.toFixed(0)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-colors">
            <Phone className="w-4 h-4" />
            Emergency Contact
          </button>
          <button className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-semibold transition-colors">
            <Radio className="w-4 h-4" />
            Broadcast Alert
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplosionOverview;

