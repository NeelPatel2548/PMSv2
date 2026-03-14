import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Users, CheckCircle, XCircle, TrendingUp, Eye, Edit2, Play, Square } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../common/Loader';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/company/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleJobStatus = async (jobId, currentStatus) => {
    const action = currentStatus === 'open' ? 'close' : 'reopen';
    if (action === 'close') {
      if (!window.confirm('Closing this job will AUTOMATICALLY REJECT all applications currently in pending/shortlisted state. Are you absolutely sure?')) {
        return;
      }
    }
    try {
      const res = await api.patch(`/company/jobs/${jobId}/status`);
      if (res.data.success) {
        fetchDashboard(); // refresh to get updated counts and status
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  if (loading) return <Loader />;
  if (!data) return <p className="text-center text-slate-500 mt-10">Failed to load dashboard.</p>;

  const { company, stats, recentJobs } = data;

  const statCards = [
    { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Jobs', value: stats.openJobs, icon: TrendingUp, color: 'from-emerald-500 to-green-500' },
    { label: 'Total Applicants', value: stats.totalApplications, icon: Users, color: 'from-purple-500 to-violet-500' },
    { label: 'Selected Candidates', value: stats.selected, icon: CheckCircle, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {company.name}</h1>
          <p className="text-slate-500 mt-1">Company Dashboard & ATS Overview</p>
        </div>
        <Link
          to="/company/post-job"
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all text-sm w-full sm:w-auto text-center"
        >
          Post New Job
        </Link>
      </motion.div>

      {!company.isApproved && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-800 flex items-start gap-4">
          <XCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg">Account Pending Approval</h3>
            <p className="mt-1 text-amber-700">Your company profile is under review by the administration. You will not be able to post jobs or view students until your account is approved.</p>
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            <p className="text-sm text-slate-500">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* My Posted Jobs Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">My Posted Jobs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Job Title</th>
                <th className="px-6 py-4 font-medium cursor-help" title="Applicants fetched from aggregate not realtime here unless refreshed">Package / Type</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Deadline</th>
                <th className="px-6 py-4 flex justify-end font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentJobs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No jobs posted yet.
                  </td>
                </tr>
              ) : (
                recentJobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{job.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-xs">{job.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{job.package || '—'}</p>
                      <p className="text-xs text-slate-500 capitalize">{job.jobType}</p>
                    </td>
                    <td className="px-6 py-4">
                      {job.status === 'open' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">
                        {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No deadline'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/company/jobs/${job._id}`)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="View Details & Applicants"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/company/jobs/${job._id}/edit`)}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          title="Edit Job"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleJobStatus(job._id, job.status)}
                          className={`p-2 rounded-lg transition title ${job.status === 'open' ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={job.status === 'open' ? "Close Job (Rejects Pending)" : "Reopen Job"}
                        >
                          {job.status === 'open' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default CompanyDashboard;
