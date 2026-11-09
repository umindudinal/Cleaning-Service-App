import React, { useState } from 'react';
import { Mail, Phone, MapPin, Edit2, Trash2, CalendarCheck, ClipboardList, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CustomerTable({ customers, onEdit, onDelete, onAssignJob }) {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(null);

  if (customers.length === 0) {
    return null;
  }

  const copyText = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getAvatarGradient = (name = '') => {
    const gradients = [
      'from-blue-600 to-indigo-600',
      'from-emerald-600 to-teal-600',
      'from-purple-600 to-pink-600',
      'from-amber-500 to-orange-600',
      'from-cyan-600 to-blue-600',
    ];
    if (!name) return gradients[0];
    const code = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[code % gradients.length];
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-400 text-[11px] uppercase font-bold tracking-wider">
            <th className="px-6 py-4">Client Details</th>
            <th className="px-6 py-4">Contact Information</th>
            <th className="px-6 py-4">Registered Service Address</th>
            <th className="px-6 py-4 text-center">Field Actions</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customers.map((c) => {
            const gradient = getAvatarGradient(c.name);

            return (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl bg-linear-to-tr ${gradient} text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0`}>
                      {c.name ? c.name[0].toUpperCase() : 'C'}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm tracking-tight">{c.name}</p>
                      <button
                        onClick={() => copyText(c.id, `id-${c.id}`)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1 font-mono cursor-pointer mt-0.5"
                        title="Copy full client ID"
                      >
                        <span>ID: {c.id.substring(0, 8)}...</span>
                        {copiedId === `id-${c.id}` ? (
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 opacity-60" />
                        )}
                      </button>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 space-y-1">
                  <div className="flex items-center space-x-2 text-slate-600 text-xs">
                    <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <button
                      onClick={() => copyText(c.email, `email-${c.id}`)}
                      className="hover:underline hover:text-blue-600 font-medium cursor-pointer flex items-center gap-1"
                    >
                      <span>{c.email}</span>
                      {copiedId === `email-${c.id}` && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                    </button>
                  </div>
                  {c.phone && (
                    <div className="flex items-center space-x-2 text-slate-600 text-xs">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <button
                        onClick={() => copyText(c.phone, `phone-${c.id}`)}
                        className="hover:underline hover:text-emerald-600 font-medium cursor-pointer flex items-center gap-1"
                      >
                        <span>{c.phone}</span>
                        {copiedId === `phone-${c.id}` && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                      </button>
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 text-slate-600 text-xs max-w-xs">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <span className="leading-snug">{c.address || 'No service address registered'}</span>
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-1.5">
                    {onAssignJob && (
                      <button
                        onClick={() => onAssignJob(c)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                        title="Assign Job to this Customer"
                      >
                        <CalendarCheck className="w-3.5 h-3.5" />
                        <span>Assign Job</span>
                      </button>
                    )}
                    <button
                      onClick={() => navigate('/dashboard/questions')}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                      title="View Questions for this Customer"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>

                <td className="px-6 py-4 text-right space-x-1">
                  <button
                    onClick={() => onEdit(c)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                    title="Edit Customer Details"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
