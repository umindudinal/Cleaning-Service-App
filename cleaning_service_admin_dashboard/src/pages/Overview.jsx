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
  MapPin,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  Activity
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
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
      <Header
        section="Control Center"
        title="Operations Overview"
        subtitle="Real-time dispatch telemetry, team performance & automated report monitoring"
        onRefresh={loadOverviewData}
        isRefreshing={loading}
        actionButton={
          <button
            onClick={() => navigate('/dashboard/jobs')}
            className="flex items-center space-x-1.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch New Job</span>
          </button>
        }
      />

      <Toast message={message} />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-7">
        {/* Executive KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Registered Clients */}
          <div
            onClick={() => navigate('/dashboard/customers')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-lg hover:border-blue-400/80 transition-all duration-200 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Registered Clients
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalCustomers}
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-blue-600 font-semibold mt-2">
                <span>View Client Profiles</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 2: Field Cleaners */}
          <div
            onClick={() => navigate('/dashboard/staff')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-lg hover:border-emerald-400/80 transition-all duration-200 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active Cleaners
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalStaff}
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-emerald-600 font-semibold mt-2">
                <span>Field Team Ready</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 3: Pending Visits */}
          <div
            onClick={() => navigate('/dashboard/jobs')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-lg hover:border-amber-400/80 transition-all duration-200 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Pending Inspection
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
                {stats.pendingJobs}
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-amber-600 font-semibold mt-2">
                <span>Awaiting Field Staff</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Card 4: Completed Reports */}
          <div
            onClick={() => navigate('/dashboard/jobs')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] hover:shadow-lg hover:border-green-400/80 transition-all duration-200 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Completed & Emailed
              </span>
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-green-600 tracking-tight">
                {stats.completedJobs}
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-green-600 font-semibold mt-2">
                <span>Verified PDF Reports</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch Command Strip & Quick Action Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Daily Dispatch Completion Rate
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                {stats.completedJobs} of {totalJobs} Visits Completed ({completionRate}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="bg-linear-to-r from-blue-600 via-indigo-600 to-emerald-500 h-full rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${Math.min(completionRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => navigate('/dashboard/jobs')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Dispatch Job</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/customers')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Customer</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/staff')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Staff</span>
            </button>
            <button
              onClick={() => navigate('/dashboard/questions')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5 text-slate-500" />
              <span>Checklists ({questionsCount})</span>
            </button>
          </div>
        </div>

        {/* Dual Pane: Operations Pipeline & Live Jobs Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Operational Pipeline Card */}
          <div className="bg-[#0B1120] text-white p-6 rounded-2xl shadow-xl border border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center space-x-2 text-blue-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Field Automation Architecture</span>
              </div>
              <h3 className="text-lg font-extrabold text-white">How JaniFlow Executes</h3>
              <p className="text-xs text-slate-400 mt-1 mb-5 leading-relaxed">
                Seamless closed-loop execution connecting dispatcher, field cleaner, and client.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Dispatch Cleaning Visit</p>
                    <p className="text-[11px] text-slate-400">Customer location assigned to staff.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Custom Property Checklist</p>
                    <p className="text-[11px] text-slate-400">Targeted inspection items load in Mobile App.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-400/30 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Photo Proof Verification</p>
                    <p className="text-[11px] text-slate-400">Cleaner attaches before/after photo proofs.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-300">Automated PDF Report Emailed</p>
                    <p className="text-[11px] text-slate-400">PDF compiled & emailed to customer instantly.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-800/80 mt-6">
              <button
                onClick={() => navigate('/dashboard/jobs')}
                className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md shadow-blue-600/30 cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>Open Active Dispatch Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Live Recent Jobs Telemetry Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.03)] p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base tracking-tight">
                    Recent Dispatch Activity
                  </h3>
                  <p className="text-xs text-slate-400">Real-time status of assigned field inspections</p>
                </div>
                <button
                  onClick={() => navigate('/dashboard/jobs')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                >
                  <span>View All ({stats.totalJobs})</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {recentJobs.length === 0 ? (
                <div className="py-14 text-center text-slate-400">
                  <CalendarCheck className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
                  <p className="text-sm font-bold text-slate-700">No active cleaning visits yet</p>
                  <p className="text-xs text-slate-400 mt-1">Dispatch your first job to start telemetry.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <th className="pb-3">Client & Location</th>
                        <th className="pb-3">Cleaner</th>
                        <th className="pb-3">Scheduled</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">PDF Report</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentJobs.map((job) => {
                        const isDone = (job.status || '').toLowerCase() === 'completed';
                        const customer = job.customers || {};
                        return (
                          <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5">
                              <p className="font-bold text-slate-900 text-xs">
                                {customer.name || 'Client'}
                              </p>
                              {customer.address && (
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate max-w-xs">
                                  <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                                  <span className="truncate">{customer.address}</span>
                                </p>
                              )}
                            </td>
                            <td className="py-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                                {job.staff_name || 'Assigned Staff'}
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-500 text-xs">
                              {job.job_date || 'Today'}
                            </td>
                            <td className="py-3.5">
                              <span
                                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  isDone
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isDone ? 'bg-emerald-500' : 'bg-amber-500'
                                  }`}
                                />
                                <span>{isDone ? 'COMPLETED' : 'PENDING'}</span>
                              </span>
                            </td>
                            <td className="py-3.5 text-right">
                              {isDone && job.pdf_url ? (
                                <a
                                  href={job.pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition cursor-pointer"
                                  title="View PDF Report"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>PDF</span>
                                  <ExternalLink className="w-2.5 h-2.5 text-red-400" />
                                </a>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">In Field</span>
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
    </div>
  );
}
