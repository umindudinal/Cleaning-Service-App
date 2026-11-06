import React, { useState, useEffect } from 'react';

export default function QuestionModal({ isOpen, onClose, onSave, editingQuestion, customers = [] }) {
  const [form, setForm] = useState({ questionText: '', customerId: '', isActive: true });

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
        customerId: customers[0]?.id || '',
        isActive: true,
      });
    }
  }, [editingQuestion, isOpen, customers]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customerId) {
      alert('Please select a customer for this inspection question');
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          {editingQuestion ? 'Edit Inspection Question' : 'Add Customer Specific Question'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Select Customer *
            </label>
            <select
              required
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.address ? `(${c.address})` : `(${c.email})`}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              This inspection item will only appear for this customer's tasks.
            </p>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Inspection Question / Checklist Item *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Was the master bedroom vacuumed?"
              value={form.questionText}
              onChange={(e) => setForm({ ...form, questionText: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
              Active (Show on Mobile App checklist)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow cursor-pointer"
            >
              Save Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
