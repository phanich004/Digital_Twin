// Mock Data Layer for Smart Building Digital Twin Dashboard
// TODO: Replace with real-time data from IoT sensors and backend APIs

export interface Zone {
  id: string;
  name: string;
  floor: number;
  wing: string;
  type: 'office' | 'meeting' | 'lobby' | 'utility' | 'parking' | 'corridor';
  status: 'normal' | 'warning' | 'alarm' | 'offline';
  capacity: number;
  currentOccupancy: number;
  temperature: number;
  humidity: number;
  lastUpdated: Date;
}

export interface Incident {
  id: string;
  type: 'explosion' | 'fire' | 'gas_leak' | 'intrusion' | 'flood';
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  location: string;
  affectedZones: string[];
  status: 'active' | 'contained' | 'resolved';
  description: string;
  responders: number;
}

export interface ParkingSpot {
  id: string;
  level: string;
  row: string;
  number: number;
  status: 'occupied' | 'free' | 'reserved' | 'disabled';
  vehicleType?: 'car' | 'motorcycle' | 'ev';
  entryTime?: Date;
}

export interface ParkingArea {
  id: string;
  name: string;
  totalSpaces: number;
  occupiedSpaces: number;
  reservedSpaces: number;
  evCharging: number;
  evChargingInUse: number;
}

export interface PersonnelMovement {
  timestamp: Date;
  zoneId: string;
  zoneName: string;
  entering: number;
  leaving: number;
  current: number;
}

export interface ThermalReading {
  zoneId: string;
  zoneName: string;
  temperature: number;
  humidity: number;
  comfortIndex: 'comfortable' | 'slightly_warm' | 'too_hot' | 'too_cold' | 'slightly_cold';
  co2Level: number;
  airQuality: 'good' | 'moderate' | 'poor';
  lastUpdated: Date;
}

// Generate mock zones
export const generateZones = (): Zone[] => {
  const wings = ['North', 'South', 'East', 'West'];
  const types: Zone['type'][] = ['office', 'meeting', 'lobby', 'utility', 'corridor'];
  const statuses: Zone['status'][] = ['normal', 'normal', 'normal', 'normal', 'warning', 'alarm'];
  
  const zones: Zone[] = [];
  
  for (let floor = 0; floor <= 4; floor++) {
    wings.forEach((wing, wingIndex) => {
      const numRooms = floor === 0 ? 2 : 4;
      for (let room = 1; room <= numRooms; room++) {
        const type = floor === 0 ? (room === 1 ? 'lobby' : 'utility') : types[Math.floor(Math.random() * 3)];
        zones.push({
          id: `F${floor}-${wing[0]}-${room}`,
          name: `${wing} Wing ${floor === 0 ? 'Ground' : `Floor ${floor}`} - Room ${room}`,
          floor,
          wing,
          type,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          capacity: type === 'office' ? 30 : type === 'meeting' ? 12 : 50,
          currentOccupancy: Math.floor(Math.random() * 25),
          temperature: 20 + Math.random() * 6,
          humidity: 40 + Math.random() * 25,
          lastUpdated: new Date(),
        });
      }
    });
  }
  
  return zones;
};

// Generate mock incident
export const generateIncident = (): Incident => ({
  id: 'INC-2024-001',
  type: 'explosion',
  severity: 'critical',
  timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
  location: 'Building A - Level 2 - East Wing',
  affectedZones: ['F2-E-1', 'F2-E-2', 'F2-E-3', 'F1-E-1', 'F3-E-1'],
  status: 'contained',
  description: 'Electrical panel explosion detected in server room. Fire suppression activated.',
  responders: 12,
});

// Generate parking spots
export const generateParkingSpots = (): ParkingSpot[] => {
  const spots: ParkingSpot[] = [];
  const levels = ['B1', 'B2'];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  levels.forEach(level => {
    rows.forEach(row => {
      for (let num = 1; num <= 10; num++) {
        const rand = Math.random();
        spots.push({
          id: `${level}-${row}-${num}`,
          level,
          row,
          number: num,
          status: rand < 0.65 ? 'occupied' : rand < 0.85 ? 'free' : rand < 0.95 ? 'reserved' : 'disabled',
          vehicleType: rand < 0.65 ? (Math.random() > 0.1 ? 'car' : 'ev') : undefined,
          entryTime: rand < 0.65 ? new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 8) : undefined,
        });
      }
    });
  });
  
  return spots;
};

export const generateParkingAreas = (): ParkingArea[] => [
  {
    id: 'B1',
    name: 'Basement Level 1',
    totalSpaces: 60,
    occupiedSpaces: 42,
    reservedSpaces: 8,
    evCharging: 10,
    evChargingInUse: 6,
  },
  {
    id: 'B2',
    name: 'Basement Level 2',
    totalSpaces: 60,
    occupiedSpaces: 35,
    reservedSpaces: 5,
    evCharging: 8,
    evChargingInUse: 4,
  },
];

// Generate personnel movement data
export const generatePersonnelMovement = (): PersonnelMovement[] => {
  const data: PersonnelMovement[] = [];
  const zones = ['Main Lobby', 'North Office', 'South Office', 'Cafeteria', 'Meeting Hub'];
  
  for (let i = 24; i >= 0; i--) {
    const time = new Date(Date.now() - i * 1000 * 60 * 30); // 30 min intervals
    const hour = time.getHours();
    
    zones.forEach((zone, idx) => {
      const isWorkHours = hour >= 8 && hour <= 18;
      const isLunch = hour >= 12 && hour <= 13;
      
      let baseOccupancy = isWorkHours ? 20 + Math.random() * 30 : 5;
      if (zone === 'Cafeteria' && isLunch) baseOccupancy *= 3;
      if (zone === 'Main Lobby' && (hour === 8 || hour === 9 || hour === 17 || hour === 18)) baseOccupancy *= 2;
      
      data.push({
        timestamp: time,
        zoneId: `zone-${idx}`,
        zoneName: zone,
        entering: Math.floor(Math.random() * 10),
        leaving: Math.floor(Math.random() * 8),
        current: Math.floor(baseOccupancy),
      });
    });
  }
  
  return data;
};

// Generate thermal readings
export const generateThermalReadings = (): ThermalReading[] => {
  const zones = [
    { id: 'lobby', name: 'Main Lobby' },
    { id: 'office-n', name: 'North Office Wing' },
    { id: 'office-s', name: 'South Office Wing' },
    { id: 'meeting', name: 'Conference Center' },
    { id: 'server', name: 'Server Room' },
    { id: 'cafeteria', name: 'Cafeteria' },
    { id: 'exec', name: 'Executive Suite' },
  ];
  
  return zones.map(zone => {
    const temp = 18 + Math.random() * 10;
    const humidity = 35 + Math.random() * 35;
    
    let comfortIndex: ThermalReading['comfortIndex'];
    if (temp < 18) comfortIndex = 'too_cold';
    else if (temp < 20) comfortIndex = 'slightly_cold';
    else if (temp <= 24) comfortIndex = 'comfortable';
    else if (temp <= 26) comfortIndex = 'slightly_warm';
    else comfortIndex = 'too_hot';
    
    return {
      zoneId: zone.id,
      zoneName: zone.name,
      temperature: temp,
      humidity,
      comfortIndex,
      co2Level: 400 + Math.random() * 600,
      airQuality: Math.random() > 0.2 ? 'good' : Math.random() > 0.5 ? 'moderate' : 'poor',
      lastUpdated: new Date(),
    };
  });
};

// Time series data for charts
export const generateTimeSeriesData = (hours: number = 24) => {
  const data = [];
  for (let i = hours; i >= 0; i--) {
    const time = new Date(Date.now() - i * 1000 * 60 * 60);
    const hour = time.getHours();
    const isWorkHours = hour >= 8 && hour <= 18;
    
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: time,
      occupancy: isWorkHours ? 150 + Math.random() * 100 : 20 + Math.random() * 30,
      temperature: 21 + Math.sin(hour / 24 * Math.PI * 2) * 3 + Math.random(),
      humidity: 50 + Math.cos(hour / 24 * Math.PI * 2) * 10 + Math.random() * 5,
      energy: isWorkHours ? 800 + Math.random() * 400 : 200 + Math.random() * 100,
    });
  }
  return data;
};

// Building 3D data for explosion visualization
export const buildingFloors = [
  { level: 0, name: 'Ground Floor', zones: 8, affected: false },
  { level: 1, name: 'Floor 1', zones: 16, affected: true, severity: 0.3 },
  { level: 2, name: 'Floor 2', zones: 16, affected: true, severity: 1.0 },
  { level: 3, name: 'Floor 3', zones: 16, affected: true, severity: 0.5 },
  { level: 4, name: 'Floor 4', zones: 12, affected: false },
];

