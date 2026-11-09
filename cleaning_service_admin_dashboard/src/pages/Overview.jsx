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
  Sparkles,
  TrendingUp,
  MapPin
} from 'lucide-react';
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
      if (jobsRes.success) setRecentJobs(jobsRes.data.slice(0, 6));
      if (qRes.success) setQuestionsCount(qRes.data.length);
    } catch (err) {
      setMessage({ text: 'Failed to load dashboard overview data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const totalJobs = stats.totalJobs || (stats.completedJobs + stats.pendingJobs) || 0;
  const completionRate = totalJobs > 0 ? Math.round((stats.completedJobs / totalJobs) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header
        title="Dashboard Overview"
        subtitle="Real-time operations summary, dispatch pipeline & job tracker"
        onRefresh={loadOverviewData}
        isRefreshing={loading}
        actionButton={
          <button
            onClick={() => navigate('/dashboard/jobs')}
            className="flex items-center space-x-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign New Job</span>
          </button>
        }
      />

      <Toast message={message} />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
        {/* Metric Cards Grid - All Clickable with Hover Effects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Customers */}
          <div
            onClick={() => navigate('/dashboard/customers')}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered Customers</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{stats.totalCustomers}</p>
              </div>
              <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold">
              <span>Manage Clients</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Active Staff */}
          <div
            onClick={() => navigate('/dashboard/staff')}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Cleaning Staff</p>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{stats.totalStaff}</p>
              </div>
              <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl group-hover:scale-105 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-semibold">
              <span>View Field Personnel</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Pending Jobs */}
          <div
            onClick={() => navigate('/dashboard/jobs')}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Cleaning Jobs</p>
                <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.pendingJobs}</p>
              </div>
              <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-600 font-semibold">
              <span>Awaiting Field Staff</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Completed Jobs */}
          <div
            onClick={() => navigate('/dashboard/jobs')}
            className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-green-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Reports</p>
                <p className="text-3xl font-extrabold text-green-600 mt-1">{stats.completedJobs}</p>
              </div>
              <div className="bg-green-50 text-green-600 p-3.5 rounded-2xl group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-green-600 font-semibold">
              <span>Archived PDF Reports</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* Shift Progress Strip & Quick Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-slate-800">Overall Cleaning Dispatch Completion</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {stats.completedJobs} of {totalJobs} Tasks ({completionRate}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-linear-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            <button
              onClick={() => navigate('/dashboard/jobs')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-2xs cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Assign Job</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/customers')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Customer</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/staff')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Staff</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/questions')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
              <span>Checklists ({questionsCount})</span>
            </button>
          </div>
        </div>

        {/* Workflow Guide & Recent Jobs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Workflow Guide */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Operational Pipeline</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">How JaniFlow Works</h3>
              <p className="text-xs text-slate-400 mt-1 mb-5">
                Automated 4-step workflow from dispatch to customer email report.
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Register Clients & Staff</p>
                    <p className="text-[11px] text-slate-400">Add service addresses and staff credentials.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Configure Customer Checklists</p>
                    <p className="text-[11px] text-slate-400">Assign tailored questions for each property.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Staff Inspects via Mobile App</p>
                    <p className="text-[11px] text-slate-400">Staff checks tasks and captures photo proof.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-300">Automated PDF Report Emailed</p>
                    <p className="text-[11px] text-slate-400">System compiles photos into PDF & emails client.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-800 mt-6">
              <button
                onClick={() => navigate('/dashboard/jobs')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-xs cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>Open Jobs & Dispatch Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent Jobs Preview */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Recent Jobs Status</h3>
                <p className="text-xs text-slate-400">Real-time status of assigned visits</p>
              </div>
              <button
                onClick={() => navigate('/dashboard/jobs')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
              >
                <span>View All Jobs</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentJobs.length === 0 ? (
              <div className="py-14 text-center text-slate-400">
                <CalendarCheck className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold text-slate-600">No jobs created yet</p>
                <p className="text-xs text-slate-400 mt-1">Navigate to Jobs to assign your first task!</p>
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
                      <th className="pb-3 font-semibold text-right">PDF Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentJobs.map((job) => {
                      const isDone = (job.status || '').toLowerCase() === 'completed';
                      return (
                        <tr key={job.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5">
                            <p className="font-bold text-slate-800 text-xs">{job.customers?.name || 'Customer'}</p>
                            {job.customers?.address && (
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-xs">
                                <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                                <span className="truncate">{job.customers.address}</span>
                              </p>
                            )}
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-[10px]">
                                {job.staff_name ? job.staff_name[0] : 'S'}
                              </div>
                              <span className="text-xs font-medium text-slate-700">{job.staff_name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 text-slate-500 text-xs">{job.job_date || 'Today'}</td>
                          <td className="py-3.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                isDone
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {isDone ? 'COMPLETED' : 'PENDING'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            {isDone && job.pdf_url ? (
                              <a
                                href={job.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition cursor-pointer"
                                title="View PDF"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Pending</span>
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
