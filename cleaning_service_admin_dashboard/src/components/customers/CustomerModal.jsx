import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';

export default function CustomerModal({ isOpen, onClose, onSave, editingCustomer }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingCustomer) {
      setForm({
        name: editingCustomer.name || '',
        email: editingCustomer.email || '',
        phone: editingCustomer.phone || '',
        address: editingCustomer.address || '',
      });
    } else {
      setForm({ name: '', email: '', phone: '', address: '' });
    }
    setError('');
  }, [editingCustomer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Customer name and email address are required.');
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
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {editingCustomer ? 'Edit Customer' : 'Add Customer'}
              </h3>
              <p className="text-xs text-gray-400">Customer contact and service location</p>
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
            <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Email Address * (Report recipient)
            </label>
            <input
              type="email"
              required
              placeholder="e.g. john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g. 0771234567"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Service Address</label>
            <textarea
              rows={2}
              placeholder="e.g. 123 Main Street, City"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none text-gray-900"
            />
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
              {editingCustomer ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
