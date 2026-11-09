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
      showToast('Failed to load staff list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStaff = async (formData) => {
    try {
      const res = await AdminAPI.createStaff(formData);
      if (res.success) {
        showToast('Staff member added.');
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
        showToast('Job assigned to staff successfully.');
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
        showToast('Staff member removed.');
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
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <Header
        title="Staff"
        subtitle="Manage cleaning personnel and mobile app login accounts"
        onRefresh={loadStaff}
        isRefreshing={loading}
        actionButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff</span>
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
              placeholder="Search staff by name or email..."
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
            Total: <strong className="text-gray-800 font-semibold">{staffList.length}</strong> staff members
          </div>
        </div>

        {/* Staff Grid */}
        {filteredStaff.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30 text-gray-400" />
            <p className="font-semibold text-gray-700 text-sm">No staff members found</p>
            <p className="text-xs text-gray-400 mt-1">
              {search ? 'No staff match your search query.' : 'Click "Add Staff" to create an account.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        title="Remove Staff"
        message="Are you sure you want to remove this staff member? They will no longer be able to log in to the mobile app."
        confirmText="Remove Staff"
        isLoading={isDeleting}
      />
    </div>
  );
}
