import React from 'react';
import { MapPin, Trash2, CalendarCheck, FileText, CheckCircle2, Clock, ExternalLink, User } from 'lucide-react';

export default function JobTable({ jobs, onDelete }) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200/60">
          <CalendarCheck className="w-6 h-6" />
        </div>
        <p className="font-extrabold text-slate-700 text-sm">No jobs match your filter</p>
        <p className="text-xs text-slate-400 mt-1">Try adjusting the search query or status filter above.</p>
      </div>
    );
  }

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
            <th className="px-6 py-4">Customer Location</th>
            <th className="px-6 py-4">Assigned Personnel</th>
            <th className="px-6 py-4">Scheduled Date</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Inspection Report</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {jobs.map((j) => {
            const isDone = (j.status || '').toLowerCase() === 'completed';
            const customer = j.customers || {};
            const customerName = customer.name || 'Customer';
            const gradient = getAvatarGradient(customerName);

            return (
              <tr key={j.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl bg-linear-to-tr ${gradient} text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0`}>
                      {customerName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm tracking-tight">{customerName}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 max-w-xs truncate">
                        <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                        <span className="truncate">{customer.address || 'No service address provided'}</span>
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                      {j.staff_name ? j.staff_name[0].toUpperCase() : 'S'}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs block leading-tight">{j.staff_name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Field Cleaner</span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 bg-slate-100/80 border border-slate-200/60 text-slate-700 rounded-lg text-xs font-semibold">
                    {j.job_date || 'Today'}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span>{isDone ? 'COMPLETED' : 'PENDING'}</span>
                  </span>
                </td>

                <td className="px-6 py-4">
                  {isDone && j.pdf_url ? (
                    <a
                      href={j.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer group"
                      title="View & Download PDF Report"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-600" />
                      <span>View PDF</span>
                      <ExternalLink className="w-3 h-3 text-red-400 group-hover:text-red-700" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      <span>In Field</span>
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(j.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Remove Job"
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
