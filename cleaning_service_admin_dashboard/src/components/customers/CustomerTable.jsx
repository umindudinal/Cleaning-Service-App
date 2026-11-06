import React from 'react';
import { Mail, Phone, MapPin, Edit2, Trash2 } from 'lucide-react';

export default function CustomerTable({ customers, onEdit, onDelete }) {
  if (customers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
            <th className="px-6 py-4">Customer Name</th>
            <th className="px-6 py-4">Contact Info</th>
            <th className="px-6 py-4">Service Address</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50/80 transition">
              <td className="px-6 py-4 font-semibold text-slate-800 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  {c.name ? c.name[0].toUpperCase() : 'C'}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400">ID: {c.id.substring(0, 8)}...</p>
                </div>
              </td>
              <td className="px-6 py-4 space-y-1">
                <div className="flex items-center space-x-2 text-slate-600 text-xs">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>{c.email}</span>
                </div>
                {c.phone && (
                  <div className="flex items-center space-x-2 text-slate-600 text-xs">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{c.phone}</span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-slate-600 text-xs max-w-xs truncate">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span className="truncate">{c.address || 'No address registered'}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button
                  onClick={() => onEdit(c)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                  title="Edit Customer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Delete Customer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

