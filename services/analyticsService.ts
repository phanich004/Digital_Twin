// Analytics & Reporting Service
// Provides insights, trends, and predictive analytics

export interface AnalyticsData {
  occupancy: OccupancyAnalytics;
  energy: EnergyAnalytics;
  thermal: ThermalAnalytics;
  space: SpaceUtilization;
  predictions: Predictions;
}

export interface OccupancyAnalytics {
  currentTotal: number;
  peakToday: number;
  peakTime: string;
  averageDaily: number;
  weeklyTrend: number; // percentage change
  hourlyDistribution: { hour: number; count: number }[];
  zoneBreakdown: { zone: string; count: number; percentage: number }[];
  dwellTimes: { zone: string; avgMinutes: number }[];
}

export interface EnergyAnalytics {
  currentUsage: number; // kW
  todayTotal: number; // kWh
  monthTotal: number; // kWh
  yearTotal: number; // kWh
  costToday: number;
  costMonth: number;
  carbonFootprint: number; // kg CO2
  breakdown: { category: string; usage: number; percentage: number }[];
  hourlyUsage: { hour: number; usage: number }[];
  comparison: {
    vsYesterday: number;
    vsLastWeek: number;
    vsLastMonth: number;
  };
  peakDemand: number;
  peakTime: string;
}

export interface ThermalAnalytics {
  avgTemperature: number;
  avgHumidity: number;
  comfortScore: number; // 0-100
  zonesOutOfRange: number;
  hvacEfficiency: number;
  recommendations: string[];
}

export interface SpaceUtilization {
  overallUtilization: number; // percentage
  desksUsed: number;
  desksTotal: number;
  meetingRoomsBooked: number;
  meetingRoomsTotal: number;
  averageBookingDuration: number; // minutes
  noShowRate: number; // percentage
  peakMeetingTime: string;
  underutilizedSpaces: { name: string; utilization: number }[];
  recommendations: string[];
}

export interface Predictions {
  nextHourOccupancy: number;
  tomorrowPeakOccupancy: number;
  energyUsageTomorrow: number;
  maintenanceAlerts: MaintenanceAlert[];
  anomalies: Anomaly[];
}

export interface MaintenanceAlert {
  equipment: string;
  issue: string;
  probability: number;
  recommendedAction: string;
  dueDate: Date;
}

export interface Anomaly {
  type: string;
  zone: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  detectedAt: Date;
}

// Generate mock analytics data
export const generateAnalytics = (): AnalyticsData => {
  const hour = new Date().getHours();
  const isWorkHours = hour >= 8 && hour <= 18;
  
  return {
    occupancy: {
      currentTotal: isWorkHours ? 180 + Math.floor(Math.random() * 70) : 15 + Math.floor(Math.random() * 20),
      peakToday: 267,
      peakTime: '10:30 AM',
      averageDaily: 195,
      weeklyTrend: 5.2,
      hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: i >= 8 && i <= 18 ? 150 + Math.floor(Math.sin((i - 8) / 10 * Math.PI) * 100) : Math.floor(Math.random() * 20),
      })),
      zoneBreakdown: [
        { zone: 'North Office', count: 65, percentage: 28 },
        { zone: 'South Office', count: 58, percentage: 25 },
        { zone: 'Meeting Rooms', count: 32, percentage: 14 },
        { zone: 'Cafeteria', count: 28, percentage: 12 },
        { zone: 'Lobby', count: 24, percentage: 10 },
        { zone: 'Other', count: 26, percentage: 11 },
      ],
      dwellTimes: [
        { zone: 'Office Areas', avgMinutes: 245 },
        { zone: 'Meeting Rooms', avgMinutes: 48 },
        { zone: 'Cafeteria', avgMinutes: 32 },
        { zone: 'Lobby', avgMinutes: 8 },
      ],
    },
    energy: {
      currentUsage: 85 + Math.random() * 30,
      todayTotal: 1250,
      monthTotal: 38500,
      yearTotal: 425000,
      costToday: 187.50,
      costMonth: 5775,
      carbonFootprint: 18.2,
      breakdown: [
        { category: 'HVAC', usage: 45, percentage: 42 },
        { category: 'Lighting', usage: 22, percentage: 20 },
        { category: 'Equipment', usage: 28, percentage: 26 },
        { category: 'Other', usage: 13, percentage: 12 },
      ],
      hourlyUsage: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        usage: i >= 8 && i <= 18 ? 80 + Math.floor(Math.random() * 40) : 20 + Math.floor(Math.random() * 15),
      })),
      comparison: {
        vsYesterday: -3.2,
        vsLastWeek: 1.8,
        vsLastMonth: -5.5,
      },
      peakDemand: 142,
      peakTime: '2:30 PM',
    },
    thermal: {
      avgTemperature: 22.4,
      avgHumidity: 48,
      comfortScore: 85,
      zonesOutOfRange: 2,
      hvacEfficiency: 92,
      recommendations: [
        'Server Room cooling can be reduced during off-hours',
        'South-facing offices may benefit from automated blinds',
        'Cafeteria exhaust timing can be optimized',
      ],
    },
    space: {
      overallUtilization: 68,
      desksUsed: 156,
      desksTotal: 230,
      meetingRoomsBooked: 8,
      meetingRoomsTotal: 12,
      averageBookingDuration: 52,
      noShowRate: 18,
      peakMeetingTime: '10:00 AM - 11:00 AM',
      underutilizedSpaces: [
        { name: 'Conference Room D', utilization: 23 },
        { name: 'Quiet Zone 2', utilization: 31 },
        { name: 'Training Room', utilization: 35 },
      ],
      recommendations: [
        'Consider converting Conference Room D to hot-desking area',
        'Implement meeting room no-show policy',
        'Analyze if Training Room can be multi-purpose',
      ],
    },
    predictions: {
      nextHourOccupancy: isWorkHours ? 210 : 18,
      tomorrowPeakOccupancy: 275,
      energyUsageTomorrow: 1320,
      maintenanceAlerts: [
        {
          equipment: 'AHU-03',
          issue: 'Filter replacement due',
          probability: 0.95,
          recommendedAction: 'Schedule filter change within 7 days',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        },
        {
          equipment: 'Elevator 2',
          issue: 'Predicted motor bearing wear',
          probability: 0.72,
          recommendedAction: 'Inspection recommended within 30 days',
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
        },
      ],
      anomalies: [
        {
          type: 'Occupancy Pattern',
          zone: 'Server Room',
          description: 'Unusual access pattern detected outside maintenance schedule',
          severity: 'medium',
          detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
        {
          type: 'Energy Consumption',
          zone: 'Floor 3 East',
          description: 'Power consumption 23% higher than baseline',
          severity: 'low',
          detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        },
      ],
    },
  };
};

// Historical data queries
export interface HistoricalQuery {
  metric: 'occupancy' | 'energy' | 'temperature' | 'humidity';
  zone?: string;
  startDate: Date;
  endDate: Date;
  granularity: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

export interface HistoricalDataPoint {
  timestamp: Date;
  value: number;
  min?: number;
  max?: number;
  avg?: number;
}

export const queryHistoricalData = (query: HistoricalQuery): HistoricalDataPoint[] => {
  // TODO: Replace with actual database query
  const dataPoints: HistoricalDataPoint[] = [];
  const duration = query.endDate.getTime() - query.startDate.getTime();
  
  let intervalMs: number;
  switch (query.granularity) {
    case 'minute': intervalMs = 60 * 1000; break;
    case 'hour': intervalMs = 60 * 60 * 1000; break;
    case 'day': intervalMs = 24 * 60 * 60 * 1000; break;
    case 'week': intervalMs = 7 * 24 * 60 * 60 * 1000; break;
    case 'month': intervalMs = 30 * 24 * 60 * 60 * 1000; break;
  }
  
  const numPoints = Math.min(500, Math.floor(duration / intervalMs));
  
  for (let i = 0; i < numPoints; i++) {
    const timestamp = new Date(query.startDate.getTime() + i * intervalMs);
    const hour = timestamp.getHours();
    const isWorkHours = hour >= 8 && hour <= 18;
    
    let baseValue: number;
    switch (query.metric) {
      case 'occupancy':
        baseValue = isWorkHours ? 150 + Math.random() * 100 : 10 + Math.random() * 20;
        break;
      case 'energy':
        baseValue = isWorkHours ? 80 + Math.random() * 40 : 20 + Math.random() * 15;
        break;
      case 'temperature':
        baseValue = 21 + Math.random() * 4;
        break;
      case 'humidity':
        baseValue = 40 + Math.random() * 20;
        break;
    }
    
    dataPoints.push({
      timestamp,
      value: Math.round(baseValue * 10) / 10,
      min: Math.round((baseValue * 0.9) * 10) / 10,
      max: Math.round((baseValue * 1.1) * 10) / 10,
      avg: Math.round(baseValue * 10) / 10,
    });
  }
  
  return dataPoints;
};

// Report generation
export interface Report {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  generatedAt: Date;
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  type: 'summary' | 'chart' | 'table' | 'text';
  data: any;
}

export const generateReport = (type: Report['type'], customRange?: { start: Date; end: Date }): Report => {
  const analytics = generateAnalytics();
  
  return {
    id: `report-${Date.now()}`,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Building Report`,
    type,
    generatedAt: new Date(),
    sections: [
      {
        title: 'Executive Summary',
        type: 'summary',
        data: {
          occupancy: analytics.occupancy.averageDaily,
          energy: analytics.energy.todayTotal,
          comfort: analytics.thermal.comfortScore,
          utilization: analytics.space.overallUtilization,
        },
      },
      {
        title: 'Occupancy Trends',
        type: 'chart',
        data: analytics.occupancy.hourlyDistribution,
      },
      {
        title: 'Energy Consumption',
        type: 'chart',
        data: analytics.energy.hourlyUsage,
      },
      {
        title: 'Space Utilization',
        type: 'table',
        data: analytics.space.underutilizedSpaces,
      },
      {
        title: 'Recommendations',
        type: 'text',
        data: [
          ...analytics.thermal.recommendations,
          ...analytics.space.recommendations,
        ],
      },
    ],
  };
};

// Trend calculations
export const calculateTrend = (current: number, previous: number): { value: number; direction: 'up' | 'down' | 'stable' } => {
  if (previous === 0) return { value: 0, direction: 'stable' };
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(Math.round(change * 10) / 10),
    direction: change > 1 ? 'up' : change < -1 ? 'down' : 'stable',
  };
};

