import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Car,
  Building2,
  Users,
  Thermometer,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  Search,
  Moon,
  Sun,
  Mic,
  MicOff,
  BarChart3,
  Camera,
  Shield,
  Keyboard,
  X,
  Volume2,
  Cloud,
  Wind,
} from 'lucide-react';
import { voiceService, VoiceState } from '../services/voiceService';
import { getAlerts, getActiveAlerts, acknowledgeAlert, Alert, getSeverityConfig } from '../services/alertService';
import { fetchWeatherData, WeatherData } from '../services/weatherService';
import { getEmergencyState, activateEmergency, deactivateEmergency, EmergencyState } from '../services/evacuationService';
import { useKeyboardShortcuts, shortcuts, formatShortcut, getShortcutsByCategory } from '../hooks/useKeyboardShortcuts';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '3D Overview' },
  { path: '/explosion', icon: AlertTriangle, label: 'Incident Monitor' },
  { path: '/parking', icon: Car, label: 'Parking Status' },
  { path: '/zones', icon: Building2, label: 'Zone Inspection' },
  { path: '/personnel', icon: Users, label: 'Personnel Movement' },
  { path: '/thermal', icon: Thermometer, label: 'Thermal Comfort' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/cctv', icon: Camera, label: 'CCTV' },
];

// Keyboard Shortcuts Modal
const ShortcutsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  const categories = getShortcutsByCategory();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            Keyboard Shortcuts
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">Navigation</h3>
            <div className="space-y-2">
              {categories.navigation.map(s => (
                <div key={s.action} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{s.description}</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-300 font-mono text-xs">{formatShortcut(s)}</kbd>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">View Controls</h3>
            <div className="space-y-2">
              {categories.view.map(s => (
                <div key={s.action} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{s.description}</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-300 font-mono text-xs">{formatShortcut(s)}</kbd>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">Simulation</h3>
            <div className="space-y-2">
              {categories.simulation.map(s => (
                <div key={s.action} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{s.description}</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-300 font-mono text-xs">{formatShortcut(s)}</kbd>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">System</h3>
            <div className="space-y-2">
              {categories.system.map(s => (
                <div key={s.action} className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{s.description}</span>
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-slate-300 font-mono text-xs">{formatShortcut(s)}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Alert Panel
const AlertPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  useEffect(() => {
    setAlerts(getAlerts());
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 z-40 flex flex-col">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="font-bold text-white">Alerts & Notifications</h2>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {alerts.map(alert => {
          const config = getSeverityConfig(alert.severity);
          return (
            <div key={alert.id} className={`p-4 rounded-xl border ${config.bg} ${config.border}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${config.text}`} />
                  <span className={`text-sm font-semibold ${config.text}`}>{alert.severity.toUpperCase()}</span>
                </div>
                <span className="text-xs text-slate-500">{alert.timestamp.toLocaleTimeString()}</span>
              </div>
              <h3 className="text-white font-medium mb-1">{alert.title}</h3>
              <p className="text-sm text-slate-400">{alert.message}</p>
              {alert.zoneName && (
                <p className="text-xs text-slate-500 mt-2">Zone: {alert.zoneName}</p>
              )}
              {!alert.acknowledged && (
                <button
                  onClick={() => {
                    acknowledgeAlert(alert.id);
                    setAlerts(getAlerts());
                  }}
                  className="mt-3 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white"
                >
                  Acknowledge
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [voiceState, setVoiceState] = useState<VoiceState>({ isListening: false, isSupported: false, transcript: '', confidence: 0, error: null });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [emergencyState, setEmergencyState] = useState<EmergencyState>(getEmergencyState());
  
  const activeAlerts = getActiveAlerts();

  // Fetch weather
  useEffect(() => {
    fetchWeatherData().then(setWeather);
    const interval = setInterval(() => fetchWeatherData().then(setWeather), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Subscribe to voice state
  useEffect(() => {
    const unsubscribe = voiceService.subscribe(setVoiceState);
    return unsubscribe;
  }, []);

  // Subscribe to emergency state
  useEffect(() => {
    const unsubscribe = getEmergencyState;
    // In production, this would be a proper subscription
  }, []);

  // Register voice command handlers
  useEffect(() => {
    voiceService.registerHandler('navigate_page', (match) => {
      const page = match[1].toLowerCase();
      const routes: Record<string, string> = {
        'overview': '/',
        'parking': '/parking',
        'zones': '/zones',
        'zone': '/zones',
        'personnel': '/personnel',
        'thermal': '/thermal',
        'incident': '/explosion',
        'explosion': '/explosion',
        'alerts': '/alerts',
        'alert': '/alerts',
        'analytics': '/analytics',
        'cctv': '/cctv',
      };
      if (routes[page]) {
        navigate(routes[page]);
        voiceService.speak(`Navigating to ${page}`);
      }
    });

    voiceService.registerHandler('help', () => {
      setShowShortcuts(true);
      voiceService.speak('Showing available commands');
    });

    return () => {
      voiceService.unregisterHandler('navigate_page');
      voiceService.unregisterHandler('help');
    };
  }, [navigate]);

  // Keyboard shortcut handlers
  const shortcutHandlers = useCallback(() => ({
    'emergency:toggle': () => {
      if (emergencyState.status === 'inactive') {
        setEmergencyState(activateEmergency('drill'));
      } else {
        setEmergencyState(deactivateEmergency());
      }
    },
    'voice:toggle': () => voiceService.toggle(),
    'shortcuts:show': () => setShowShortcuts(true),
    'close': () => {
      setShowShortcuts(false);
      setShowAlerts(false);
    },
    'theme:toggle': () => setDarkMode(d => !d),
  }), [emergencyState]);

  useKeyboardShortcuts(shortcutHandlers());

  // Listen for shortcuts modal event
  useEffect(() => {
    const handler = () => setShowShortcuts(true);
    window.addEventListener('show-shortcuts', handler);
    return () => window.removeEventListener('show-shortcuts', handler);
  }, []);

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
      {/* Emergency Banner */}
      {emergencyState.status !== 'inactive' && (
        <div className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 flex items-center justify-center gap-4 ${
          emergencyState.status === 'drill' ? 'bg-cyan-600' : 'bg-red-600'
        } animate-pulse`}>
          <Shield className="w-5 h-5 text-white" />
          <span className="text-white font-bold uppercase">
            {emergencyState.status === 'drill' ? 'EMERGENCY DRILL IN PROGRESS' : 'EMERGENCY ACTIVE'}
          </span>
          <button
            onClick={() => setEmergencyState(deactivateEmergency())}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-white text-sm font-semibold"
          >
            Deactivate
          </button>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-20' : 'w-72'} transition-all duration-300 ease-in-out flex flex-col border-r ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        } backdrop-blur-xl ${emergencyState.status !== 'inactive' ? 'mt-10' : ''}`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center px-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>NEXUS</h1>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Digital Twin</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? darkMode
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                    : darkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
              {!collapsed && <span className="font-medium truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Voice Status */}
        {!collapsed && voiceState.isSupported && (
          <div className={`mx-3 mb-3 p-3 rounded-xl border ${
            voiceState.isListening 
              ? 'bg-cyan-500/10 border-cyan-500/30' 
              : darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {voiceState.isListening ? (
                <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
              ) : (
                <MicOff className="w-4 h-4 text-slate-500" />
              )}
              <span className={`text-xs font-medium ${voiceState.isListening ? 'text-cyan-400' : 'text-slate-500'}`}>
                {voiceState.isListening ? 'Listening...' : 'Voice Off'}
              </span>
            </div>
            {voiceState.transcript && voiceState.isListening && (
              <p className="text-xs text-slate-400 truncate">"{voiceState.transcript}"</p>
            )}
          </div>
        )}

        {/* Collapse Toggle */}
        <div className={`p-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
              darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 ${emergencyState.status !== 'inactive' ? 'mt-10' : ''}`}>
        {/* Top Bar */}
        <header
          className={`h-16 flex items-center justify-between px-6 border-b ${
            darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
          } backdrop-blur-xl`}
        >
          {/* Search */}
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
            <Search className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Search zones, incidents..."
              className={`bg-transparent outline-none text-sm w-64 ${
                darkMode ? 'text-white placeholder-slate-500' : 'text-slate-900 placeholder-slate-400'
              }`}
            />
            <kbd className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
              /
            </kbd>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Weather */}
            {weather && (
              <div className={`flex items-center gap-3 px-3 py-1.5 rounded-xl ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                <Cloud className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                <span className={`text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{weather.temperature}°C</span>
                <Wind className={`w-4 h-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{weather.windSpeed} m/s</span>
              </div>
            )}

            {/* Live Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-xs font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>LIVE</span>
            </div>

            {/* Voice Toggle */}
            {voiceState.isSupported && (
              <button
                onClick={() => voiceService.toggle()}
                className={`p-2 rounded-lg transition-colors ${
                  voiceState.isListening
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : darkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                title="Toggle Voice Commands (Ctrl+V)"
              >
                {voiceState.isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            )}

            {/* Shortcuts */}
            <button
              onClick={() => setShowShortcuts(true)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Keyboard Shortcuts (/)"
            >
              <Keyboard className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className={`relative p-2 rounded-lg transition-colors ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Bell className="w-5 h-5" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {activeAlerts.length}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User */}
            <div className="ml-2 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-violet-500/20">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Modals */}
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      <AlertPanel isOpen={showAlerts} onClose={() => setShowAlerts(false)} />
    </div>
  );
};

export default Layout;
