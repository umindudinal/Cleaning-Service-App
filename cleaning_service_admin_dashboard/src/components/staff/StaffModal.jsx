import React, { useState } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';

export default function StaffModal({ isOpen, onClose, onSave }) {
  const [form, setStaffForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Please provide staff name and login email.');
      return;
    }
    setError('');
    onSave(form);
    setStaffForm({ fullName: '', email: '', password: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Add Staff Member</h3>
              <p className="text-xs text-gray-400">Mobile app login for cleaning staff</p>
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">Staff Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Kamal Perera"
              value={form.fullName}
              onChange={(e) => setStaffForm({ ...form, fullName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address * (Mobile App Login)
            </label>
            <input
              type="email"
              required
              placeholder="e.g. kamal@clean.com"
              value={form.email}
              onChange={(e) => setStaffForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Initial Password (Optional)
            </label>
            <input
              type="password"
              placeholder="Default: CleanPro@123"
              value={form.password}
              onChange={(e) => setStaffForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-900"
            />
            <p className="text-[11px] text-gray-400 mt-1">Leave empty to use temporary password <code>CleanPro@123</code>.</p>
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
              Add Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
