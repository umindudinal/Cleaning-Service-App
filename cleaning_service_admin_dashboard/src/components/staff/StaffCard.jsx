import React, { useState } from 'react';
import { Trash2, Mail, CalendarCheck, Copy, Check } from 'lucide-react';

export default function StaffCard({ staff, onDelete, onAssignJob }) {
  const [copiedField, setCopiedField] = useState(null);

  const copyText = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const name = staff.full_name || 'Staff Member';

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between hover:border-gray-300 transition-colors">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm shrink-0">
              {name[0].toUpperCase()}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm leading-tight">{name}</h4>
              <span className="text-[11px] text-gray-500 font-medium">Cleaning Staff</span>
            </div>
          </div>

          <button
            onClick={() => onDelete(staff.id)}
            className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-md transition cursor-pointer"
            title="Remove Staff"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Details */}
        <div className="mt-4 space-y-2">
          {staff.email && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100 text-xs">
              <div className="flex items-center space-x-1.5 text-gray-600 truncate">
                <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate">{staff.email}</span>
              </div>
              <button
                onClick={() => copyText(staff.email, 'email')}
                className="text-gray-400 hover:text-gray-600 ml-1.5 cursor-pointer p-0.5"
                title="Copy Email"
              >
                {copiedField === 'email' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
            <span>ID:</span>
            <button
              onClick={() => copyText(staff.id, 'id')}
              className="font-mono text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
              title="Click to copy full ID"
            >
              <span>{staff.id.substring(0, 10)}...</span>
              {copiedField === 'id' ? (
                <Check className="w-2.5 h-2.5 text-emerald-600" />
              ) : (
                <Copy className="w-2.5 h-2.5 opacity-60" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 mt-4 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">
          Joined: {new Date(staff.created_at).toLocaleDateString()}
        </span>
        {onAssignJob && (
          <button
            onClick={() => onAssignJob(staff)}
            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-gray-500" />
            <span>Assign Job</span>
          </button>
        )}
      </div>
    </div>
  );
}
