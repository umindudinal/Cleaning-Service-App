import React, { useState } from 'react';
import { Trash2, Mail, CalendarCheck, Copy, Check, Shield } from 'lucide-react';

export default function StaffCard({ staff, onDelete, onAssignJob }) {
  const [copiedField, setCopiedField] = useState(null);

  const copyText = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getAvatarGradient = (name = '') => {
    const gradients = [
      'from-indigo-600 to-blue-600',
      'from-blue-600 to-cyan-600',
      'from-emerald-600 to-teal-600',
      'from-purple-600 to-pink-600',
      'from-amber-500 to-orange-600',
    ];
    if (!name) return gradients[0];
    const code = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[code % gradients.length];
  };

  const name = staff.full_name || 'Staff Member';
  const gradient = getAvatarGradient(name);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-lg hover:border-blue-400/80 transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className={`w-12 h-12 rounded-2xl bg-linear-to-tr ${gradient} text-white flex items-center justify-center font-extrabold text-base shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
              {name[0].toUpperCase()}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base leading-snug tracking-tight">{name}</h4>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-slate-100 border border-slate-200/60 text-slate-700 text-[10px] rounded-full font-bold">
                  <Shield className="w-2.5 h-2.5 text-blue-600" />
                  <span>Field Cleaner</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onDelete(staff.id)}
            className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition cursor-pointer"
            title="Remove Staff Access"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Credentials / Details */}
        <div className="mt-5 space-y-2">
          {staff.email && (
            <div className="flex items-center justify-between p-2.5 bg-slate-50/80 rounded-xl border border-slate-200/60 text-xs">
              <div className="flex items-center space-x-2 text-slate-600 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate font-medium">{staff.email}</span>
              </div>
              <button
                onClick={() => copyText(staff.email, 'email')}
                className="text-slate-400 hover:text-slate-700 ml-2 cursor-pointer p-0.5"
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

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
            <span>Staff ID:</span>
            <button
              onClick={() => copyText(staff.id, 'id')}
              className="font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
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

      <div className="pt-4 border-t border-slate-100 mt-5 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-400 font-medium">
          Joined: {new Date(staff.created_at).toLocaleDateString()}
        </span>
        {onAssignJob && (
          <button
            onClick={() => onAssignJob(staff)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Dispatch Job</span>
          </button>
        )}
      </div>
    </div>
  );
}
