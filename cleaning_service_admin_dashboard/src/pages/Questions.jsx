import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, X } from 'lucide-react';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import ConfirmModal from '../components/common/ConfirmModal';
import QuestionTable from '../components/questions/QuestionTable';
import QuestionModal from '../components/questions/QuestionModal';
import { AdminAPI } from '../services/api';

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadQuestionsAndCustomers();
  }, []);

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadQuestionsAndCustomers = async () => {
    setLoading(true);
    try {
      const [qRes, cRes] = await Promise.all([
        AdminAPI.getQuestions(),
        AdminAPI.getCustomers(),
      ]);

      if (qRes.success) setQuestions(qRes.data);
      if (cRes.success) setCustomers(cRes.data);
    } catch (err) {
      showToast('Failed to load checklist questions or customers.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (formData) => {
    try {
      if (editingQuestion) {
        const res = await AdminAPI.updateQuestion(editingQuestion.id, formData);
        if (res.success) {
          showToast('Customer checklist question updated!');
          setIsModalOpen(false);
          loadQuestionsAndCustomers();
        }
      } else {
        const res = await AdminAPI.createQuestion(formData);
        if (res.success) {
          showToast('New checklist question added for this customer!');
          setIsModalOpen(false);
          loadQuestionsAndCustomers();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    }
  };

  const handleToggleQuestion = async (q) => {
    try {
      const res = await AdminAPI.updateQuestion(q.id, {
        isActive: !q.is_active,
        customerId: q.customer_id,
        questionText: q.question_text
      });
      if (res.success) {
        showToast(`Question ${!q.is_active ? 'enabled' : 'disabled'} for mobile app!`);
        loadQuestionsAndCustomers();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteQuestion = (id) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await AdminAPI.deleteQuestion(deleteTargetId);
      if (res.success) {
        showToast('Checklist question deleted successfully!');
        setDeleteTargetId(null);
        loadQuestionsAndCustomers();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter & Search
  const filteredQuestions = questions.filter((q) => {
    // Customer filter
    if (selectedCustomerFilter !== 'all' && q.customer_id !== selectedCustomerFilter) {
      return false;
    }

    // Search query
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const text = (q.question_text || '').toLowerCase();
    const custName = (q.customer_name || '').toLowerCase();

    return text.includes(term) || custName.includes(term);
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Inspection Checklist Items"
        subtitle="Configure property-specific checklist questions for field cleaning staff"
        onRefresh={loadQuestionsAndCustomers}
        isRefreshing={loading}
        actionButton={
          <button
            onClick={() => {
              setEditingQuestion(null);
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Checklist Item</span>
          </button>
        }
      />

      <Toast message={message} />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          {/* Customer Filter Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 shrink-0">Filter Client:</span>
            <select
              value={selectedCustomerFilter}
              onChange={(e) => setSelectedCustomerFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 text-slate-800"
            >
              <option value="all">All Clients ({questions.length} items)</option>
              {customers.map((c) => {
                const count = questions.filter((q) => q.customer_id === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({count} items)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Search Questions Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search checklist tasks..."
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
        </div>

        {/* Questions Table */}
        <QuestionTable
          questions={filteredQuestions}
          onToggle={handleToggleQuestion}
          onEdit={(q) => {
            setEditingQuestion(q);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteQuestion}
        />
      </div>

      <QuestionModal
        isOpen={isModalOpen}
        editingQuestion={editingQuestion}
        customers={customers}
        initialCustomerId={selectedCustomerFilter !== 'all' ? selectedCustomerFilter : ''}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuestion}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Inspection Question"
        message="Are you sure you want to permanently delete this inspection checklist question? It will no longer appear on the mobile app for field staff."
        confirmText="Delete Question"
        isLoading={isDeleting}
      />
    </div>
  );
}
