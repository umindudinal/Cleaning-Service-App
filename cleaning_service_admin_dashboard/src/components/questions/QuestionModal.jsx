import React, { useState, useEffect } from 'react';
import { X, ClipboardList, AlertCircle, Sparkles } from 'lucide-react';

const COMMON_QUESTION_TEMPLATES = [
  'Kitchen counters, stovetop and sink thoroughly sanitized',
  'All hard floors swept, vacuumed and damp-mopped',
  'Bathroom mirrors, toilet, and shower fixtures disinfected',
  'Trash receptacles emptied and fresh liners installed',
  'Carpets and rugs thoroughly vacuumed in all rooms',
  'Doors and windows closed and securely locked',
];

export default function QuestionModal({ isOpen, onClose, onSave, editingQuestion, customers = [], initialCustomerId = '' }) {
  const [form, setForm] = useState({ questionText: '', customerId: '', isActive: true });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingQuestion) {
      setForm({
        questionText: editingQuestion.question_text || '',
        customerId: editingQuestion.customer_id || '',
        isActive: editingQuestion.is_active ?? true,
      });
    } else {
      setForm({
        questionText: '',
        customerId: initialCustomerId || customers[0]?.id || '',
        isActive: true,
      });
    }
    setError('');
  }, [editingQuestion, isOpen, customers, initialCustomerId]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customerId) {
      setError('Please select a customer for this inspection question.');
      return;
    }
    if (!form.questionText.trim()) {
      setError('Please enter the question or checklist task description.');
      return;
    }
    setError('');
    onSave(form);
  };

  const handleApplyTemplate = (text) => {
    setForm((prev) => ({ ...prev, questionText: text }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {editingQuestion ? 'Edit Inspection Checklist Item' : 'Add Checklist Question to Customer'}
              </h3>
              <p className="text-xs text-slate-400">Shows on JaniFlow mobile app for this client</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3.5 py-2 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Select Client *
            </label>
            <select
              required
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-slate-800"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.address ? `• ${c.address}` : `(${c.email})`}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              This task will be automatically included in the inspection report for this property.
            </p>
          </div>

          {/* Quick Template Suggestions */}
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Quick Template Suggestions (Click to fill)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_QUESTION_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="text-[11px] font-medium px-2.5 py-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg transition text-left cursor-pointer"
                >
                  + {tmpl}
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Inspection Question / Checklist Item *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Was the master bedroom vacuumed and mopped?"
              value={form.questionText}
              onChange={(e) => setForm({ ...form, questionText: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-medium"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-bold text-slate-700 cursor-pointer">
              Active (Visible on JaniFlow Mobile App checklist)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition cursor-pointer"
            >
              {editingQuestion ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
