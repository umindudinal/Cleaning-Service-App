import React from 'react';
import { Edit2, Trash2, User, Check, X } from 'lucide-react';

export default function QuestionTable({ questions, onToggle, onEdit, onDelete }) {
  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
        <p className="font-bold text-slate-700 text-sm">No checklist questions found</p>
        <p className="text-xs text-slate-400 mt-1">Select a customer and add inspection questions for their cleaning tasks.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 text-xs uppercase font-bold tracking-wider">
            <th className="px-6 py-4 w-12 text-center">#</th>
            <th className="px-6 py-4">Inspection Checklist Task</th>
            <th className="px-6 py-4">Assigned Client</th>
            <th className="px-6 py-4 w-40 text-center">App Visibility</th>
            <th className="px-6 py-4 w-28 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {questions.map((q, idx) => (
            <tr key={q.id} className="hover:bg-slate-50/70 transition">
              <td className="px-6 py-4 font-bold text-slate-400 text-center text-xs">{idx + 1}</td>
              <td className="px-6 py-4">
                <p className="font-bold text-slate-800 text-sm leading-snug">{q.question_text}</p>
              </td>
              <td className="px-6 py-4">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-full text-xs font-semibold">
                  <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate max-w-[180px]">{q.customer_name || 'General Customer'}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onToggle(q)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                    q.is_active
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  title="Click to toggle mobile app checklist visibility"
                >
                  <span className={`w-2 h-2 rounded-full ${q.is_active ? 'bg-green-600' : 'bg-slate-400'}`} />
                  <span>{q.is_active ? 'Active' : 'Disabled'}</span>
                </button>
              </td>
              <td className="px-6 py-4 text-right space-x-1">
                <button
                  onClick={() => onEdit(q)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                  title="Edit Question"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(q.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
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
