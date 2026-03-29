import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-[#0f172a] overflow-hidden selection:bg-primary selection:text-white font-sans text-slate-300">
      
      {/* Permanent Desktop Sidebar */}
      <aside className="w-72 flex-shrink-0 border-r border-white/5 bg-[#1e293b] hidden md:block">
         <Sidebar />
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0f172a] overflow-y-auto w-full relative h-[100dvh]">
        <div className="w-full relative min-h-full">
            <Outlet />
        </div>
      </main>

    </div>
  );
};

export default MainLayout;
