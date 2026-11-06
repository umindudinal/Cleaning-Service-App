import React from 'react';
import { MapPin, Trash2, CalendarCheck, FileText } from 'lucide-react';

export default function JobTable({ jobs, onDelete }) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="font-semibold text-slate-600">No jobs found</p>
        <p className="text-xs text-slate-400 mt-1">Assign a job to pair a customer with cleaning staff.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
            <th className="px-6 py-4">Customer Details</th>
            <th className="px-6 py-4">Assigned Staff</th>
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

            return (
              <tr key={j.id} className="hover:bg-slate-50/80 transition">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">{customer.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {customer.address || 'No address'}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                      {j.staff_name ? j.staff_name[0] : 'S'}
                    </div>
                    <span className="font-medium text-slate-700">{j.staff_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 text-xs">
                  {j.job_date || 'Today'}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      isDone
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {isDone ? 'COMPLETED' : 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {isDone && j.pdf_url ? (
                    <a
                      href={j.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                      title="View & Download PDF Report"
                    >
                      <FileText className="w-3.5 h-3.5 text-red-600" />
                      <span>View PDF</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Pending Completion</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(j.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
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
