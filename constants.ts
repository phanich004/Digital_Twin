import { RoomType } from './types';

export const BUILDING_WIDTH = 40;
export const BUILDING_DEPTH = 20;
export const FLOOR_HEIGHT = 4;
export const PARKING_LEVELS = 1;
export const OFFICE_LEVELS = 5;

export const COLOR_PALETTE = {
  glass: '#a5c9ca',
  glassOpacity: 0.3,
  floor: '#f1f5f9',
  wall: '#e2e8f0',
  highlight: '#3b82f6',
  selectedRoom: '#60a5fa',
  text: '#1e293b',
  people: '#ef4444', // Red tinted people
  furniture: '#94a3b8', // Gray furniture
};

export const ZONE_COLORS: Record<RoomType, string> = {
  [RoomType.OFFICE]: '#60a5fa', // Blue
  [RoomType.MEETING]: '#4ade80', // Green
  [RoomType.PANTRY]: '#fb923c', // Orange
  [RoomType.LOBBY]: '#c084fc', // Purple
  [RoomType.CORE]: '#94a3b8', // Slate
  [RoomType.PARKING]: '#334155', // Dark Slate
};

// Simulation Constants
export const WORK_START = 8;
export const WORK_END = 18;
export const LUNCH_START = 12;
export const LUNCH_END = 13;
