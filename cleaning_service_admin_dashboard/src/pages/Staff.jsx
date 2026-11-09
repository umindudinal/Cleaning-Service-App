import React, { useState, useEffect } from 'react';
import { Plus, UserCheck, Search, X } from 'lucide-react';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import ConfirmModal from '../components/common/ConfirmModal';
import StaffCard from '../components/staff/StaffCard';
import StaffModal from '../components/staff/StaffModal';
import JobModal from '../components/jobs/JobModal';
import { AdminAPI } from '../services/api';

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Assign Job Modal
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [targetStaffForJob, setTargetStaffForJob] = useState(null);

  useEffect(() => {
    loadStaff();
  }, []);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadStaff = async () => {
    setLoading(true);
    try {
      const [staffRes, custRes] = await Promise.all([
        AdminAPI.getStaff(),
        AdminAPI.getCustomers(),
      ]);
      if (staffRes.success) setStaffList(staffRes.data);
      if (custRes.success) setCustomers(custRes.data);
    } catch (err) {
      showToast('Failed to load staff list from backend.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStaff = async (formData) => {
    try {
      const res = await AdminAPI.createStaff(formData);
      if (res.success) {
        showToast('Staff member added successfully!');
        setIsModalOpen(false);
        loadStaff();
      }
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const handleAssignJobToStaff = (staff) => {
    setTargetStaffForJob(staff);
    setIsJobModalOpen(true);
  };

  const handleSaveAssignedJob = async (formData) => {
    try {
      const res = await AdminAPI.createJob(formData);
      if (res.success) {
        showToast('Cleaning job assigned to staff successfully!');
        setIsJobModalOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const handleDeleteStaff = (id) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await AdminAPI.deleteStaff(deleteTargetId);
      if (res.success) {
        showToast('Staff member removed successfully!');
        setDeleteTargetId(null);
        loadStaff();
      }
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredStaff = staffList.filter((s) =>
    (s.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
      <Header
        section="Field Personnel"
        title="Cleaning Staff Roster"
        subtitle="Manage active field cleaning personnel & JaniFlow mobile app credentials"
        onRefresh={loadStaff}
        isRefreshing={loading}
        actionButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
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
              placeholder="Search staff by name or email..."
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
            Total <strong className="text-slate-800">{filteredStaff.length}</strong> active cleaning personnel
          </div>
        </div>

        {/* Staff Grid */}
        {filteredStaff.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
            <p className="font-bold text-slate-700 text-sm">No staff members found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search ? 'No staff match your search query.' : 'Add staff members to assign house cleaning visits.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((s) => (
              <StaffCard
                key={s.id}
                staff={s}
                onDelete={handleDeleteStaff}
                onAssignJob={handleAssignJobToStaff}
              />
            ))}
          </div>
        )}
      </div>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStaff}
      />

      <JobModal
        isOpen={isJobModalOpen}
        customers={customers}
        staffList={staffList}
        initialStaffId={targetStaffForJob?.id || ''}
        onClose={() => setIsJobModalOpen(false)}
        onSave={handleSaveAssignedJob}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Staff Member"
        message="Are you sure you want to remove this cleaning staff member? Their access to the mobile app will be permanently revoked."
        confirmText="Remove Staff"
        isLoading={isDeleting}
      />
    </div>
  );
}
