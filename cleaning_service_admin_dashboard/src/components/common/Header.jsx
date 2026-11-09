import React from 'react';
import { RefreshCw, Radio, ChevronRight } from 'lucide-react';

export default function Header({ title, subtitle, onRefresh, isRefreshing, actionButton, section = 'Operations' }) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-[0_1px_2px_0_rgba(15,23,42,0.03)]">
      <div>
        <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 mb-0.5">
          <span>Portal</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-600 font-bold">{section}</span>
        </div>
        <h2 className="text-lg font-extrabold text-slate-900 leading-none tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center space-x-3">
        {/* Real-time Health Pill */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-slate-100/80 border border-slate-200 text-slate-700 rounded-full text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold">Live Cloud API</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Real-Time Data"
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-transparent hover:border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}
        {actionButton}
      </div>
    </header>
  );
}
