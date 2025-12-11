import React, { useMemo, useState } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  MapPin,
  Activity,
  Filter,
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
  BarChart,
  Bar,
} from 'recharts';
import { generatePersonnelMovement, generateTimeSeriesData } from '../data/mockData';

const PersonnelMovement: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');

  const movementData = useMemo(() => generatePersonnelMovement(), []);
  const timeSeriesData = useMemo(() => generateTimeSeriesData(24), []);

  // Get unique zones with latest data
  const zones = useMemo(() => {
    const zoneMap = new Map<string, { name: string; current: number; trend: number }>();
    movementData.forEach(d => {
      if (!zoneMap.has(d.zoneId) || d.timestamp > movementData.find(m => m.zoneId === d.zoneId)!.timestamp) {
        const prevEntry = movementData.find(m => m.zoneId === d.zoneId && m.timestamp < d.timestamp);
        zoneMap.set(d.zoneId, {
          name: d.zoneName,
          current: d.current,
          trend: prevEntry ? d.current - prevEntry.current : 0,
        });
      }
    });
    return Array.from(zoneMap.entries()).map(([id, data]) => ({ id, ...data }));
  }, [movementData]);

  // Chart data for selected zone or aggregate
  const chartData = useMemo(() => {
    const filtered = selectedZone
      ? movementData.filter(d => d.zoneId === selectedZone)
      : movementData;
    
    // Group by timestamp
    const grouped = new Map<string, { entering: number; leaving: number; current: number }>();
    filtered.forEach(d => {
      const timeKey = d.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const existing = grouped.get(timeKey) || { entering: 0, leaving: 0, current: 0 };
      grouped.set(timeKey, {
        entering: existing.entering + d.entering,
        leaving: existing.leaving + d.leaving,
        current: existing.current + d.current,
      });
    });

    return Array.from(grouped.entries())
      .map(([time, data]) => ({ time, ...data }))
      .slice(-24);
  }, [movementData, selectedZone]);

  const totalPeople = zones.reduce((sum, z) => sum + z.current, 0);
  const avgOccupancy = Math.round(totalPeople / zones.length);

  // Entry/exit data for today
  const todayEntries = movementData.reduce((sum, d) => sum + d.entering, 0);
  const todayExits = movementData.reduce((sum, d) => sum + d.leaving, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Personnel Movement</h1>
          <p className="text-slate-400 mt-1">Track and analyze occupancy patterns</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800 rounded-xl p-1">
            {(['1h', '6h', '24h', '7d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl p-6 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-semibold">+12%</span>
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-1">{totalPeople}</div>
          <div className="text-sm text-slate-400">Current Occupancy</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-1">{todayEntries}</div>
          <div className="text-sm text-slate-400">Entries Today</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl p-6 border border-orange-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <ArrowDownRight className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-1">{todayExits}</div>
          <div className="text-sm text-slate-400">Exits Today</div>
        </div>

        <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl p-6 border border-violet-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-violet-400" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white mb-1">{avgOccupancy}</div>
          <div className="text-sm text-slate-400">Avg per Zone</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {selectedZone ? zones.find(z => z.id === selectedZone)?.name : 'All Zones'} - Movement Timeline
            </h3>
            <p className="text-sm text-slate-400">Entry and exit patterns over time</p>
          </div>
          {selectedZone && (
            <button
              onClick={() => setSelectedZone(null)}
              className="px-3 py-1.5 rounded-lg text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              Clear Selection
            </button>
          )}
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '12px',
                }}
                labelStyle={{ color: '#94a3b8', marginBottom: '8px' }}
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#colorCurrent)"
                name="Current Occupancy"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Zone Cards & Entry/Exit Chart */}
      <div className="grid grid-cols-3 gap-6">
        {/* Entry/Exit Chart */}
        <div className="col-span-2 bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Entry vs Exit Flow</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
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
                <Bar dataKey="entering" fill="#22c55e" name="Entering" radius={[2, 2, 0, 0]} />
                <Bar dataKey="leaving" fill="#f97316" name="Leaving" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-sm text-slate-400">Entering</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span className="text-sm text-slate-400">Leaving</span>
            </div>
          </div>
        </div>

        {/* Zone List */}
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Zone Occupancy</h3>
          <div className="space-y-3">
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id === selectedZone ? null : zone.id)}
                className={`w-full p-4 rounded-xl border transition-all text-left ${
                  selectedZone === zone.id
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{zone.name}</span>
                  <div className={`flex items-center gap-1 text-sm ${
                    zone.trend > 0 ? 'text-emerald-400' : zone.trend < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {zone.trend > 0 ? <TrendingUp className="w-3 h-3" /> : zone.trend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                    {zone.trend > 0 ? '+' : ''}{zone.trend}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="text-2xl font-bold text-white">{zone.current}</span>
                  </div>
                  <div className="h-1.5 w-24 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      style={{ width: `${Math.min(100, (zone.current / 50) * 100)}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Peak Hours Analysis */}
      <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Peak Hours Analysis</h3>
        <div className="grid grid-cols-6 gap-4">
          {[
            { label: '06:00-08:00', value: 45, peak: false },
            { label: '08:00-10:00', value: 85, peak: true },
            { label: '10:00-12:00', value: 72, peak: false },
            { label: '12:00-14:00', value: 68, peak: false },
            { label: '14:00-16:00', value: 78, peak: false },
            { label: '16:00-18:00', value: 90, peak: true },
          ].map((slot, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl text-center ${
                slot.peak ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-slate-800/50'
              }`}
            >
              <div className="text-xs text-slate-400 mb-2">{slot.label}</div>
              <div className={`text-2xl font-bold ${slot.peak ? 'text-cyan-400' : 'text-white'}`}>
                {slot.value}%
              </div>
              {slot.peak && (
                <div className="text-xs text-cyan-400 mt-1">Peak</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonnelMovement;

