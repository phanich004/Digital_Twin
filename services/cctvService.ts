// CCTV Camera Service
// TODO: Integrate with actual CCTV/NVR systems (Milestone, Genetec, Hikvision, etc.)

export interface Camera {
  id: string;
  name: string;
  location: string;
  floor: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  type: 'dome' | 'bullet' | 'ptz' | 'fisheye';
  status: 'online' | 'offline' | 'recording' | 'motion_detected' | 'alert';
  streamUrl?: string;
  thumbnailUrl?: string;
  features: {
    ptz: boolean;
    audio: boolean;
    nightVision: boolean;
    motionDetection: boolean;
    analytics: boolean;
  };
  lastMotion?: Date;
  recordingStatus: 'recording' | 'scheduled' | 'stopped';
}

export interface CameraEvent {
  id: string;
  cameraId: string;
  type: 'motion' | 'person' | 'vehicle' | 'intrusion' | 'loitering' | 'line_cross';
  timestamp: Date;
  confidence: number;
  thumbnail?: string;
  metadata?: Record<string, any>;
}

export interface CameraZone {
  id: string;
  name: string;
  floor: number;
  cameras: string[];
}

// Mock camera data
const generateCameras = (): Camera[] => {
  const cameras: Camera[] = [];
  const floors = [0, 1, 2, 3, 4];
  const zones = ['lobby', 'north', 'south', 'east', 'west', 'elevator', 'stairs', 'parking'];
  
  floors.forEach(floor => {
    // Lobby/Entrance cameras
    if (floor === 0) {
      cameras.push({
        id: `cam-${floor}-lobby-1`,
        name: 'Main Entrance',
        location: 'Ground Floor - Main Lobby',
        floor,
        position: { x: 0, y: 3, z: 8 },
        rotation: { x: -0.3, y: 0, z: 0 },
        type: 'dome',
        status: 'recording',
        features: { ptz: true, audio: true, nightVision: true, motionDetection: true, analytics: true },
        recordingStatus: 'recording',
      });
      cameras.push({
        id: `cam-${floor}-lobby-2`,
        name: 'Reception Desk',
        location: 'Ground Floor - Reception',
        floor,
        position: { x: -10, y: 3, z: 5 },
        rotation: { x: -0.2, y: 0.5, z: 0 },
        type: 'dome',
        status: 'recording',
        features: { ptz: false, audio: true, nightVision: true, motionDetection: true, analytics: true },
        recordingStatus: 'recording',
      });
    }
    
    // Corridor cameras for each floor
    cameras.push({
      id: `cam-${floor}-corridor-n`,
      name: `Floor ${floor} North Corridor`,
      location: `Floor ${floor} - North Wing`,
      floor,
      position: { x: -15, y: 3, z: 0 },
      rotation: { x: 0, y: 1.57, z: 0 },
      type: 'bullet',
      status: Math.random() > 0.1 ? 'recording' : 'offline',
      features: { ptz: false, audio: false, nightVision: true, motionDetection: true, analytics: false },
      recordingStatus: 'recording',
    });
    
    cameras.push({
      id: `cam-${floor}-corridor-s`,
      name: `Floor ${floor} South Corridor`,
      location: `Floor ${floor} - South Wing`,
      floor,
      position: { x: 15, y: 3, z: 0 },
      rotation: { x: 0, y: -1.57, z: 0 },
      type: 'bullet',
      status: 'recording',
      features: { ptz: false, audio: false, nightVision: true, motionDetection: true, analytics: false },
      recordingStatus: 'recording',
    });
    
    // Elevator camera
    cameras.push({
      id: `cam-${floor}-elevator`,
      name: `Floor ${floor} Elevator`,
      location: `Floor ${floor} - Elevator Lobby`,
      floor,
      position: { x: 0, y: 3, z: 0 },
      rotation: { x: -0.5, y: 0, z: 0 },
      type: 'fisheye',
      status: 'recording',
      features: { ptz: false, audio: true, nightVision: true, motionDetection: true, analytics: true },
      recordingStatus: 'recording',
    });
  });
  
  // Parking cameras
  cameras.push({
    id: 'cam-parking-entry',
    name: 'Parking Entry',
    location: 'Basement - Vehicle Entry',
    floor: -1,
    position: { x: 0, y: 3, z: 10 },
    rotation: { x: -0.3, y: 3.14, z: 0 },
    type: 'bullet',
    status: 'recording',
    features: { ptz: false, audio: false, nightVision: true, motionDetection: true, analytics: true },
    recordingStatus: 'recording',
  });
  
  cameras.push({
    id: 'cam-parking-b1',
    name: 'Parking B1 Overview',
    location: 'Basement Level 1',
    floor: -1,
    position: { x: 0, y: 4, z: 0 },
    rotation: { x: -0.8, y: 0, z: 0 },
    type: 'ptz',
    status: 'recording',
    features: { ptz: true, audio: false, nightVision: true, motionDetection: true, analytics: true },
    recordingStatus: 'recording',
  });
  
  return cameras;
};

// Mock events
const generateCameraEvents = (): CameraEvent[] => {
  const events: CameraEvent[] = [];
  const eventTypes: CameraEvent['type'][] = ['motion', 'person', 'vehicle'];
  const cameras = generateCameras();
  
  for (let i = 0; i < 20; i++) {
    const camera = cameras[Math.floor(Math.random() * cameras.length)];
    events.push({
      id: `event-${i}`,
      cameraId: camera.id,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      timestamp: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24),
      confidence: 0.7 + Math.random() * 0.3,
    });
  }
  
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// In-memory store
let cameras = generateCameras();
let events = generateCameraEvents();

// API
export const getCameras = (): Camera[] => [...cameras];

export const getCameraById = (id: string): Camera | undefined => 
  cameras.find(c => c.id === id);

export const getCamerasByFloor = (floor: number): Camera[] =>
  cameras.filter(c => c.floor === floor);

export const getCameraEvents = (cameraId?: string): CameraEvent[] =>
  cameraId ? events.filter(e => e.cameraId === cameraId) : [...events];

export const getRecentEvents = (limit: number = 10): CameraEvent[] =>
  events.slice(0, limit);

export const getCameraStats = () => {
  const online = cameras.filter(c => c.status !== 'offline').length;
  const offline = cameras.filter(c => c.status === 'offline').length;
  const motionDetected = cameras.filter(c => c.status === 'motion_detected').length;
  const alerts = cameras.filter(c => c.status === 'alert').length;
  
  return {
    total: cameras.length,
    online,
    offline,
    motionDetected,
    alerts,
    recordingRate: online / cameras.length,
  };
};

// PTZ Controls (mock)
export const ptzControl = (cameraId: string, action: 'up' | 'down' | 'left' | 'right' | 'zoom_in' | 'zoom_out' | 'home'): boolean => {
  const camera = cameras.find(c => c.id === cameraId);
  if (!camera || !camera.features.ptz) return false;
  
  // TODO: Send actual PTZ commands to camera
  console.log(`PTZ Control: ${cameraId} - ${action}`);
  return true;
};

// Get stream URL (mock)
export const getStreamUrl = (cameraId: string): string => {
  // TODO: Return actual RTSP/HLS stream URL from NVR
  return `/api/cameras/${cameraId}/stream`;
};

// Camera positions for 3D visualization
export const getCameraPositions = () => {
  return cameras.map(c => ({
    id: c.id,
    name: c.name,
    floor: c.floor,
    position: c.position,
    rotation: c.rotation,
    status: c.status,
    type: c.type,
  }));
};

