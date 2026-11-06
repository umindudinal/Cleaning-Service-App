import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Clock, CheckCircle2, ShieldCheck, CalendarCheck, FileText } from 'lucide-react';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import { AdminAPI } from '../services/api';

export default function Overview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalStaff: 0,
    totalQuestions: 0,
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      const [statsRes, jobsRes, qRes] = await Promise.all([
        AdminAPI.getStats(),
        AdminAPI.getJobs(),
        AdminAPI.getQuestions(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (jobsRes.success) setRecentJobs(jobsRes.data.slice(0, 5));
      if (qRes.success) setQuestionsCount(qRes.data.length);
    } catch (err) {
      setMessage({ text: 'Failed to load dashboard overview data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Dashboard Overview"
        subtitle="Real-time operations summary & system workflow"
        onRefresh={loadOverviewData}
        isRefreshing={loading}
      />

      <Toast message={message} />

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Registered Customers</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalCustomers}</p>
            </div>
            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl">
              <Users className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Cleaning Staff</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.totalStaff}</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl">
              <UserCheck className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Cleaning Jobs</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pendingJobs}</p>
            </div>
            <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl">
              <Clock className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Completed Jobs</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.completedJobs}</p>
            </div>
            <div className="bg-green-50 text-green-600 p-3 rounded-2xl">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Workflow Card & Recent Jobs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live System Workflow Card */}
          <div className="bg-linear-to-br from-blue-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-blue-300 text-sm font-semibold mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Live System Workflow</span>
              </div>
              <h3 className="text-xl font-bold">End-to-End Cleaning System</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                1. Register customers and assign jobs to cleaning staff.<br />
                2. Configure inspection questions for the Mobile App.<br />
                3. Staff selects customer, inspects, checks Yes/No, and takes photo proofs.<br />
                4. Automated PDF is generated and emailed to customer and admin!
              </p>
            </div>

            <div className="pt-6 border-t border-blue-800/60 mt-6 flex gap-3">
              <button
                onClick={() => navigate('/dashboard/customers')}
                className="bg-white text-slate-900 font-semibold px-4 py-2 rounded-xl text-xs hover:bg-slate-100 transition shadow cursor-pointer"
              >
                Manage Customers
              </button>
              <button
                onClick={() => navigate('/dashboard/questions')}
                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl text-xs hover:bg-blue-500 transition shadow cursor-pointer"
              >
                App Questions ({questionsCount})
              </button>
            </div>
          </div>

          {/* Recent Jobs Preview */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-base">Recent Jobs Status</h3>
              <button
                onClick={() => navigate('/dashboard/jobs')}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                View All Jobs →
              </button>
            </div>

            {recentJobs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CalendarCheck className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No jobs created yet. Navigate to Jobs to assign your first task!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase">
                      <th className="pb-3 font-semibold">Customer</th>
                      <th className="pb-3 font-semibold">Staff Assigned</th>
                      <th className="pb-3 font-semibold">Scheduled</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentJobs.map((job) => {
                      const isDone = (job.status || '').toLowerCase() === 'completed';
                      return (
                        <tr key={job.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 font-semibold text-slate-800">
                            {job.customers?.name || 'Customer'}
                          </td>
                          <td className="py-3 text-slate-600">{job.staff_name}</td>
                          <td className="py-3 text-slate-500">{job.job_date || 'Today'}</td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                                isDone
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {isDone ? 'COMPLETED' : 'PENDING'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {isDone && job.pdf_url ? (
                              <a
                                href={job.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                                title="View PDF"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

