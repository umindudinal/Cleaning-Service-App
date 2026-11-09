import React, { useState, useEffect } from 'react';
import { X, CalendarCheck, AlertCircle } from 'lucide-react';

// Get local date formatted as YYYY-MM-DD (matches user's local timezone, avoids UTC shift bug)
const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function JobModal({ isOpen, onClose, onSave, customers = [], staffList = [], initialCustomerId = '', initialStaffId = '' }) {
  const todayStr = getLocalDateString();

  const [form, setForm] = useState({
    customerId: '',
    staffId: '',
    jobDate: todayStr,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const currentToday = getLocalDateString();
      setForm({
        customerId: initialCustomerId || customers[0]?.id || '',
        staffId: initialStaffId || staffList[0]?.id || '',
        jobDate: currentToday,
      });
      setError('');
    }
  }, [isOpen, initialCustomerId, initialStaffId, customers, staffList]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customerId || !form.staffId) {
      setError('Please select both a Customer and a Staff member.');
      return;
    }
    const currentToday = getLocalDateString();
    if (form.jobDate < currentToday) {
      setError('Scheduled date cannot be in the past. Please select today or a future date.');
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
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Assign Job</h3>
              <p className="text-xs text-gray-400">Schedule cleaning visit for a customer</p>
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">Cleaning Staff *</label>
            <select
              required
              value={form.staffId}
              onChange={(e) => setForm({ ...form, staffId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white text-gray-900"
            >
              <option value="">-- Choose Staff Member --</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.email || 'Staff'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Visit Date *</label>
            <input
              type="date"
              required
              min={todayStr}
              value={form.jobDate}
              onChange={(e) => {
                const val = e.target.value;
                if (val && val < todayStr) {
                  setError('Scheduled date cannot be in the past. Please select today or a future date.');
                } else {
                  setError('');
                }
                setForm({ ...form, jobDate: val });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white text-gray-900"
            />
            <p className="text-[11px] text-gray-400 mt-1">Must be today or a future date.</p>
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
              Assign Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
