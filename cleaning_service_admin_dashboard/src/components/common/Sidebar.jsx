import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  UserCheck,
  ClipboardList,
  LogOut
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { AdminAPI } from '../../services/api';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  const adminUser = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('adminUser');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const adminName = adminUser?.full_name || 'System Admin';
  const adminEmail = adminUser?.email || 'admin@clean.com';
  const initial = adminName ? adminName[0].toUpperCase() : 'A';

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

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

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

      {/* Admin Profile & Logout */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs shrink-0 border border-gray-200">
            {initial}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-900 truncate leading-tight">{adminName}</p>
            <p className="text-[11px] text-gray-500 truncate">{adminEmail}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
