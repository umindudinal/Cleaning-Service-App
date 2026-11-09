import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export default function QuestionTable({ questions, onToggle, onEdit, onDelete }) {
  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
        <p className="font-semibold text-gray-700 text-sm">No checklist questions found</p>
        <p className="text-xs text-gray-400 mt-1">Select a customer and add questions for their inspections.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-500 text-xs font-medium">
            <th className="px-5 py-3 w-12 text-center">#</th>
            <th className="px-5 py-3">Question / Task</th>
            <th className="px-5 py-3">Customer</th>
            <th className="px-5 py-3 w-36 text-center">Status</th>
            <th className="px-5 py-3 w-24 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {questions.map((q, idx) => (
            <tr key={q.id} className="hover:bg-gray-50/60 transition-colors">
              <td className="px-5 py-3.5 text-gray-400 text-center text-xs font-medium">
                {idx + 1}
              </td>
              <td className="px-5 py-3.5">
                <p className="font-medium text-gray-900 text-xs leading-snug">{q.question_text}</p>
              </td>
              <td className="px-5 py-3.5">
                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                  {q.customer_name || 'General'}
                </span>
              </td>
              <td className="px-5 py-3.5 text-center">
                <button
                  onClick={() => onToggle(q)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    q.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                  }`}
                  title="Click to toggle"
                >
                  {q.is_active ? 'Active' : 'Disabled'}
                </button>
              </td>
              <td className="px-5 py-3.5 text-right space-x-1">
                <button
                  onClick={() => onEdit(q)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(q.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                  title="Delete"
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
