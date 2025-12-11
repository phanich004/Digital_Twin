import React, { useMemo, useState } from 'react';
import {
  Camera,
  Video,
  VideoOff,
  Maximize2,
  Grid3X3,
  LayoutGrid,
  ChevronRight,
  Circle,
  AlertTriangle,
  Clock,
  Filter,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
} from 'lucide-react';
import { getCameras, getCameraEvents, getCameraStats, Camera as CameraType, CameraEvent } from '../services/cctvService';

const CameraFeed: React.FC<{
  camera: CameraType;
  isSelected: boolean;
  onClick: () => void;
  isFullscreen?: boolean;
}> = ({ camera, isSelected, onClick, isFullscreen }) => {
  const isOnline = camera.status !== 'offline';
  
  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-cyan-500' : 'hover:ring-1 hover:ring-slate-600'
      } ${isFullscreen ? 'h-full' : 'aspect-video'}`}
    >
      {/* Mock video feed - in production this would be an actual video stream */}
      <div className={`w-full h-full ${isOnline ? 'bg-slate-800' : 'bg-slate-900'} flex items-center justify-center`}>
        {isOnline ? (
          <div className="relative w-full h-full">
            {/* Simulated camera view with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-900/80" />
            
            {/* Camera grid overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-slate-500" />
                ))}
              </div>
            </div>
            
            {/* Timestamp */}
            <div className="absolute bottom-2 left-2 text-xs font-mono text-white/70 bg-black/50 px-2 py-1 rounded">
              {new Date().toLocaleTimeString()}
            </div>
            
            {/* Camera name */}
            <div className="absolute top-2 left-2 text-xs font-semibold text-white bg-black/50 px-2 py-1 rounded">
              {camera.name}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <VideoOff className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <span className="text-xs text-slate-500">Offline</span>
          </div>
        )}
      </div>
      
      {/* Status indicator */}
      <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
        camera.status === 'recording' ? 'bg-red-500/20 text-red-400' :
        camera.status === 'motion_detected' ? 'bg-amber-500/20 text-amber-400' :
        camera.status === 'alert' ? 'bg-red-500/20 text-red-400 animate-pulse' :
        camera.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' :
        'bg-slate-500/20 text-slate-400'
      }`}>
        <Circle className="w-2 h-2 fill-current" />
        {camera.status === 'recording' ? 'REC' : camera.status.toUpperCase()}
      </div>
    </div>
  );
};

const CCTV: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'single' | 'quad'>('grid');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  
  const cameras = useMemo(() => getCameras(), []);
  const events = useMemo(() => getCameraEvents(), []);
  const stats = useMemo(() => getCameraStats(), []);
  
  const filteredCameras = useMemo(() => {
    if (floorFilter === 'all') return cameras;
    return cameras.filter(c => c.floor === floorFilter);
  }, [cameras, floorFilter]);

  const floors = useMemo(() => {
    const unique = [...new Set(cameras.map(c => c.floor))].sort((a, b) => a - b);
    return unique;
  }, [cameras]);

  return (
    <div className="h-full flex">
      {/* Main View */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">CCTV Monitoring</h1>
            <p className="text-sm text-slate-400">{stats.online} cameras online</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Floor Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Floor:</span>
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
              >
                <option value="all">All Floors</option>
                {floors.map(f => (
                  <option key={f} value={f}>{f === -1 ? 'Parking' : f === 0 ? 'Ground' : `Floor ${f}`}</option>
                ))}
              </select>
            </div>
            
            {/* View Mode */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('quad')}
                className={`p-2 rounded ${viewMode === 'quad' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('single')}
                className={`p-2 rounded ${viewMode === 'single' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Camera Grid */}
        <div className="flex-1 p-4 overflow-auto">
          {viewMode === 'single' && selectedCamera ? (
            <div className="h-full">
              <CameraFeed
                camera={selectedCamera}
                isSelected={true}
                onClick={() => {}}
                isFullscreen
              />
            </div>
          ) : (
            <div className={`grid gap-4 ${
              viewMode === 'quad' ? 'grid-cols-2 grid-rows-2 h-full' : 'grid-cols-3 xl:grid-cols-4'
            }`}>
              {(viewMode === 'quad' ? filteredCameras.slice(0, 4) : filteredCameras).map(camera => (
                <CameraFeed
                  key={camera.id}
                  camera={camera}
                  isSelected={selectedCamera?.id === camera.id}
                  onClick={() => setSelectedCamera(camera)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-slate-400">Online: {stats.online}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-slate-400">Offline: {stats.offline}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm text-slate-400">Motion: {stats.motionDetected}</span>
          </div>
          <div className="ml-auto text-xs text-slate-500">
            Recording: {Math.round(stats.recordingRate * 100)}% coverage
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 border-l border-slate-800 flex flex-col bg-slate-900/50">
        {/* Selected Camera Details */}
        {selectedCamera ? (
          <>
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{selectedCamera.name}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  selectedCamera.status === 'offline' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {selectedCamera.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-slate-400">{selectedCamera.location}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <Camera className="w-3 h-3" />
                <span className="capitalize">{selectedCamera.type}</span>
              </div>
            </div>

            {/* PTZ Controls */}
            {selectedCamera.features.ptz && (
              <div className="p-4 border-b border-slate-800">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">PTZ Controls</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div />
                  <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Move className="w-4 h-4 mx-auto rotate-180" />
                  </button>
                  <div />
                  <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Move className="w-4 h-4 mx-auto -rotate-90" />
                  </button>
                  <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <RotateCcw className="w-4 h-4 mx-auto" />
                  </button>
                  <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Move className="w-4 h-4 mx-auto rotate-90" />
                  </button>
                  <div />
                  <button className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Move className="w-4 h-4 mx-auto" />
                  </button>
                  <div />
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 flex items-center justify-center gap-1">
                    <ZoomIn className="w-4 h-4" /> Zoom In
                  </button>
                  <button className="flex-1 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 flex items-center justify-center gap-1">
                    <ZoomOut className="w-4 h-4" /> Zoom Out
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="p-4 border-b border-slate-800">
              <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Features</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCamera.features.audio && (
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">Audio</span>
                )}
                {selectedCamera.features.nightVision && (
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">Night Vision</span>
                )}
                {selectedCamera.features.motionDetection && (
                  <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">Motion Detection</span>
                )}
                {selectedCamera.features.analytics && (
                  <span className="px-2 py-1 bg-cyan-500/20 rounded text-xs text-cyan-400">AI Analytics</span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 border-b border-slate-800">
            <p className="text-sm text-slate-500 text-center py-8">Select a camera to view details</p>
          </div>
        )}

        {/* Recent Events */}
        <div className="flex-1 overflow-auto p-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3">Recent Events</h4>
          <div className="space-y-3">
            {events.slice(0, 10).map(event => (
              <div
                key={event.id}
                className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  {event.type === 'motion' && <Move className="w-3 h-3 text-amber-400" />}
                  {event.type === 'person' && <Video className="w-3 h-3 text-cyan-400" />}
                  {event.type === 'vehicle' && <Video className="w-3 h-3 text-violet-400" />}
                  <span className="text-xs font-semibold text-white capitalize">{event.type}</span>
                  <span className="text-xs text-slate-500 ml-auto">
                    {Math.round(event.confidence * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  {event.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CCTV;

