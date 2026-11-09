import React from 'react';
import { RefreshCw, Activity } from 'lucide-react';

export default function Header({ title, subtitle, onRefresh, isRefreshing, actionButton }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-2xs">
      <div>
        <h2 className="text-xl font-bold text-slate-800 leading-tight tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        {/* Live System Indicator */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Online</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}
        {actionButton}
      </div>
    </header>
  );
}
