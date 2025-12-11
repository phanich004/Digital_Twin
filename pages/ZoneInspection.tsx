import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  WifiOff,
  ChevronRight,
  Users,
  Thermometer,
  Droplets,
  Clock,
  MapPin,
  Activity,
  X,
} from 'lucide-react';
import { generateZones, Zone } from '../data/mockData';

const StatusBadge: React.FC<{ status: Zone['status'] }> = ({ status }) => {
  const config = {
    normal: { icon: CheckCircle, bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Normal' },
    warning: { icon: AlertCircle, bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Warning' },
    alarm: { icon: AlertTriangle, bg: 'bg-red-500/20', text: 'text-red-400', label: 'Alarm' },
    offline: { icon: WifiOff, bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Offline' },
  }[status];

  const Icon = config.icon;

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};

const ZoneCard: React.FC<{ zone: Zone; onClick: () => void; isSelected: boolean }> = ({ zone, onClick, isSelected }) => (
  <div
    onClick={onClick}
    className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
      isSelected
        ? 'bg-cyan-500/10 border-cyan-500/50 ring-1 ring-cyan-500/30'
        : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-white text-sm">{zone.name}</h3>
        <p className="text-xs text-slate-500 mt-0.5">ID: {zone.id}</p>
      </div>
      <StatusBadge status={zone.status} />
    </div>

    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="bg-slate-800/50 rounded-lg p-2">
        <div className="text-slate-500 mb-0.5">Occupancy</div>
        <div className="text-white font-medium">{zone.currentOccupancy}/{zone.capacity}</div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-2">
        <div className="text-slate-500 mb-0.5">Temp</div>
        <div className="text-white font-medium">{zone.temperature.toFixed(1)}°C</div>
      </div>
      <div className="bg-slate-800/50 rounded-lg p-2">
        <div className="text-slate-500 mb-0.5">Humidity</div>
        <div className="text-white font-medium">{zone.humidity.toFixed(0)}%</div>
      </div>
    </div>
  </div>
);

const ZoneDetail: React.FC<{ zone: Zone; onClose: () => void }> = ({ zone, onClose }) => (
  <div className="h-full flex flex-col">
    {/* Header */}
    <div className="p-6 border-b border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-white">{zone.name}</h2>
            <StatusBadge status={zone.status} />
          </div>
          <p className="text-sm text-slate-400">Zone ID: {zone.id}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Location Info */}
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-500">Floor</div>
            <div className="text-white font-medium">{zone.floor === 0 ? 'Ground' : `Level ${zone.floor}`}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Wing</div>
            <div className="text-white font-medium">{zone.wing}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Type</div>
            <div className="text-white font-medium capitalize">{zone.type}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Last Updated</div>
            <div className="text-white font-medium">{zone.lastUpdated.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* Occupancy */}
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Occupancy
        </h3>
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-3xl font-bold text-white">{zone.currentOccupancy}</div>
            <div className="text-sm text-slate-500">of {zone.capacity} capacity</div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              zone.currentOccupancy / zone.capacity > 0.9 ? 'text-red-400' :
              zone.currentOccupancy / zone.capacity > 0.7 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {Math.round((zone.currentOccupancy / zone.capacity) * 100)}%
            </div>
            <div className="text-xs text-slate-500">utilization</div>
          </div>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              zone.currentOccupancy / zone.capacity > 0.9 ? 'bg-red-500' :
              zone.currentOccupancy / zone.capacity > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${(zone.currentOccupancy / zone.capacity) * 100}%` }}
          />
        </div>
      </div>

      {/* Environment */}
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Environment
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <Thermometer className="w-4 h-4" />
              <span className="text-xs">Temperature</span>
            </div>
            <div className="text-2xl font-bold text-white">{zone.temperature.toFixed(1)}°C</div>
            <div className="text-xs text-slate-500 mt-1">Target: 22.0°C</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Droplets className="w-4 h-4" />
              <span className="text-xs">Humidity</span>
            </div>
            <div className="text-2xl font-bold text-white">{zone.humidity.toFixed(0)}%</div>
            <div className="text-xs text-slate-500 mt-1">Target: 45-55%</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            { time: '2 min ago', event: 'Temperature reading updated', type: 'info' },
            { time: '15 min ago', event: 'Occupancy increased by 5', type: 'info' },
            { time: '1 hour ago', event: 'HVAC adjustment applied', type: 'success' },
            { time: '2 hours ago', event: 'Humidity warning cleared', type: 'success' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                item.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
              }`} />
              <span className="text-slate-400 flex-1">{item.event}</span>
              <span className="text-xs text-slate-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="p-4 border-t border-slate-700 flex gap-3">
      <button className="flex-1 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 font-medium transition-colors">
        View History
      </button>
      <button className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors">
        Configure
      </button>
    </div>
  </div>
);

const ZoneInspection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Zone['status'] | 'all'>('all');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const zones = useMemo(() => generateZones(), []);

  const filteredZones = useMemo(() => {
    return zones.filter(zone => {
      const matchesSearch = zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           zone.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || zone.status === statusFilter;
      const matchesFloor = floorFilter === 'all' || zone.floor === floorFilter;
      return matchesSearch && matchesStatus && matchesFloor;
    });
  }, [zones, searchQuery, statusFilter, floorFilter]);

  const statusCounts = useMemo(() => ({
    all: zones.length,
    normal: zones.filter(z => z.status === 'normal').length,
    warning: zones.filter(z => z.status === 'warning').length,
    alarm: zones.filter(z => z.status === 'alarm').length,
    offline: zones.filter(z => z.status === 'offline').length,
  }), [zones]);

  return (
    <div className="h-full flex">
      {/* Main List */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-white mb-1">Zone Inspection</h1>
          <p className="text-slate-400">Monitor and manage building zones</p>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-slate-800 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search zones by name or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {(['all', 'normal', 'warning', 'alarm', 'offline'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 text-xs opacity-60">({statusCounts[status]})</span>
              </button>
            ))}
          </div>

          {/* Floor Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Floor:</span>
            {(['all', 0, 1, 2, 3, 4] as const).map(floor => (
              <button
                key={floor}
                onClick={() => setFloorFilter(floor)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  floorFilter === floor
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {floor === 'all' ? 'All' : floor === 0 ? 'Ground' : `F${floor}`}
              </button>
            ))}
          </div>
        </div>

        {/* Zone Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredZones.map(zone => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                onClick={() => setSelectedZone(zone)}
                isSelected={selectedZone?.id === zone.id}
              />
            ))}
          </div>

          {filteredZones.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Search className="w-12 h-12 mb-4 opacity-50" />
              <p>No zones match your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedZone && (
        <div className="w-[400px] border-l border-slate-800 bg-slate-900/50">
          <ZoneDetail zone={selectedZone} onClose={() => setSelectedZone(null)} />
        </div>
      )}
    </div>
  );
};

export default ZoneInspection;

