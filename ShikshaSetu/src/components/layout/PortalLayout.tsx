import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { Sidebar } from '../common/Sidebar';
import { BottomNavigation } from '../common/BottomNavigation';
import { LowBandwidthBanner } from '../common/LowBandwidthBanner';

export const PortalLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 pb-16 lg:pb-0">
      <LowBandwidthBanner />
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
};
