import React, { useMemo, useState } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Snowflake,
  Flame,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { generateThermalReadings, generateTimeSeriesData, ThermalReading } from '../data/mockData';

const ComfortTag: React.FC<{ comfort: ThermalReading['comfortIndex'] }> = ({ comfort }) => {
  const config = {
    comfortable: { icon: CheckCircle, bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Comfortable' },
    slightly_warm: { icon: Sun, bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Slightly Warm' },
    too_hot: { icon: Flame, bg: 'bg-red-500/20', text: 'text-red-400', label: 'Too Hot' },
    too_cold: { icon: Snowflake, bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Too Cold' },
    slightly_cold: { icon: Snowflake, bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Slightly Cold' },
  }[comfort];

  const Icon = config.icon;

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

const AirQualityBadge: React.FC<{ quality: 'good' | 'moderate' | 'poor' }> = ({ quality }) => {
  const config = {
    good: { bg: 'bg-emerald-500', label: 'Good' },
    moderate: { bg: 'bg-amber-500', label: 'Moderate' },
    poor: { bg: 'bg-red-500', label: 'Poor' },
  }[quality];

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${config.bg}`}>
      {config.label}
    </span>
  );
};

const ZoneThermalCard: React.FC<{ reading: ThermalReading; onClick: () => void; isSelected: boolean }> = ({
  reading,
  onClick,
  isSelected,
}) => {
  // Simple sparkline data
  const sparkData = Array.from({ length: 12 }, (_, i) => ({
    value: reading.temperature + (Math.random() - 0.5) * 2,
  }));

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] ${
        isSelected
          ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/50 ring-1 ring-cyan-500/30'
          : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">{reading.zoneName}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Last updated: {reading.lastUpdated.toLocaleTimeString()}</p>
        </div>
        <ComfortTag comfort={reading.comfortIndex} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
            <Thermometer className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{reading.temperature.toFixed(1)}°</div>
          <div className="text-xs text-slate-500">Temperature</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
            <Droplets className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{reading.humidity.toFixed(0)}%</div>
          <div className="text-xs text-slate-500">Humidity</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <Wind className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white">{reading.co2Level.toFixed(0)}</div>
          <div className="text-xs text-slate-500">CO₂ ppm</div>
        </div>
      </div>

      {/* Mini Sparkline */}
      <div className="h-12 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <defs>
              <linearGradient id={`spark-${reading.zoneId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#06b6d4"
              strokeWidth={1.5}
              fill={`url(#spark-${reading.zoneId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50">
        <span className="text-xs text-slate-400">Air Quality</span>
        <AirQualityBadge quality={reading.airQuality} />
      </div>
    </div>
  );
};

const ThermalComfort: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const readings = useMemo(() => generateThermalReadings(), []);
  const timeSeriesData = useMemo(() => generateTimeSeriesData(24), []);

  const selectedReading = readings.find(r => r.zoneId === selectedZone);

  // Stats
  const avgTemp = readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length;
  const avgHumidity = readings.reduce((sum, r) => sum + r.humidity, 0) / readings.length;
  const comfortableZones = readings.filter(r => r.comfortIndex === 'comfortable').length;
  const alertZones = readings.filter(r => r.comfortIndex === 'too_hot' || r.comfortIndex === 'too_cold').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Indoor Thermal Comfort</h1>
          <p className="text-slate-400 mt-1">Monitor temperature, humidity, and comfort levels</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-sm transition-colors">
            <Settings className="w-4 h-4" />
            Configure
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-xl text-cyan-400 text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Avg Temperature</div>
              <div className="text-3xl font-bold text-white">{avgTemp.toFixed(1)}°C</div>
            </div>
          </div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-emerald-500 to-red-500"
              style={{ width: `${((avgTemp - 15) / 15) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>15°C</span>
            <span>30°C</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Avg Humidity</div>
              <div className="text-3xl font-bold text-white">{avgHumidity.toFixed(0)}%</div>
            </div>
          </div>
          <div className="text-xs text-slate-500">Optimal: 40-60%</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Comfortable Zones</div>
              <div className="text-3xl font-bold text-white">{comfortableZones}/{readings.length}</div>
            </div>
          </div>
          <div className="text-xs text-emerald-400">
            {Math.round((comfortableZones / readings.length) * 100)}% optimal
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="text-sm text-slate-400">Zones Needing Attention</div>
              <div className="text-3xl font-bold text-white">{alertZones}</div>
            </div>
          </div>
          <div className="text-xs text-red-400">
            {alertZones > 0 ? 'Action required' : 'All zones normal'}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Temperature Trend */}
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Temperature Trend (24h)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[18, 28]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  name="Temperature (°C)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Humidity Trend */}
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Humidity Trend (24h)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[30, 70]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#humidityGradient)"
                  name="Humidity (%)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Zone Cards */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Zone Readings</h3>
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
          {readings.map(reading => (
            <ZoneThermalCard
              key={reading.zoneId}
              reading={reading}
              onClick={() => setSelectedZone(reading.zoneId === selectedZone ? null : reading.zoneId)}
              isSelected={selectedZone === reading.zoneId}
            />
          ))}
        </div>
      </div>

      {/* Comfort Index Legend */}
      <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Comfort Index Scale</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <span className="text-sm text-slate-300">Too Cold (&lt;18°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cyan-500" />
              <span className="text-sm text-slate-300">Slightly Cold (18-20°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500" />
              <span className="text-sm text-slate-300">Comfortable (20-24°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500" />
              <span className="text-sm text-slate-300">Slightly Warm (24-26°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span className="text-sm text-slate-300">Too Hot (&gt;26°C)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalComfort;

