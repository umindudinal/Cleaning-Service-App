import React from 'react';
import { MapPin, Trash2, CalendarCheck, FileText, ExternalLink } from 'lucide-react';

export default function JobTable({ jobs, onDelete }) {
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-30 text-gray-400" />
        <p className="font-semibold text-gray-700 text-sm">No jobs match your filter</p>
        <p className="text-xs text-gray-400 mt-1">Try clearing the search query or status filter.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-500 text-xs font-medium">
            <th className="px-5 py-3">Customer</th>
            <th className="px-5 py-3">Assigned Staff</th>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Inspection Report</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {jobs.map((j) => {
            const isDone = (j.status || '').toLowerCase() === 'completed';
            const customer = j.customers || {};

            return (
              <tr key={j.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-gray-900 text-xs">{customer.name || 'Customer'}</p>
                  {customer.address && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate max-w-xs">
                      <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
                      <span className="truncate">{customer.address}</span>
                    </p>
                  )}
                </td>

                <td className="px-5 py-3.5 text-xs text-gray-700 font-medium">
                  {j.staff_name || 'Unassigned'}
                </td>

                <td className="px-5 py-3.5 text-xs text-gray-500">
                  {j.job_date || 'Today'}
                </td>

                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isDone ? 'Completed' : 'Pending'}
                  </span>
                </td>

                <td className="px-5 py-3.5">
                  {isDone && j.pdf_url ? (
                    <a
                      href={j.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-md text-xs font-medium transition cursor-pointer"
                      title="View PDF Report"
                    >
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      <span>View PDF</span>
                      <ExternalLink className="w-3 h-3 text-gray-400" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Not completed</span>
                  )}
                </td>

                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => onDelete(j.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
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
