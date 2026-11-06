import React, { useState } from 'react';

export default function StaffModal({ isOpen, onClose, onSave }) {
  const [form, setStaffForm] = useState({ fullName: '', email: '', password: '' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setStaffForm({ fullName: '', email: '', password: '' });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Add Cleaning Staff Member</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Suneth Silva"
              value={form.fullName}
              onChange={(e) => setStaffForm({ ...form, fullName: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Email Address * (For Mobile App Login)
            </label>
            <input
              type="email"
              required
              placeholder="e.g. staff1@cleanpro.com"
              value={form.email}
              onChange={(e) => setStaffForm({ ...form, email: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Initial Password (Default: CleanPro@123)
            </label>
            <input
              type="password"
              placeholder="CleanPro@123"
              value={form.password}
              onChange={(e) => setStaffForm({ ...form, password: e.target.value })}
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
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
              Create Staff Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

