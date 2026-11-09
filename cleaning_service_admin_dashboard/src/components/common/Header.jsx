import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function Header({ title, subtitle, onRefresh, isRefreshing, actionButton }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 sm:px-8 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-lg font-bold text-gray-900 leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}
        {actionButton}
      </div>
    </header>
  );
}
