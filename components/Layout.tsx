import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
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
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '3D Overview' },
  { path: '/explosion', icon: AlertTriangle, label: 'Incident Monitor' },
  { path: '/parking', icon: Car, label: 'Parking Status' },
  { path: '/zones', icon: Building2, label: 'Zone Inspection' },
  { path: '/personnel', icon: Users, label: 'Personnel Movement' },
  { path: '/thermal', icon: Thermometer, label: 'Thermal Comfort' },
];

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-72'
        } transition-all duration-300 ease-in-out flex flex-col border-r ${
          darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        } backdrop-blur-xl`}
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
        <nav className="flex-1 py-6 px-3 space-y-1">
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
      <div className="flex-1 flex flex-col min-w-0">
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
            <kbd className={`text-xs px-2 py-0.5 rounded ${darkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>⌘K</kbd>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Live Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-xs font-medium ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>LIVE</span>
            </div>

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
              className={`relative p-2 rounded-lg transition-colors ${
                darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
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
    </div>
  );
};

export default Layout;

