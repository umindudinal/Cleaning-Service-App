import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to cancel / delete this cleaning job?')) return;
    try {
      const res = await AdminAPI.deleteJob(id);
      if (res.success) {
        showToast('Cleaning job removed successfully!');
        loadJobsData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (filter === 'all') return true;
    return (j.status || '').toLowerCase() === filter;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Jobs & Task Assignments"
        subtitle="Assign cleaning jobs to staff and track real-time task completion"
        onRefresh={loadJobsData}
        isRefreshing={loading}
        actionButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Job</span>
          </button>
        }
      />

      <Toast message={message} />

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Status Filter Chips */}
        <div className="flex items-center space-x-2">
          {['all', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f} ({jobs.filter((j) => f === 'all' || (j.status || '').toLowerCase() === f).length})
            </button>
          ))}
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
    </div>
  );
}

