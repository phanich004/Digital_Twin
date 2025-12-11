// Evacuation & Emergency Service
// Handles emergency modes, evacuation routes, and muster points

export type EmergencyType = 'fire' | 'earthquake' | 'gas_leak' | 'security' | 'medical' | 'drill';
export type EmergencyStatus = 'inactive' | 'active' | 'all_clear' | 'drill';

export interface EmergencyState {
  status: EmergencyStatus;
  type?: EmergencyType;
  activatedAt?: Date;
  activatedBy?: string;
  affectedZones: string[];
  evacuatedCount: number;
  totalOccupants: number;
  musterPoints: MusterPoint[];
}

export interface MusterPoint {
  id: string;
  name: string;
  location: string;
  position: { x: number; y: number; z: number };
  capacity: number;
  currentCount: number;
  status: 'open' | 'full' | 'closed';
}

export interface EvacuationRoute {
  id: string;
  name: string;
  fromZone: string;
  toMusterPoint: string;
  distance: number;
  estimatedTime: number; // seconds
  waypoints: { x: number; y: number; z: number }[];
  isAccessible: boolean;
  status: 'clear' | 'congested' | 'blocked';
}

export interface ExitPoint {
  id: string;
  name: string;
  floor: number;
  position: { x: number; y: number; z: number };
  type: 'main' | 'emergency' | 'stairs' | 'elevator';
  status: 'open' | 'locked' | 'blocked';
  capacity: number; // people per minute
}

// State
let emergencyState: EmergencyState = {
  status: 'inactive',
  affectedZones: [],
  evacuatedCount: 0,
  totalOccupants: 0,
  musterPoints: [
    {
      id: 'muster-a',
      name: 'Assembly Point A',
      location: 'North Parking Lot',
      position: { x: -60, y: 0, z: 30 },
      capacity: 200,
      currentCount: 0,
      status: 'open',
    },
    {
      id: 'muster-b',
      name: 'Assembly Point B',
      location: 'South Garden',
      position: { x: 60, y: 0, z: -30 },
      capacity: 150,
      currentCount: 0,
      status: 'open',
    },
    {
      id: 'muster-c',
      name: 'Assembly Point C',
      location: 'Main Street Sidewalk',
      position: { x: 0, y: 0, z: 60 },
      capacity: 100,
      currentCount: 0,
      status: 'open',
    },
  ],
};

let emergencyListeners: ((state: EmergencyState) => void)[] = [];

// Exit points
const exitPoints: ExitPoint[] = [
  { id: 'exit-main', name: 'Main Entrance', floor: 0, position: { x: 0, y: 0, z: 10 }, type: 'main', status: 'open', capacity: 60 },
  { id: 'exit-north', name: 'North Exit', floor: 0, position: { x: -18, y: 0, z: 0 }, type: 'emergency', status: 'open', capacity: 40 },
  { id: 'exit-south', name: 'South Exit', floor: 0, position: { x: 18, y: 0, z: 0 }, type: 'emergency', status: 'open', capacity: 40 },
  { id: 'stairs-n', name: 'North Stairwell', floor: 0, position: { x: -16, y: 0, z: -8 }, type: 'stairs', status: 'open', capacity: 30 },
  { id: 'stairs-s', name: 'South Stairwell', floor: 0, position: { x: 16, y: 0, z: -8 }, type: 'stairs', status: 'open', capacity: 30 },
];

// Evacuation routes
const evacuationRoutes: EvacuationRoute[] = [
  {
    id: 'route-1',
    name: 'North Wing to Assembly A',
    fromZone: 'north-wing',
    toMusterPoint: 'muster-a',
    distance: 80,
    estimatedTime: 120,
    waypoints: [
      { x: -12, y: 0, z: 0 },
      { x: -18, y: 0, z: 0 },
      { x: -18, y: 0, z: 10 },
      { x: -40, y: 0, z: 20 },
      { x: -60, y: 0, z: 30 },
    ],
    isAccessible: true,
    status: 'clear',
  },
  {
    id: 'route-2',
    name: 'South Wing to Assembly B',
    fromZone: 'south-wing',
    toMusterPoint: 'muster-b',
    distance: 75,
    estimatedTime: 110,
    waypoints: [
      { x: 12, y: 0, z: 0 },
      { x: 18, y: 0, z: 0 },
      { x: 18, y: 0, z: -10 },
      { x: 40, y: 0, z: -20 },
      { x: 60, y: 0, z: -30 },
    ],
    isAccessible: true,
    status: 'clear',
  },
  {
    id: 'route-3',
    name: 'Main Lobby to Assembly C',
    fromZone: 'lobby',
    toMusterPoint: 'muster-c',
    distance: 50,
    estimatedTime: 60,
    waypoints: [
      { x: 0, y: 0, z: 6 },
      { x: 0, y: 0, z: 10 },
      { x: 0, y: 0, z: 30 },
      { x: 0, y: 0, z: 60 },
    ],
    isAccessible: true,
    status: 'clear',
  },
];

// API
export const getEmergencyState = (): EmergencyState => ({ ...emergencyState });

export const activateEmergency = (type: EmergencyType, activatedBy: string = 'System'): EmergencyState => {
  emergencyState = {
    ...emergencyState,
    status: type === 'drill' ? 'drill' : 'active',
    type,
    activatedAt: new Date(),
    activatedBy,
    affectedZones: getAllZoneIds(),
    evacuatedCount: 0,
    totalOccupants: getCurrentOccupancy(),
  };
  
  notifyListeners();
  
  // TODO: Trigger actual emergency systems
  // - Activate alarms
  // - Unlock emergency exits
  // - Notify emergency services
  // - Send mass notifications
  
  return emergencyState;
};

export const deactivateEmergency = (): EmergencyState => {
  emergencyState = {
    ...emergencyState,
    status: 'all_clear',
    affectedZones: [],
  };
  
  notifyListeners();
  return emergencyState;
};

export const resetEmergency = (): EmergencyState => {
  emergencyState = {
    status: 'inactive',
    affectedZones: [],
    evacuatedCount: 0,
    totalOccupants: 0,
    musterPoints: emergencyState.musterPoints.map(mp => ({ ...mp, currentCount: 0, status: 'open' as const })),
  };
  
  notifyListeners();
  return emergencyState;
};

export const updateMusterPointCount = (musterPointId: string, count: number): void => {
  const mp = emergencyState.musterPoints.find(m => m.id === musterPointId);
  if (mp) {
    mp.currentCount = count;
    mp.status = count >= mp.capacity ? 'full' : 'open';
    emergencyState.evacuatedCount = emergencyState.musterPoints.reduce((sum, m) => sum + m.currentCount, 0);
    notifyListeners();
  }
};

export const getExitPoints = (): ExitPoint[] => [...exitPoints];

export const getEvacuationRoutes = (): EvacuationRoute[] => [...evacuationRoutes];

export const getRouteToNearestExit = (position: { x: number; z: number }): EvacuationRoute | null => {
  // Find closest exit based on position
  let closestRoute = evacuationRoutes[0];
  let minDistance = Infinity;
  
  evacuationRoutes.forEach(route => {
    if (route.status !== 'blocked') {
      const firstWaypoint = route.waypoints[0];
      const distance = Math.sqrt(
        Math.pow(position.x - firstWaypoint.x, 2) + 
        Math.pow(position.z - firstWaypoint.z, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestRoute = route;
      }
    }
  });
  
  return closestRoute;
};

export const subscribeToEmergency = (listener: (state: EmergencyState) => void): (() => void) => {
  emergencyListeners.push(listener);
  listener(emergencyState);
  return () => {
    emergencyListeners = emergencyListeners.filter(l => l !== listener);
  };
};

const notifyListeners = (): void => {
  emergencyListeners.forEach(l => l({ ...emergencyState }));
};

// Helper functions (would connect to actual data in production)
const getAllZoneIds = (): string[] => {
  return ['lobby', 'north-wing', 'south-wing', 'east-wing', 'west-wing', 'parking'];
};

const getCurrentOccupancy = (): number => {
  return 247; // Mock value
};

// Get animation path for 3D visualization
export const getAnimatedEvacuationPaths = () => {
  return evacuationRoutes.map(route => ({
    id: route.id,
    points: route.waypoints,
    color: route.status === 'blocked' ? '#ef4444' : route.status === 'congested' ? '#f59e0b' : '#22c55e',
    animated: emergencyState.status === 'active' || emergencyState.status === 'drill',
  }));
};

// Emergency type configurations
export const getEmergencyConfig = (type: EmergencyType) => {
  const configs = {
    fire: {
      color: '#ef4444',
      icon: 'flame',
      sound: 'fire_alarm',
      message: 'FIRE EMERGENCY - Evacuate immediately via nearest exit',
      priority: 1,
    },
    earthquake: {
      color: '#f59e0b',
      icon: 'alert-triangle',
      sound: 'earthquake_alarm',
      message: 'EARTHQUAKE - Drop, Cover, Hold On. Then evacuate when safe.',
      priority: 1,
    },
    gas_leak: {
      color: '#8b5cf6',
      icon: 'cloud',
      sound: 'gas_alarm',
      message: 'GAS LEAK DETECTED - Evacuate immediately. Do not use elevators.',
      priority: 1,
    },
    security: {
      color: '#3b82f6',
      icon: 'shield-alert',
      sound: 'security_alarm',
      message: 'SECURITY ALERT - Follow lockdown procedures.',
      priority: 2,
    },
    medical: {
      color: '#10b981',
      icon: 'heart-pulse',
      sound: 'medical_alert',
      message: 'MEDICAL EMERGENCY - First responders en route.',
      priority: 3,
    },
    drill: {
      color: '#06b6d4',
      icon: 'info',
      sound: 'drill_tone',
      message: 'THIS IS A DRILL - Please evacuate as instructed.',
      priority: 4,
    },
  };
  return configs[type];
};

