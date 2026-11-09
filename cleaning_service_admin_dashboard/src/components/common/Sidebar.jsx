import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  CalendarCheck,
  LogOut
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Sidebar() {
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard/overview', icon: LayoutDashboard },
    { name: 'Customers', path: '/dashboard/customers', icon: Users },
    { name: 'Staff Members', path: '/dashboard/staff', icon: UserCheck },
    { name: 'Checklist Questions', path: '/dashboard/questions', icon: ClipboardList },
    { name: 'Jobs & Assignments', path: '/dashboard/jobs', icon: CalendarCheck },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-xl min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3.5">
          <BrandLogo className="w-10 h-10 shrink-0 drop-shadow-md" />
          <div className="truncate">
            <h1 className="font-extrabold text-lg leading-tight tracking-wide text-white">JaniFlow</h1>
            <p className="text-xs text-slate-400 font-medium">Admin Control Center</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin User Profile & Sign Out */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            {initial}
          </div>
          <div className="truncate">
            <p className="text-sm font-medium text-white truncate">{adminName}</p>
            <p className="text-xs text-slate-400 truncate">{adminEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

