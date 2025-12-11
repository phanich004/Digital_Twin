import { SimulationState, RoomType } from '../types';
import { WORK_START, WORK_END, LUNCH_START, LUNCH_END } from '../constants';

export const calculateEnvironment = (time: number): Partial<SimulationState> => {
  // Simple sinusoidal simulation based on time of day
  const normalizedTime = (time - 6) / 12; // 0 at 6am, 1 at 6pm roughly
  const sunIntensity = Math.max(0, Math.sin(normalizedTime * Math.PI));

  return {
    temperature: 15 + sunIntensity * 10 + (Math.random() * 2 - 1),
    humidity: 40 + (1 - sunIntensity) * 20,
    windSpeed: 5 + Math.random() * 10,
    solarRadiation: Math.max(0, sunIntensity * 800),
  };
};

export const calculateOccupancy = (time: number, roomType: RoomType, maxCapacity: number): number => {
  const isWeekend = false; // Simplified
  if (isWeekend) return 0;

  if (roomType === RoomType.PARKING) return 0; // We handle cars separately or static

  let occupancyFactor = 0;

  if (time >= WORK_START && time < WORK_END) {
    // Ramping up and down
    if (time < WORK_START + 1) occupancyFactor = (time - WORK_START);
    else if (time > WORK_END - 1) occupancyFactor = (WORK_END - time);
    else occupancyFactor = 1.0;
  }

  // Lunch redistribution
  if (time >= LUNCH_START && time < LUNCH_END) {
    if (roomType === RoomType.PANTRY || roomType === RoomType.LOBBY) {
      return Math.floor(maxCapacity * 0.8 * occupancyFactor);
    }
    if (roomType === RoomType.OFFICE) {
      return Math.floor(maxCapacity * 0.3 * occupancyFactor);
    }
  } else {
    // Normal work hours
    if (roomType === RoomType.PANTRY) return Math.floor(maxCapacity * 0.1 * occupancyFactor);
    if (roomType === RoomType.LOBBY) return Math.floor(maxCapacity * 0.1 * occupancyFactor);
    if (roomType === RoomType.OFFICE) return Math.floor(maxCapacity * 0.9 * occupancyFactor);
    if (roomType === RoomType.MEETING) return Math.floor(maxCapacity * 0.5 * occupancyFactor * (Math.random() > 0.5 ? 1 : 0)); // Random meetings
  }

  return Math.floor(maxCapacity * occupancyFactor * 0.1); // Fallback
};

export const calculateEnergy = (time: number, occupancy: number, temp: number): SimulationState['energyUsage'] => {
  const baseLoad = 100; // Standby
  const lighting = (time > 18 || time < 7) ? 200 : 500; // Lights on at night or day
  const hvac = Math.abs(22 - temp) * 50 + occupancy * 10;
  
  return {
    cooling: temp > 22 ? hvac : 0,
    heating: temp < 20 ? hvac : 0,
    lighting: lighting + occupancy * 5,
    equipment: baseLoad + occupancy * 20,
    hotWater: occupancy * 2,
  };
};