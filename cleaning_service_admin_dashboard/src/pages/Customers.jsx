import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, X } from 'lucide-react';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import ConfirmModal from '../components/common/ConfirmModal';
import CustomerTable from '../components/customers/CustomerTable';
import CustomerModal from '../components/customers/CustomerModal';
import JobModal from '../components/jobs/JobModal';
import { AdminAPI } from '../services/api';

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
    loadCustomers();
  }, []);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const [custRes, staffRes] = await Promise.all([
        AdminAPI.getCustomers(),
        AdminAPI.getStaff(),
      ]);
      if (custRes.success) setCustomers(custRes.data);
      if (staffRes.success) setStaffList(staffRes.data);
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

  const handleAssignJobFromCustomer = (customer) => {
    setTargetCustomerForJob(customer);
    setIsJobModalOpen(true);
  };

  const handleSaveAssignedJob = async (formData) => {
    try {
      const res = await AdminAPI.createJob(formData);
      if (res.success) {
        showToast('Cleaning job assigned successfully for this customer!');
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
    (c.address || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
      <Header
        section="Clients & Properties"
        title="Customer Directory"
        subtitle="Manage client accounts, service locations & direct job dispatching"
        onRefresh={loadCustomers}
        isRefreshing={loading}
        actionButton={
          <button
            onClick={() => {
              setEditingCustomer(null);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        }
      />

      <Toast message={message} />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
        {/* Search Bar Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, address or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredCustomers.length}</strong> of{' '}
            <strong className="text-slate-800">{customers.length}</strong> registered clients
          </div>
        </div>

        {/* Customer Table */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
            <p className="font-bold text-slate-700 text-sm">No customers found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search ? 'No clients match your search criteria.' : 'Click "Add Customer" above to register your first client.'}
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

      {/* Quick Assign Job Modal directly from customer row */}
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
        message="Are you sure you want to permanently delete this customer? All their associated checklist items and job history will be removed."
        confirmText="Delete Customer"
        isLoading={isDeleting}
      />
    </div>
  );
}
