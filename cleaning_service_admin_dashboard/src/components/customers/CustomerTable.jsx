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

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-500 text-xs font-medium">
            <th className="px-5 py-3">Customer</th>
            <th className="px-5 py-3">Contact</th>
            <th className="px-5 py-3">Address</th>
            <th className="px-5 py-3 text-center">Dispatch</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
              <td className="px-5 py-3.5">
                <p className="font-semibold text-gray-900 text-xs">{c.name}</p>
                <button
                  onClick={() => copyText(c.id, `id-${c.id}`)}
                  className="text-[11px] text-gray-400 hover:text-gray-600 flex items-center gap-1 font-mono cursor-pointer mt-0.5"
                  title="Copy client ID"
                >
                  <span>ID: {c.id.substring(0, 8)}...</span>
                  {copiedId === `id-${c.id}` ? (
                    <Check className="w-2.5 h-2.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-2.5 h-2.5 opacity-60" />
                  )}
                </button>
              </td>

              <td className="px-5 py-3.5 space-y-1">
                <div className="flex items-center space-x-1.5 text-gray-600 text-xs">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <button
                    onClick={() => copyText(c.email, `email-${c.id}`)}
                    className="hover:underline hover:text-blue-600 font-medium cursor-pointer flex items-center gap-1 truncate"
                  >
                    <span>{c.email}</span>
                    {copiedId === `email-${c.id}` && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                  </button>
                </div>
                {c.phone && (
                  <div className="flex items-center space-x-1.5 text-gray-600 text-xs">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <button
                      onClick={() => copyText(c.phone, `phone-${c.id}`)}
                      className="hover:underline hover:text-blue-600 font-medium cursor-pointer flex items-center gap-1"
                    >
                      <span>{c.phone}</span>
                      {copiedId === `phone-${c.id}` && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                    </button>
                  </div>
                )}
              </td>

              <td className="px-5 py-3.5 text-gray-600 text-xs max-w-xs">
                <div className="flex items-start space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{c.address || 'No address registered'}</span>
                </div>
              </td>

              <td className="px-5 py-3.5 text-center">
                <div className="flex items-center justify-center space-x-1.5">
                  {onAssignJob && (
                    <button
                      onClick={() => onAssignJob(c)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition cursor-pointer"
                      title="Assign job to this customer"
                    >
                      <CalendarCheck className="w-3.5 h-3.5 text-gray-500" />
                      <span>Assign Job</span>
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/dashboard/questions')}
                    className="p-1 bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 rounded-md text-xs transition cursor-pointer"
                    title="View Questions"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>

              <td className="px-5 py-3.5 text-right space-x-1">
                <button
                  onClick={() => onEdit(c)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                  title="Edit Customer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(c.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                  title="Delete Customer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
