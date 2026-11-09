import React, { useState } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';

export default function StaffModal({ isOpen, onClose, onSave }) {
  const [form, setStaffForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      setError('Please provide staff member name and login email.');
      return;
    }
    setError('');
    onSave(form);
    setStaffForm({ fullName: '', email: '', password: '' });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Add Cleaning Staff</h3>
              <p className="text-xs text-slate-400">Create login account for JaniFlow Mobile App</p>
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
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Staff Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Kamal Perera"
              value={form.fullName}
              onChange={(e) => setStaffForm({ ...form, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Email Address * (For Mobile App Login)
            </label>
            <input
              type="email"
              required
              placeholder="e.g. kamal@clean.com"
              value={form.email}
              onChange={(e) => setStaffForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Initial Password (Default: CleanPro@123)
            </label>
            <input
              type="password"
              placeholder="Leave empty for CleanPro@123"
              value={form.password}
              onChange={(e) => setStaffForm({ ...form, password: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
            />
            <p className="text-[11px] text-slate-400 mt-1">If empty, default temporary password <code>CleanPro@123</code> is used.</p>
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
              Create Staff Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
