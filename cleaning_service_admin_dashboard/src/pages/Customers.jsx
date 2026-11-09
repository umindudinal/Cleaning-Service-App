import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, X } from 'lucide-react';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import ConfirmModal from '../components/common/ConfirmModal';
import CustomerTable from '../components/customers/CustomerTable';
import CustomerModal from '../components/customers/CustomerModal';
import JobModal from '../components/jobs/JobModal';
import { AdminAPI } from '../services/api';
import { useRealtimeSubscription } from '../services/useRealtime';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Quick Assign Job Modal state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [targetCustomerForJob, setTargetCustomerForJob] = useState(null);

  // Delete Confirmation Modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCustomers(true);
  }, []);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadCustomers = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [custRes, staffRes] = await Promise.all([
        AdminAPI.getCustomers(),
        AdminAPI.getStaff(),
      ]);
      if (custRes.success) setCustomers(custRes.data);
      if (staffRes.success) setStaffList(staffRes.data);
    } catch (err) {
      if (showSpinner) {
        showToast('Failed to load customers.', 'error');
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // Real-time synchronization
  useRealtimeSubscription(['customers', 'staff'], () => {
    loadCustomers(false);
  });

  const handleSaveCustomer = async (formData) => {
    try {
      if (editingCustomer) {
        const res = await AdminAPI.updateCustomer(editingCustomer.id, formData);
        if (res.success) {
          showToast('Customer updated.');
          setIsModalOpen(false);
          loadCustomers();
        }
      } else {
        const res = await AdminAPI.createCustomer(formData);
        if (res.success) {
          showToast('Customer added.');
          setIsModalOpen(false);
          loadCustomers();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const handleAssignJobFromCustomer = (customer) => {
    setTargetCustomerForJob(customer);
    setIsJobModalOpen(true);
  };

  const handleSaveAssignedJob = async (formData) => {
    try {
      const res = await AdminAPI.createJob(formData);
      if (res.success) {
        showToast('Cleaning job assigned successfully.');
        setIsJobModalOpen(false);
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
        showToast('Customer deleted.');
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
    (c.address || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <Header
        title="Customers"
        subtitle="Manage customer profiles, service addresses, and assignments"
        onRefresh={loadCustomers}
        isRefreshing={loading}
        actionButton={
          <button
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        }
      />

      <Toast message={message} />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">
        {/* Search Bar Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-gray-800"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Total: <strong className="text-gray-800 font-semibold">{customers.length}</strong> customers
          </div>
        </div>

        {/* Customer Table */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-gray-400" />
            <p className="font-semibold text-gray-700 text-sm">No customers found</p>
            <p className="text-xs text-gray-400 mt-1">
              {search ? 'No clients match your search query.' : 'Click "Add Customer" to add your first customer.'}
            </p>
          </div>
        ) : (
          <CustomerTable
            customers={filteredCustomers}
            onEdit={(cust) => {
              setEditingCustomer(cust);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteCustomer}
            onAssignJob={handleAssignJobFromCustomer}
          />
        )}
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        editingCustomer={editingCustomer}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
      />

      <JobModal
        isOpen={isJobModalOpen}
        customers={customers}
        staffList={staffList}
        initialCustomerId={targetCustomerForJob?.id || ''}
        onClose={() => setIsJobModalOpen(false)}
        onSave={handleSaveAssignedJob}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This will also remove their job assignments."
        confirmText="Delete Customer"
        isLoading={isDeleting}
      />
    </div>
  );
}
