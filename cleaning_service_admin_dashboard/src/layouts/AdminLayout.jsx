import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
