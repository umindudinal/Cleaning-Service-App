import React, { useState, useEffect } from 'react';
import { Plus, UserCheck, ShieldCheck } from 'lucide-react';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import ConfirmModal from '../components/common/ConfirmModal';
import StaffCard from '../components/staff/StaffCard';
import StaffModal from '../components/staff/StaffModal';
import { AdminAPI } from '../services/api';

export default function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      const res = await AdminAPI.getStaff();
      if (res.success) {
        setStaffList(res.data);
      }
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Cleaning Staff Management"
        subtitle="Manage active cleaning personnel and app login credentials"
        onRefresh={loadStaff}
        isRefreshing={loading}
        actionButton={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff</span>
          </button>
        }
      />

      <Toast message={message} />

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Staff Grid */}
        {staffList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-slate-600">No staff members registered</p>
            <p className="text-xs text-slate-400 mt-1">Add staff members to assign house cleaning jobs.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.map((s) => (
              <StaffCard key={s.id} staff={s} onDelete={handleDeleteStaff} />
            ))}
          </div>
        )}
      </div>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStaff}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Staff Member"
        message="Are you sure you want to remove this cleaning staff member? Their access will be revoked."
        confirmText="Remove Staff"
        isLoading={isDeleting}
      />
    </div>
  );
}

