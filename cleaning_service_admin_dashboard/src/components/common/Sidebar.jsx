import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  CalendarCheck,
  LogOut,
  Sparkles,
  ShieldCheck,
  Radio
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

  const navSections = [
    {
      label: 'CORE OPERATIONS',
      items: [
        { name: 'Overview', path: '/dashboard/overview', icon: LayoutDashboard },
        {
          name: 'Jobs & Dispatch',
          path: '/dashboard/jobs',
          icon: CalendarCheck,
          badge: pendingCount > 0 ? `${pendingCount}` : null,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
        },
      ]
    },
    {
      label: 'PROPERTY & CLIENTS',
      items: [
        { name: 'Customers', path: '/dashboard/customers', icon: Users },
        { name: 'Checklist Items', path: '/dashboard/questions', icon: ClipboardList },
      ]
    },
    {
      label: 'FIELD OPERATIONS',
      items: [
        { name: 'Cleaning Staff', path: '/dashboard/staff', icon: UserCheck },
      ]
    }
  ];

  return (
    <aside className="w-68 bg-[#0B1120] text-slate-200 flex flex-col justify-between shrink-0 border-r border-slate-800/80 shadow-2xl min-h-screen relative z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 bg-linear-to-b from-slate-900/50 to-transparent">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <BrandLogo className="w-10 h-10 shrink-0 drop-shadow-[0_4px_12px_rgba(37,99,235,0.35)]" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B1120]" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base tracking-tight text-white">JaniFlow</h1>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-linear-to-r from-blue-600 to-indigo-600 text-white tracking-wider shadow-xs">
                  DISPATCH
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Enterprise Operations</span>
              </p>
            </div>
          </div>
        </div>

        {/* Grouped Navigation Links */}
        <div className="p-3.5 space-y-6">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                {sec.label}
              </p>
              <div className="space-y-1 pt-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold border border-blue-500/40'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                        }`
                      }
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin User Profile & Sign Out */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 mb-2.5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
            {initial}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-bold text-white truncate leading-tight">{adminName}</p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">{adminEmail}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </aside>
  );
}
