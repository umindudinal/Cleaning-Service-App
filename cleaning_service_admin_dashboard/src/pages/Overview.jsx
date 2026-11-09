import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  CalendarCheck,
  FileText,
  Plus,
  ArrowRight,
  ClipboardList,
  MapPin,
  ExternalLink
} from 'lucide-react';
import Header from '../components/common/Header';
import Toast from '../components/common/Toast';
import { AdminAPI } from '../services/api';
import { useRealtimeSubscription } from '../services/useRealtime';

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
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadOverviewData(true);
  }, []);

  const loadOverviewData = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [statsRes, jobsRes, qRes] = await Promise.all([
        AdminAPI.getStats(),
        AdminAPI.getJobs(),
        AdminAPI.getQuestions(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (jobsRes.success) setRecentJobs(jobsRes.data.slice(0, 8));
    } catch (err) {
      if (showSpinner) {
        setMessage({ text: 'Failed to load dashboard data.', type: 'error' });
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // Real-time synchronization
  useRealtimeSubscription(['jobs', 'customers', 'staff', 'questions'], () => {
    loadOverviewData(false);
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <Header
        title="Dashboard Overview"
        subtitle="Summary of cleaning operations, jobs, and customer reports"
        onRefresh={loadOverviewData}
        isRefreshing={loading}
        actionButton={
          <button
            onClick={() => navigate('/dashboard/jobs')}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Job</span>
          </button>
        }
      />

      <Toast message={message} />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Customers */}
          <div
            onClick={() => navigate('/dashboard/customers')}
            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Customers</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</div>
              <p className="text-xs text-gray-400 mt-1">Registered clients</p>
            </div>
          </div>

          {/* Active Staff */}
          <div
            onClick={() => navigate('/dashboard/staff')}
            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-emerald-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Staff Members</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-gray-900">{stats.totalStaff}</div>
              <p className="text-xs text-gray-400 mt-1">Active cleaners</p>
            </div>
          </div>

          {/* Pending Jobs */}
          <div
            onClick={() => navigate('/dashboard/jobs')}
            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-amber-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Pending Jobs</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-amber-700">{stats.pendingJobs}</div>
              <p className="text-xs text-gray-400 mt-1">Awaiting inspection</p>
            </div>
          </div>

          {/* Completed Jobs */}
          <div
            onClick={() => navigate('/dashboard/jobs')}
            className="bg-white p-5 rounded-xl border border-gray-200 hover:border-green-400 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Completed Jobs</span>
              <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold text-green-700">{stats.completedJobs}</div>
              <p className="text-xs text-gray-400 mt-1">Inspection report emailed</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-gray-700">Quick Navigation:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/dashboard/jobs')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-gray-500" />
              <span>Jobs</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/customers')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span>Customers</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/staff')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-gray-500" />
              <span>Staff</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/questions')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5 text-gray-500" />
              <span>Checklist Questions</span>
            </button>
          </div>
        </div>

        {/* Recent Jobs Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Recent Jobs</h3>
              <p className="text-xs text-gray-500 mt-0.5">Assigned visits and inspection reports</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/jobs')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentJobs.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-30 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">No jobs found</p>
              <p className="text-xs text-gray-400 mt-1">Assign your first job to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-500 text-xs font-medium">
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Assigned Staff</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Inspection Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentJobs.map((job) => {
                    const isDone = (job.status || '').toLowerCase() === 'completed';
                    const customer = job.customers || {};

                    return (
                      <tr key={job.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900 text-xs">{customer.name || 'Customer'}</p>
                          {customer.address && (
                            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate max-w-xs">
                              <MapPin className="w-3 h-3 shrink-0 text-gray-400" />
                              <span className="truncate">{customer.address}</span>
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-700">
                          {job.staff_name || 'Unassigned'}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">
                          {job.job_date || 'Today'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {isDone ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {isDone && job.pdf_url ? (
                            <a
                              href={job.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-md text-xs font-medium transition cursor-pointer"
                              title="View PDF Report"
                            >
                              <FileText className="w-3.5 h-3.5 text-gray-500" />
                              <span>View PDF</span>
                              <ExternalLink className="w-3 h-3 text-gray-400" />
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Not completed</span>
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
  );
}
