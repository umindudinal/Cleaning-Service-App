import React, { useState, useEffect } from 'react';
import { Plus, Search, CalendarCheck, X } from 'lucide-react';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import ConfirmModal from '../components/common/ConfirmModal';
import JobTable from '../components/jobs/JobTable';
import JobModal from '../components/jobs/JobModal';
import { AdminAPI } from '../services/api';

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
    loadJobsData();
  }, []);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadJobsData = async () => {
    setLoading(true);
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
      showToast('Failed to load jobs data from backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignJob = async (formData) => {
    try {
      const res = await AdminAPI.createJob(formData);
      if (res.success) {
        showToast('Cleaning job assigned to staff successfully!');
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
        showToast('Cleaning job removed successfully!');
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
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
      <Header
        section="Dispatch Center"
        title="Jobs & Task Assignments"
        subtitle="Schedule property cleaning visits, track cleaner field progress & review inspection reports"
        onRefresh={loadJobsData}
        isRefreshing={loading}
        actionButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Job</span>
          </button>
        }
      />

      <Toast message={message} />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
        {/* Apple-style Segmented Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
          {/* Segmented Control Bar */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60 w-full sm:w-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Jobs ({jobs.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'pending'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === 'completed'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer, staff, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9.5 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
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
        title="Cancel Cleaning Job"
        message="Are you sure you want to cancel or remove this cleaning job assignment?"
        confirmText="Remove Job"
        isLoading={isDeleting}
      />
    </div>
  );
}
