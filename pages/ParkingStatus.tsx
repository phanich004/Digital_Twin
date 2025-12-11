import React, { useMemo, useState } from 'react';
import {
  Car,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { generateParkingSpots, generateParkingAreas, ParkingSpot } from '../data/mockData';

const ParkingMap: React.FC<{ spots: ParkingSpot[]; level: string }> = ({ spots, level }) => {
  const levelSpots = spots.filter(s => s.level === level);
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
      <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center justify-between">
        <span>{level === 'B1' ? 'Basement Level 1' : 'Basement Level 2'}</span>
        <span className="text-xs text-slate-500 font-normal">
          {levelSpots.filter(s => s.status === 'free').length} free
        </span>
      </h3>
      
      <div className="space-y-2">
        {rows.map(row => (
          <div key={row} className="flex items-center gap-2">
            <span className="w-6 text-xs text-slate-500 font-mono">{row}</span>
            <div className="flex-1 flex gap-1">
              {levelSpots
                .filter(s => s.row === row)
                .sort((a, b) => a.number - b.number)
                .map(spot => (
                  <div
                    key={spot.id}
                    className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-mono transition-all cursor-pointer hover:scale-105 ${
                      spot.status === 'occupied'
                        ? spot.vehicleType === 'ev'
                          ? 'bg-green-500/30 border border-green-500/50 text-green-400'
                          : 'bg-blue-500/30 border border-blue-500/50 text-blue-400'
                        : spot.status === 'free'
                        ? 'bg-slate-700/50 border border-slate-600 text-slate-500 hover:bg-emerald-500/20 hover:border-emerald-500/50'
                        : spot.status === 'reserved'
                        ? 'bg-amber-500/30 border border-amber-500/50 text-amber-400'
                        : 'bg-slate-800 border border-slate-700 text-slate-600'
                    }`}
                    title={`${spot.id} - ${spot.status}${spot.vehicleType === 'ev' ? ' (EV)' : ''}`}
                  >
                    {spot.status === 'occupied' && <Car className="w-3 h-3" />}
                    {spot.status === 'reserved' && 'R'}
                    {spot.status === 'disabled' && '—'}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500/50" />
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50" />
          <span>EV Charging</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-slate-700/50 border border-slate-600" />
          <span>Free</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500/50" />
          <span>Reserved</span>
        </div>
      </div>
    </div>
  );
};

const ParkingStatus: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const spots = useMemo(() => generateParkingSpots(), []);
  const areas = useMemo(() => generateParkingAreas(), []);

  const totalSpaces = areas.reduce((sum, a) => sum + a.totalSpaces, 0);
  const occupiedSpaces = areas.reduce((sum, a) => sum + a.occupiedSpaces, 0);
  const freeSpaces = totalSpaces - occupiedSpaces - areas.reduce((sum, a) => sum + a.reservedSpaces, 0);
  const occupancyRate = Math.round((occupiedSpaces / totalSpaces) * 100);

  const pieData = [
    { name: 'Occupied', value: occupiedSpaces, color: '#3b82f6' },
    { name: 'Reserved', value: areas.reduce((sum, a) => sum + a.reservedSpaces, 0), color: '#f59e0b' },
    { name: 'Free', value: freeSpaces, color: '#22c55e' },
  ];

  const hourlyData = Array.from({ length: 12 }, (_, i) => ({
    hour: `${(8 + i).toString().padStart(2, '0')}:00`,
    occupancy: Math.floor(50 + Math.sin(i / 3) * 30 + Math.random() * 20),
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Parking Status</h1>
          <p className="text-slate-400 mt-1">Real-time parking occupancy monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-sm transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-xl text-cyan-400 text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex items-center gap-1 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">+5%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{totalSpaces}</div>
          <div className="text-sm text-slate-400 mt-1">Total Spaces</div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{occupiedSpaces}</div>
          <div className="text-sm text-slate-400 mt-1">Occupied</div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-400">{freeSpaces}</div>
          <div className="text-sm text-slate-400 mt-1">Available</div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">
            {areas.reduce((sum, a) => sum + a.evChargingInUse, 0)}/{areas.reduce((sum, a) => sum + a.evCharging, 0)}
          </div>
          <div className="text-sm text-slate-400 mt-1">EV Charging</div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-5 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-violet-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{occupancyRate}%</div>
          <div className="text-sm text-slate-400 mt-1">Occupancy Rate</div>
        </div>
      </div>

      {/* Charts & Maps */}
      <div className="grid grid-cols-3 gap-6">
        {/* Occupancy Chart */}
        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-sm font-bold text-slate-400 mb-4">Occupancy Distribution</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Trend */}
        <div className="col-span-2 bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
          <h3 className="text-sm font-bold text-slate-400 mb-4">Today's Occupancy Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="occupancy" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Parking Maps */}
      <div className="grid grid-cols-2 gap-6">
        <ParkingMap spots={spots} level="B1" />
        <ParkingMap spots={spots} level="B2" />
      </div>

      {/* Area Cards */}
      <div className="grid grid-cols-2 gap-4">
        {areas.map(area => (
          <div key={area.id} className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{area.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                area.occupiedSpaces / area.totalSpaces > 0.9
                  ? 'bg-red-500/20 text-red-400'
                  : area.occupiedSpaces / area.totalSpaces > 0.7
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {Math.round((area.occupiedSpaces / area.totalSpaces) * 100)}% Full
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${(area.occupiedSpaces / area.totalSpaces) * 100}%` }}
              />
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-white">{area.totalSpaces}</div>
                <div className="text-xs text-slate-500">Total</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-400">{area.occupiedSpaces}</div>
                <div className="text-xs text-slate-500">Used</div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-400">{area.totalSpaces - area.occupiedSpaces - area.reservedSpaces}</div>
                <div className="text-xs text-slate-500">Free</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-400">{area.evChargingInUse}/{area.evCharging}</div>
                <div className="text-xs text-slate-500">EV</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParkingStatus;

