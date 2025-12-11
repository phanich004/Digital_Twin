import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Thermometer,
  Building2,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Leaf,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { generateAnalytics, generateReport } from '../services/analyticsService';

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const analytics = useMemo(() => generateAnalytics(), []);

  const pieColors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b'];

  const handleExportReport = () => {
    const report = generateReport(timeRange === 'today' ? 'daily' : timeRange === 'week' ? 'weekly' : 'monthly');
    console.log('Generated report:', report);
    // TODO: Implement actual PDF/Excel export
    alert('Report generated! Check console for data.');
  };

  return (
    <div className="p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-1">Insights and trends for building operations</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800 rounded-xl p-1">
            {(['today', 'week', 'month', 'year'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  timeRange === range
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-xl text-cyan-400 text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl p-6 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">+{analytics.occupancy.weeklyTrend}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{analytics.occupancy.currentTotal}</div>
          <div className="text-sm text-slate-400">Current Occupancy</div>
          <div className="text-xs text-slate-500 mt-2">Peak: {analytics.occupancy.peakToday} at {analytics.occupancy.peakTime}</div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div className={`flex items-center gap-1 ${analytics.energy.comparison.vsYesterday < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {analytics.energy.comparison.vsYesterday < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              <span className="text-sm font-semibold">{Math.abs(analytics.energy.comparison.vsYesterday)}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{analytics.energy.currentUsage.toFixed(0)} kW</div>
          <div className="text-sm text-slate-400">Current Usage</div>
          <div className="text-xs text-slate-500 mt-2">Today: {analytics.energy.todayTotal} kWh (${analytics.energy.costToday})</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">{analytics.thermal.comfortScore}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{analytics.thermal.avgTemperature}°C</div>
          <div className="text-sm text-slate-400">Comfort Score</div>
          <div className="text-xs text-slate-500 mt-2">{analytics.thermal.zonesOutOfRange} zones need attention</div>
        </div>

        <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-6 border border-violet-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-violet-400" />
            </div>
            <div className="flex items-center gap-1 text-violet-400">
              <Target className="w-4 h-4" />
              <span className="text-sm font-semibold">{analytics.space.overallUtilization}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{analytics.space.desksUsed}/{analytics.space.desksTotal}</div>
          <div className="text-sm text-slate-400">Space Utilization</div>
          <div className="text-xs text-slate-500 mt-2">{analytics.space.meetingRoomsBooked}/{analytics.space.meetingRoomsTotal} meeting rooms booked</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Occupancy Chart */}
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Occupancy Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.occupancy.hourlyDistribution}>
                <defs>
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(h) => `${h}:00`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelFormatter={(h) => `${h}:00`}
                />
                <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} fill="url(#occupancyGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy Chart */}
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Energy Consumption</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.energy.hourlyUsage}>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(h) => `${h}:00`}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelFormatter={(h) => `${h}:00`}
                />
                <Bar dataKey="usage" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-3 gap-6">
        {/* Zone Breakdown */}
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Occupancy by Zone</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.occupancy.zoneBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="zone"
                >
                  {analytics.occupancy.zoneBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {analytics.occupancy.zoneBreakdown.slice(0, 4).map((zone, i) => (
              <div key={zone.zone} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: pieColors[i] }} />
                <span className="text-slate-400 truncate">{zone.zone}</span>
                <span className="text-white font-semibold ml-auto">{zone.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Energy Breakdown */}
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Energy Breakdown</h3>
          <div className="space-y-4">
            {analytics.energy.breakdown.map((item, i) => (
              <div key={item.category}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400">{item.category}</span>
                  <span className="text-white font-semibold">{item.percentage}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%`, backgroundColor: pieColors[i % pieColors.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2 text-emerald-400">
              <Leaf className="w-4 h-4" />
              <span className="text-sm">Carbon: {analytics.energy.carbonFootprint} kg CO2 today</span>
            </div>
          </div>
        </div>

        {/* Predictions & Alerts */}
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Predictions & Alerts</h3>
          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">Next Hour</span>
              </div>
              <div className="text-2xl font-bold text-white">{analytics.predictions.nextHourOccupancy} people</div>
            </div>
            
            {analytics.predictions.maintenanceAlerts.slice(0, 2).map((alert, i) => (
              <div key={i} className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-400 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-semibold">{alert.equipment}</span>
                </div>
                <p className="text-sm text-slate-300">{alert.issue}</p>
                <p className="text-xs text-slate-500 mt-1">{alert.recommendedAction}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">AI Recommendations</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-cyan-400 mb-3">Thermal Optimization</h4>
            <ul className="space-y-2">
              {analytics.thermal.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-violet-400 mb-3">Space Optimization</h4>
            <ul className="space-y-2">
              {analytics.space.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

