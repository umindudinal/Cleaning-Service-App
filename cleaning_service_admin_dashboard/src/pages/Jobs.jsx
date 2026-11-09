import React, { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import ConfirmModal from '../components/common/ConfirmModal';
import JobTable from '../components/jobs/JobTable';
import JobModal from '../components/jobs/JobModal';
import { AdminAPI } from '../services/api';
import { useRealtimeSubscription } from '../services/useRealtime';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadJobsData(true);
  }, []);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadJobsData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [jobsRes, custRes, staffRes] = await Promise.all([
        AdminAPI.getJobs(),
        AdminAPI.getCustomers(),
        AdminAPI.getStaff(),
      ]);

      if (jobsRes.success) setJobs(jobsRes.data);
      if (custRes.success) setCustomers(custRes.data);
      if (staffRes.success) setStaffList(staffRes.data);
    } catch (err) {
      if (showSpinner) {
        showToast('Failed to load jobs data.', 'error');
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // Real-time synchronization on jobs, customers, and staff
  useRealtimeSubscription(['jobs', 'customers', 'staff'], () => {
    loadJobsData(false);
  });

  const handleAssignJob = async (formData) => {
    try {
      const res = await AdminAPI.createJob(formData);
      if (res.success) {
        showToast('Cleaning job assigned successfully.');
        setIsModalOpen(false);
        loadJobsData();
      }
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const handleDeleteJob = (id) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await AdminAPI.deleteJob(deleteTargetId);
      if (res.success) {
        showToast('Cleaning job removed.');
        setDeleteTargetId(null);
        loadJobsData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const statusMatch = filter === 'all' || (j.status || '').toLowerCase() === filter;
    if (!statusMatch) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const custName = (j.customers?.name || '').toLowerCase();
    const custAddress = (j.customers?.address || '').toLowerCase();
    const staff = (j.staff_name || '').toLowerCase();
    const date = (j.job_date || '').toLowerCase();

    return custName.includes(q) || custAddress.includes(q) || staff.includes(q) || date.includes(q);
  });

  const pendingCount = jobs.filter((j) => (j.status || '').toLowerCase() !== 'completed').length;
  const completedCount = jobs.filter((j) => (j.status || '').toLowerCase() === 'completed').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <Header
        title="Jobs"
        subtitle="Schedule and track cleaning visits"
        onRefresh={loadJobsData}
        isRefreshing={loading}
        actionButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Job</span>
          </button>
        }
      />

      <Toast message={message} />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({jobs.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filter === 'pending'
                  ? 'bg-amber-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filter === 'completed'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer, staff, or address..."
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
        </div>

        {/* Jobs Table */}
        <JobTable jobs={filteredJobs} onDelete={handleDeleteJob} />
      </div>

      <JobModal
        isOpen={isModalOpen}
        customers={customers}
        staffList={staffList}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAssignJob}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Cleaning Job"
        message="Are you sure you want to remove this cleaning job assignment?"
        confirmText="Remove Job"
        isLoading={isDeleting}
      />
    </div>
  );
}
