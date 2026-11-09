import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  UserCheck,
  ClipboardList
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { AdminAPI } from '../../services/api';

export default function Sidebar() {
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    AdminAPI.getStats()
      .then((res) => {
        if (mounted && res.success && res.data?.pendingJobs !== undefined) {
          setPendingCount(res.data.pendingJobs);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const navItems = [
    { name: 'Overview', path: '/dashboard/overview', icon: LayoutDashboard },
    {
      name: 'Jobs',
      path: '/dashboard/jobs',
      icon: CalendarCheck,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { name: 'Customers', path: '/dashboard/customers', icon: Users },
    { name: 'Staff', path: '/dashboard/staff', icon: UserCheck },
    { name: 'Inspection Questions', path: '/dashboard/questions', icon: ClipboardList },
  ];

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-gray-200 flex items-center space-x-3">
          <BrandLogo className="w-8 h-8 shrink-0" />
          <div className="truncate">
            <h1 className="font-bold text-sm text-gray-900 leading-tight">JaniFlow</h1>
            <p className="text-xs text-gray-400">Cleaning Management</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer subtle brand / app info */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 text-center font-medium">JaniFlow Portal v1.0</p>
      </div>
    </aside>
  );
}
