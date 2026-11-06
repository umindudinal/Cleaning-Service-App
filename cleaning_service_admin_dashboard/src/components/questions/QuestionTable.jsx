import React from 'react';
import { ToggleLeft, ToggleRight, Edit2, Trash2, User } from 'lucide-react';

export default function QuestionTable({ questions, onToggle, onEdit, onDelete }) {
  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <p className="font-semibold text-slate-600">No checklist questions found.</p>
        <p className="text-xs text-slate-400 mt-1">Select a customer and add inspection questions for their cleaning tasks.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
            <th className="px-6 py-4 w-12">#</th>
            <th className="px-6 py-4">Inspection Question / Task</th>
            <th className="px-6 py-4">Assigned Customer</th>
            <th className="px-6 py-4 w-36 text-center">Status on App</th>
            <th className="px-6 py-4 w-28 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {questions.map((q, idx) => (
            <tr key={q.id} className="hover:bg-slate-50/80 transition">
              <td className="px-6 py-4 font-bold text-slate-400">{idx + 1}</td>
              <td className="px-6 py-4 font-semibold text-slate-800">
                {q.question_text}
              </td>
              <td className="px-6 py-4">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-full text-xs font-semibold">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>{q.customer_name || 'General Customer'}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onToggle(q)}
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                    q.is_active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {q.is_active ? (
                    <ToggleRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{q.is_active ? 'Active' : 'Disabled'}</span>
                </button>
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                <button
                  onClick={() => onEdit(q)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                  title="Edit Question"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(q.id)}
                  className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  title="Delete Question"
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
