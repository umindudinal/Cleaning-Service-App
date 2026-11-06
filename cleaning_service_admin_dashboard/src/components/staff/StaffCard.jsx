import React from 'react';
import { Trash2 } from 'lucide-react';

export default function StaffCard({ staff, onDelete }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
            {staff.full_name ? staff.full_name[0].toUpperCase() : 'S'}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">{staff.full_name}</h4>
            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium mt-1">
              {staff.role || 'staff'}
            </span>
          </div>
        </div>

        <button
          onClick={() => onDelete(staff.id)}
          className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition cursor-pointer"
          title="Remove Staff"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-400">
        <p>Staff ID: <code className="text-slate-600 font-mono">{staff.id.substring(0, 14)}...</code></p>
        <p className="mt-1">Joined: {new Date(staff.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

