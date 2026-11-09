import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, LogOut, ChevronDown, User, Shield } from 'lucide-react';

export default function Header({ title, subtitle, onRefresh, isRefreshing, actionButton }) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const adminUser = useMemo(() => {
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 sm:px-8 flex items-center justify-between shrink-0 relative z-30">
      <div>
        <h2 className="text-lg font-bold text-gray-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}

        {actionButton}

        {/* Subtle Divider */}
        <div className="h-6 w-px bg-gray-200 mx-1" />

        {/* Top Bar Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2.5 p-1.5 pl-2 pr-2.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200 shrink-0">
              {initial}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight truncate max-w-[120px]">
                {adminName}
              </p>
              <p className="text-[10px] text-gray-400 font-medium leading-tight">Admin</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {/* Profile Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-bold text-gray-900 truncate">{adminName}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
              </div>

              <div className="p-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
