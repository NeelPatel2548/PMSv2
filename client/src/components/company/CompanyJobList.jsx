import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Users, Eye, Edit2, Play, Square, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const CompanyJobList = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/company/jobs');
      if (res.data.success) setJobs(res.data.data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleToggleStatus = async (jobId, currentStatus) => {
    if (currentStatus === 'open') {
      if (!window.confirm('Closing this job will automatically reject all pending/shortlisted applications. Are you sure?')) return;
    }
    try {
      const res = await api.patch(`/company/jobs/${jobId}/status`);
      if (res.data.success) fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Posted Jobs</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all your job postings</p>
        </div>
        <button onClick={() => navigate('/company/post-job')}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2 w-full sm:w-auto justify-center">
          <PlusCircle className="w-4 h-4" /> Post New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Briefcase className="w-14 h-14 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No jobs posted yet</p>
          <p className="text-sm mt-1">Click "Post New Job" to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, i) => (
            <motion.div key={job._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-slate-800 text-lg truncate">{job.title}</h3>
                    {job.status === 'open' ? (
                      <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Active</span>
                    ) : (
                      <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Closed</span>
                    )}
                  </div>
                  {job.description && <p className="text-sm text-slate-500 line-clamp-1 mb-2">{job.description}</p>}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="capitalize">{job.jobType}</span>
                    {job.package && <span>📦 {job.package}</span>}
                    {job.location && <span>📍 {job.location}</span>}
                    <span>🎯 {job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                    {job.deadline && (
                      <span className={new Date(job.deadline) < new Date() ? 'text-red-500' : ''}>
                        ⏰ {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => navigate(`/company/jobs/${job._id}/applicants`)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-50 text-primary-700 text-sm font-medium hover:bg-primary-100 transition"
                    title="View Applicants">
                    <Users className="w-4 h-4" /> Applicants
                  </button>
                  <button onClick={() => navigate(`/company/jobs/${job._id}/edit`)}
                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Edit Job">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleStatus(job._id, job.status)}
                    className={`p-2 rounded-lg transition ${job.status === 'open' ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                    title={job.status === 'open' ? 'Close Job' : 'Reopen Job'}>
                    {job.status === 'open' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyJobList;
