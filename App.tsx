import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview3D from './pages/Overview3D';
import ExplosionOverview from './pages/ExplosionOverview';
import ParkingStatus from './pages/ParkingStatus';
import ZoneInspection from './pages/ZoneInspection';
import PersonnelMovement from './pages/PersonnelMovement';
import ThermalComfort from './pages/ThermalComfort';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview3D />} />
          <Route path="explosion" element={<ExplosionOverview />} />
          <Route path="parking" element={<ParkingStatus />} />
          <Route path="zones" element={<ZoneInspection />} />
          <Route path="personnel" element={<PersonnelMovement />} />
          <Route path="thermal" element={<ThermalComfort />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
