import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Sun, Zap, Layout, Eye, ArrowRight, EyeOff } from 'lucide-react';
import { SimulationState, ViewMode } from '../types';

interface DashboardProps {
  simulationState: SimulationState;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  time: number;
  setTime: (time: number) => void;
  showParking: boolean;
  setShowParking: (show: boolean) => void;
  selectedFloor: number | null;
  onClearSelection: () => void;
  showZones: boolean;
  setShowZones: (v: boolean) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  simulationState,
  viewMode,
  setViewMode,
  time,
  setTime,
  showParking,
  setShowParking,
  selectedFloor,
  onClearSelection,
  showZones,
  setShowZones
}) => {
  const [activeTab, setActiveTab] = React.useState<'people' | 'env' | 'energy'>('people');

  const formatTime = (t: number) => {
    const hours = Math.floor(t);
    const mins = Math.floor((t - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const energyData = [
    { name: 'Cool', value: simulationState.energyUsage.cooling },
    { name: 'Heat', value: simulationState.energyUsage.heating },
    { name: 'Light', value: simulationState.energyUsage.lighting },
    { name: 'Equip', value: simulationState.energyUsage.equipment },
  ];

  return (
    <div className="absolute left-4 top-4 bottom-4 w-96 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl flex flex-col shadow-2xl overflow-hidden z-10 text-slate-100">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-700 bg-slate-800/50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">Nexus Campus</h1>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-400 font-mono">
          <span>LIVE SIMULATION</span>
          <span>{formatTime(time)}</span>
        </div>
        <input
          type="range"
          min={0}
          max={24}
          step={0.1}
          value={time}
          onChange={(e) => setTime(parseFloat(e.target.value))}
          className="w-full mt-3 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab('people')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'people' ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Users size={16} className="inline mr-2" /> People
        </button>
        <button
          onClick={() => setActiveTab('env')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'env' ? 'text-green-400 border-b-2 border-green-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Sun size={16} className="inline mr-2" /> Env
        </button>
        <button
          onClick={() => setActiveTab('energy')}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'energy' ? 'text-yellow-400 border-b-2 border-yellow-400 bg-slate-800' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Zap size={16} className="inline mr-2" /> Energy
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* View Modes */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">View Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: ViewMode.DEFAULT, icon: Layout, label: 'Realistic' },
              { id: ViewMode.HEATMAP, icon: Sun, label: 'Heatmap' },
              { id: ViewMode.PEOPLE, icon: Users, label: 'Density' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all ${viewMode === m.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                <m.icon size={18} className="mb-1" />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Controls</label>
           <div className="flex flex-col gap-2">
             <button onClick={() => setShowParking(!showParking)} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors">
               <span className="text-sm">Parking Visibility</span>
               {showParking ? <Eye size={16} className="text-blue-400" /> : <EyeOff size={16} className="text-slate-500" />}
             </button>
             <button onClick={() => setShowZones(!showZones)} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors">
               <span className="text-sm">Show Zones</span>
               <div className={`w-8 h-4 rounded-full relative transition-colors ${showZones ? 'bg-blue-500' : 'bg-slate-600'}`}>
                 <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showZones ? 'left-4.5' : 'left-0.5'}`} />
               </div>
             </button>
           </div>
        </div>
        
        {selectedFloor !== null && (
          <div className="bg-blue-900/30 border border-blue-500/50 p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-300 font-bold uppercase">Selection</div>
              <div className="text-sm font-medium">Floor Level {selectedFloor}</div>
            </div>
            <button onClick={onClearSelection} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors">
              Reset
            </button>
          </div>
        )}

        <hr className="border-slate-700" />

        {/* Dynamic Content Based on Tab */}
        {activeTab === 'people' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex justify-between items-end">
                <div>
                  <div className="text-3xl font-bold text-white">{Math.floor(simulationState.totalOccupancy)}</div>
                  <div className="text-xs text-slate-400">Total Occupants</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-green-400 font-bold">+12%</div>
                  <div className="text-xs text-slate-500">vs Avg</div>
                </div>
             </div>
             
             <div className="h-32 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={new Array(10).fill(0).map((_, i) => ({ time: i, val: Math.random() * 100 }))}>
                    <Line type="monotone" dataKey="val" stroke="#60a5fa" strokeWidth={2} dot={false} />
                    <XAxis hide />
                    <YAxis hide />
                  </LineChart>
                </ResponsiveContainer>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed">
               Workforce density is currently high in Office zones. Meeting room utilization is at 65%.
             </p>
           </div>
        )}

        {activeTab === 'env' && (
           <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400">Temp</div>
                <div className="text-xl font-bold text-orange-300">{simulationState.temperature.toFixed(1)}°C</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400">Humidity</div>
                <div className="text-xl font-bold text-blue-300">{simulationState.humidity.toFixed(0)}%</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400">Solar</div>
                <div className="text-xl font-bold text-yellow-300">{simulationState.solarRadiation.toFixed(0)} W/m²</div>
              </div>
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-xs text-slate-400">Wind</div>
                <div className="text-xl font-bold text-slate-300">{simulationState.windSpeed.toFixed(1)} m/s</div>
              </div>
           </div>
        )}

        {activeTab === 'energy' && (
           <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={energyData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={40} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px'}} />
                    <Bar dataKey="value" fill="#fbbf24" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
             <div className="text-xs text-slate-400 text-center">
               Instantaneous Power Consumption (kW)
             </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
