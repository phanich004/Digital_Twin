import React from 'react';

export enum ViewMode {
  DEFAULT = 'DEFAULT',
  HEATMAP = 'HEATMAP',
  PEOPLE = 'PEOPLE',
}

export enum RoomType {
  OFFICE = 'OFFICE',
  MEETING = 'MEETING',
  PANTRY = 'PANTRY',
  LOBBY = 'LOBBY',
  CORE = 'CORE',
  PARKING = 'PARKING',
}

export interface SimulationState {
  time: number; // 0 - 24
  temperature: number;
  humidity: number;
  windSpeed: number;
  solarRadiation: number;
  totalOccupancy: number;
  energyUsage: {
    cooling: number;
    heating: number;
    lighting: number;
    equipment: number;
    hotWater: number;
  };
}

export interface RoomConfig {
  id: string;
  type: RoomType;
  x: number;
  z: number;
  width: number;
  depth: number;
  label: string;
}

export interface FloorConfig {
  level: number;
  rooms: RoomConfig[];
  isParking?: boolean;
}

// Augment JSX namespace to support React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      boxGeometry: any;
      planeGeometry: any;
      cylinderGeometry: any;
      capsuleGeometry: any;
      coneGeometry: any;
      meshStandardMaterial: any;
      meshPhysicalMaterial: any;
      meshBasicMaterial: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
      orthographicCamera: any;
      primitive: any;
    }
  }
}
