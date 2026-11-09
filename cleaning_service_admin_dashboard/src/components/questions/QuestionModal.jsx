import React, { useState, useEffect } from 'react';
import { X, ClipboardList, AlertCircle } from 'lucide-react';

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
      setError('Please select a customer.');
      return;
    }
    if (!form.questionText.trim()) {
      setError('Please enter the question or inspection task.');
      return;
    }
    setError('');
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {editingQuestion ? 'Edit Question' : 'Add Inspection Question'}
              </h3>
              <p className="text-xs text-gray-400">Task for the mobile inspection checklist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Customer *</label>
            <select
              required
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white text-gray-900"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.address ? `(${c.address})` : `(${c.email})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Inspection Question / Task *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Master bedroom vacuumed and mopped"
              value={form.questionText}
              onChange={(e) => setForm({ ...form, questionText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-900"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-medium text-gray-700 cursor-pointer">
              Active (show on mobile app checklist)
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              {editingQuestion ? 'Save Changes' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
