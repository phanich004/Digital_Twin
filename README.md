# Nexus Campus - Smart Building Digital Twin Dashboard

A modern web dashboard for smart-building and digital-twin monitoring systems built with React, TypeScript, and Three.js. The application provides real-time 3D visualization of building infrastructure, incident monitoring, parking management, zone inspection, personnel tracking, and thermal comfort analysis.

## Features

### 3D Building Overview
- Interactive 3D building visualization with day/night cycle
- Dynamic lighting with sky, stars, and atmospheric effects
- Animated floor selection with drawer-style extraction
- Real-time occupancy simulation with people visualization
- Zone highlighting with color-coded room types
- Parking level visibility toggle
- Time-based simulation with play/pause controls
- Post-processing effects (bloom, vignette)

### Incident Monitor (Explosion Overview)
- 3D visualization of affected building floors
- Severity indicators with pulsing impact zones
- Incident metadata display (time, location, severity, status)
- Affected zones listing with status indicators
- Emergency contact and broadcast alert functionality

### Parking Status
- Visual parking map with color-coded spot status
- Real-time occupancy tracking (occupied, free, reserved, EV charging)
- Occupancy distribution pie chart
- Hourly trend analysis bar chart
- Multi-level parking support
- EV charging station monitoring

### Zone Inspection
- Searchable and filterable zone listing
- Status indicators (normal, warning, alarm, offline)
- Detail panel with occupancy and environmental data
- Floor and status filter tabs
- Activity logging per zone

### Personnel Movement
- Real-time personnel count per zone
- Entry/exit flow visualization
- Time-series movement charts
- Peak hours analysis
- Zone-specific occupancy drill-down

### Indoor Thermal Comfort
- Temperature and humidity monitoring
- Comfort index classification (comfortable, slightly warm, too hot, too cold)
- 24-hour trend charts for temperature and humidity
- CO2 level monitoring
- Air quality indicators per zone
- Mini sparkline visualizations

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **3D Rendering**: Three.js with React Three Fiber and Drei
- **Post-Processing**: React Three Postprocessing
- **Charts**: Recharts
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite

## Project Structure

```
nexus-campus-3d/
├── components/
│   ├── Layout.tsx              # Main layout with sidebar navigation
│   ├── Dashboard.tsx           # Legacy dashboard component
│   ├── Scene.tsx               # Legacy 3D scene component
│   └── SceneComponents/
│       ├── BuildingFloor.tsx   # Building floor 3D component
│       └── ParkingFloor.tsx    # Parking level 3D component
├── data/
│   └── mockData.ts             # Mock data layer for all views
├── pages/
│   ├── Overview3D.tsx          # Main 3D building overview
│   ├── ExplosionOverview.tsx   # Incident monitoring view
│   ├── ParkingStatus.tsx       # Parking management view
│   ├── ZoneInspection.tsx      # Zone inspection view
│   ├── PersonnelMovement.tsx   # Personnel tracking view
│   └── ThermalComfort.tsx      # Thermal comfort monitoring
├── services/
│   └── simulationService.ts    # Simulation calculations
├── App.tsx                     # Application root with routing
├── index.tsx                   # Entry point
├── types.ts                    # TypeScript type definitions
├── constants.ts                # Application constants
└── vite.config.ts              # Vite configuration
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/phanich004/Digital_Twin.git
cd Digital_Twin
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Requirements

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Backend Integration

The application uses a mock data layer located in `data/mockData.ts`. To integrate with a real backend:

1. **Real-time Data**: Replace mock data generators with WebSocket or API connections
2. **IoT Sensors**: Connect to building management systems for live sensor data
3. **Authentication**: Add user authentication for secure access
4. **Database**: Connect to a time-series database for historical data

TODO comments are placed throughout the codebase indicating where real-time data integration should occur.

## Configuration

### Building Configuration
Building dimensions and floor configurations can be modified in `constants.ts`:
- `BUILDING_WIDTH` - Building width in meters
- `BUILDING_DEPTH` - Building depth in meters
- `FLOOR_HEIGHT` - Height per floor
- `COLOR_PALETTE` - Material colors for 3D elements
- `ZONE_COLORS` - Colors for different room types

### Simulation Parameters
Simulation behavior can be adjusted in `services/simulationService.ts`:
- Work hours configuration
- Occupancy calculation algorithms
- Energy consumption models
- Environmental factor calculations

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

WebGL 2.0 support is required for 3D visualization.

## License

This project is provided as-is for educational and demonstration purposes.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

