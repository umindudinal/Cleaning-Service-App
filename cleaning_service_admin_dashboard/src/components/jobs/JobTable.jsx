import React from 'react';
import { MapPin, Trash2, CalendarCheck, FileText, CheckCircle2, Clock, ExternalLink } from 'lucide-react';

export default function JobTable({ jobs, onDelete }) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
        <p className="font-bold text-slate-700 text-sm">No jobs match your filter</p>
        <p className="text-xs text-slate-400 mt-1">Try resetting the search query or status filter above.</p>
      </div>
    );
  }

  const getAvatarColor = (name = '') => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-emerald-100 text-emerald-700',
      'bg-purple-100 text-purple-700',
      'bg-amber-100 text-amber-700',
      'bg-pink-100 text-pink-700',
      'bg-cyan-100 text-cyan-700',
    ];
    if (!name) return colors[0];
    const code = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[code % colors.length];
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 text-xs uppercase font-bold tracking-wider">
            <th className="px-6 py-4">Customer Details</th>
            <th className="px-6 py-4">Assigned Staff</th>
            <th className="px-6 py-4">Scheduled Date</th>
            <th className="px-6 py-4">Job Status</th>
            <th className="px-6 py-4">Inspection Report</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {jobs.map((j) => {
            const isDone = (j.status || '').toLowerCase() === 'completed';
            const customer = j.customers || {};
            const customerName = customer.name || 'Customer';
            const avatarClass = getAvatarColor(customerName);

            return (
              <tr key={j.id} className="hover:bg-slate-50/70 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${avatarClass}`}>
                      {customerName[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{customerName}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 max-w-xs truncate">
                        <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                        <span className="truncate">{customer.address || 'No service address provided'}</span>
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                      {j.staff_name ? j.staff_name[0].toUpperCase() : 'S'}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 text-xs block">{j.staff_name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Field Cleaner</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                    {j.job_date || 'Today'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isDone
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        <span>COMPLETED</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>PENDING</span>
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {isDone && j.pdf_url ? (
                    <a
                      href={j.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer group"
                      title="View & Download PDF Report"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-600" />
                      <span>View Report</span>
                      <ExternalLink className="w-3 h-3 text-red-400 group-hover:text-red-700" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span>Awaiting Inspection</span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(j.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Remove Job Assignment"
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
