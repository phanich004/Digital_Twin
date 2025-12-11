# Nexus Campus - Smart Building Digital Twin Dashboard

A comprehensive web dashboard for smart-building and digital-twin monitoring systems built with React, TypeScript, and Three.js. The application provides real-time 3D visualization of building infrastructure with advanced features including voice commands, emergency management, CCTV integration, and predictive analytics.

## Features

### Core Dashboard Views

#### 3D Building Overview
- Interactive 3D building visualization with day/night cycle
- Dynamic lighting with sky, stars, and atmospheric effects
- Animated floor selection with drawer-style extraction
- Real-time occupancy simulation with people visualization
- Zone highlighting with color-coded room types
- Parking level visibility toggle
- Time-based simulation with play/pause controls
- Post-processing effects (bloom, vignette, sparkles)

#### Incident Monitor (Explosion Overview)
- 3D visualization of affected building floors with severity indicators
- Pulsing impact zone markers
- Incident metadata display (time, location, severity, status)
- Affected zones listing with real-time status
- Emergency contact and broadcast alert functionality

#### Parking Status
- Visual parking map with color-coded spot status
- Real-time occupancy tracking (occupied, free, reserved, EV charging)
- Occupancy distribution pie chart
- Hourly trend analysis bar chart
- Multi-level parking support with individual maps
- EV charging station monitoring

#### Zone Inspection
- Searchable and filterable zone listing
- Status indicators (normal, warning, alarm, offline)
- Detail panel with occupancy and environmental data
- Floor and status filter tabs
- Activity logging per zone

#### Personnel Movement
- Real-time personnel count per zone
- Entry/exit flow visualization
- Time-series movement charts
- Peak hours analysis with heatmap
- Zone-specific occupancy drill-down

#### Indoor Thermal Comfort
- Temperature and humidity monitoring per zone
- Comfort index classification (comfortable, slightly warm, too hot, too cold)
- 24-hour trend charts for temperature and humidity
- CO2 level and air quality monitoring
- Mini sparkline visualizations per zone

#### Analytics Dashboard
- Executive summary with KPI cards
- Occupancy trends and zone breakdown charts
- Energy consumption analysis with cost tracking
- Carbon footprint monitoring
- Space utilization metrics
- AI-powered recommendations
- Predictive maintenance alerts
- Anomaly detection reporting
- Report generation and export

#### CCTV Monitoring
- Multi-camera grid view with live status
- PTZ camera controls (pan, tilt, zoom)
- Camera feature indicators (audio, night vision, analytics)
- Motion detection event logging
- Floor-based camera filtering
- Single, quad, and grid view modes

### Advanced Features

#### Voice Commands
- Hands-free navigation using Web Speech API
- Natural language commands for page navigation
- Voice-controlled view toggles
- Audio feedback responses
- Command help system

Supported commands:
- "Go to parking" - Navigate to parking status
- "Show floor 2" - Focus on specific floor
- "Enable emergency mode" - Activate emergency protocols
- "What is the temperature" - Query building status
- "Help" - Show available commands

#### Keyboard Shortcuts
- Number keys (1-8) for quick page navigation
- Ctrl+E for emergency mode toggle
- Ctrl+V for voice command toggle
- Ctrl+D for dark/light mode
- Space for simulation play/pause
- Arrow keys for time control
- "/" to show shortcuts modal
- Escape to close panels

#### Weather Integration
- Real-time weather data display
- Temperature and wind speed monitoring
- Weather impact on building systems analysis
- 5-day forecast support
- HVAC load recommendations based on weather

#### Alert System
- Real-time alert notifications
- Severity-based categorization (critical, high, medium, low, info)
- Alert acknowledgment workflow
- Custom alert rules with thresholds
- Multi-channel notification support (dashboard, email, SMS, Slack)
- Alert history and audit trail

#### Emergency Management
- Emergency mode activation for drills and real incidents
- Support for multiple emergency types (fire, earthquake, gas leak, security, medical)
- Evacuation route visualization
- Muster point tracking with capacity monitoring
- Emergency broadcast system
- All-clear and reset protocols

## Technology Stack

- Frontend Framework: React 19 with TypeScript
- 3D Rendering: Three.js with React Three Fiber and Drei
- Post-Processing: React Three Postprocessing
- Charts: Recharts
- Routing: React Router DOM v7
- Styling: Tailwind CSS
- Icons: Lucide React
- Build Tool: Vite
- Voice: Web Speech API

## Project Structure

```
nexus-campus-3d/
├── components/
│   ├── Layout.tsx              # Main layout with sidebar, voice, alerts
│   ├── Dashboard.tsx           # Legacy dashboard component
│   ├── Scene.tsx               # Legacy 3D scene component
│   └── SceneComponents/
│       ├── BuildingFloor.tsx   # Building floor 3D component
│       └── ParkingFloor.tsx    # Parking level 3D component
├── data/
│   └── mockData.ts             # Mock data layer for all views
├── hooks/
│   └── useKeyboardShortcuts.ts # Keyboard shortcuts hook
├── pages/
│   ├── Overview3D.tsx          # Main 3D building overview
│   ├── ExplosionOverview.tsx   # Incident monitoring view
│   ├── ParkingStatus.tsx       # Parking management view
│   ├── ZoneInspection.tsx      # Zone inspection view
│   ├── PersonnelMovement.tsx   # Personnel tracking view
│   ├── ThermalComfort.tsx      # Thermal comfort monitoring
│   ├── Analytics.tsx           # Analytics dashboard
│   └── CCTV.tsx                # CCTV monitoring view
├── services/
│   ├── simulationService.ts    # Simulation calculations
│   ├── weatherService.ts       # Weather API integration
│   ├── alertService.ts         # Alert management
│   ├── voiceService.ts         # Voice command processing
│   ├── cctvService.ts          # CCTV camera management
│   ├── evacuationService.ts    # Emergency management
│   └── analyticsService.ts     # Analytics and reporting
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
- Modern browser with WebGL 2.0 support
- Microphone access for voice commands (optional)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Backend Integration

The application uses a mock data layer located in `services/` and `data/`. To integrate with a real backend:

### Real-time Data Sources
- Replace mock data generators with WebSocket connections
- Connect to building management systems (BMS)
- Integrate IoT sensor data feeds
- Connect to CCTV/NVR systems for video streams

### API Endpoints (TODO)
- Weather: Connect to OpenWeatherMap or similar
- Alerts: Integrate with monitoring systems
- Analytics: Connect to time-series databases
- CCTV: Integrate with Milestone, Genetec, or Hikvision APIs

### Authentication
- Add user authentication for secure access
- Implement role-based access control
- Integrate with enterprise SSO systems

## Configuration

### Building Configuration
Building dimensions and floor configurations can be modified in `constants.ts`:
- `BUILDING_WIDTH` - Building width in meters
- `BUILDING_DEPTH` - Building depth in meters
- `FLOOR_HEIGHT` - Height per floor
- `COLOR_PALETTE` - Material colors for 3D elements
- `ZONE_COLORS` - Colors for different room types

### Alert Rules
Custom alert rules can be configured in `services/alertService.ts`:
- Temperature thresholds
- Humidity limits
- CO2 levels
- Occupancy capacity warnings

### Voice Commands
Custom voice commands can be added in `services/voiceService.ts`:
- Add new command patterns (regex)
- Register command handlers
- Customize voice feedback

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

WebGL 2.0 and Web Speech API support required for full functionality.

## Future Enhancements

- AR/VR mode with WebXR support
- BIM model import (IFC/glTF)
- Animated crowd simulation with pathfinding
- Historical data playback with timeline scrubbing
- Facial recognition integration
- Mobile companion app
- Multi-language support
- Custom dashboard builder

## License

This project is provided as-is for educational and demonstration purposes.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request
