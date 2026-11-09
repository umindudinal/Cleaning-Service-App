import React, { useState, useEffect } from 'react';
import { Plus, ClipboardList, Filter } from 'lucide-react';
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
          showToast('New question assigned to customer for Mobile App!');
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

  const filteredQuestions = questions.filter((q) => {
    if (selectedCustomerFilter === 'all') return true;
    return q.customer_id === selectedCustomerFilter;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Customer Specific Inspection Questions"
        subtitle="Manage custom checklist items for each client's cleaning order"
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
            <span>Add Question to Customer</span>
          </button>
        }
      />

      <Toast message={message} />

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Filter by Customer Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-700 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter by Customer:</span>
            <select
              value={selectedCustomerFilter}
              onChange={(e) => setSelectedCustomerFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50"
            >
              <option value="all">All Customers ({questions.length})</option>
              {customers.map((c) => {
                const count = questions.filter((q) => q.customer_id === c.id).length;
                return (
                  <option key={c.id} value={c.id}>
                    {c.name} ({count} questions)
                  </option>
                );
              })}
            </select>
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong className="text-slate-800">{filteredQuestions.length}</strong> checklist items
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
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuestion}
      />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Question"
        message="Are you sure you want to delete this inspection question? It will no longer be available in checklists."
        confirmText="Delete Question"
        isLoading={isDeleting}
      />
    </div>
  );
}
