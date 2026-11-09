import React, { useState, useEffect } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import ConfirmModal from '../components/common/ConfirmModal';
import CustomerTable from '../components/customers/CustomerTable';
import CustomerModal from '../components/customers/CustomerModal';
import { AdminAPI } from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Delete Confirmation Modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await AdminAPI.getCustomers();
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      showToast('Failed to load customers from backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomer = async (formData) => {
    try {
      if (editingCustomer) {
        const res = await AdminAPI.updateCustomer(editingCustomer.id, formData);
        if (res.success) {
          showToast('Customer updated successfully!');
          setIsModalOpen(false);
          loadCustomers();
        }
      } else {
        const res = await AdminAPI.createCustomer(formData);
        if (res.success) {
          showToast('Customer added successfully!');
          setIsModalOpen(false);
          loadCustomers();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const handleDeleteCustomer = (id) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await AdminAPI.deleteCustomer(deleteTargetId);
      if (res.success) {
        showToast('Customer deleted successfully!');
        setDeleteTargetId(null);
        loadCustomers();
      }
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.address || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Customer Management"
        subtitle="Add, edit, and manage cleaning clients and service locations"
        onRefresh={loadCustomers}
        isRefreshing={loading}
        actionButton={
          <button
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        }
      />

      <Toast message={message} />

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-slate-500">
            Total: <strong className="text-slate-800">{customers.length}</strong> customers
          </div>
        </div>

        {/* Customer Table */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-slate-600">No customers found</p>
            <p className="text-xs text-slate-400 mt-1">Click "Add Customer" to register a new client.</p>
          </div>
        ) : (
          <CustomerTable
            customers={filteredCustomers}
            onEdit={(cust) => {
              setEditingCustomer(cust);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteCustomer}
          />
        )}
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        editingCustomer={editingCustomer}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? All associated jobs and checklists will be affected."
        confirmText="Delete Customer"
        isLoading={isDeleting}
      />
    </div>
  );
}

