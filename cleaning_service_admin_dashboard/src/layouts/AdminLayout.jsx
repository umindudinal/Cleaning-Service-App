import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
