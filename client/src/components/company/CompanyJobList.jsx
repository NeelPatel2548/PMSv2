import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Edit2, Play, Square, PlusCircle } from 'lucide-react';
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
          <h1 className="text-2xl font-black text-bauhaus-black uppercase tracking-wider">My Posted Jobs</h1>
          <p className="text-bauhaus-black/50 text-sm mt-1 font-medium">Manage all your job postings</p>
        </div>
        <button onClick={() => navigate('/company/post-job')}
          className="px-6 py-2.5 bg-bauhaus-red text-white font-black border-2 border-bauhaus-black shadow-hard-sm hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-sm flex items-center gap-2 w-full sm:w-auto justify-center uppercase tracking-wider">
          <PlusCircle className="w-4 h-4" /> Post New Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-20 text-bauhaus-black/40">
          <Briefcase className="w-14 h-14 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-black uppercase">No jobs posted yet</p>
          <p className="text-sm mt-1 font-medium">Click "Post New Job" to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white border-4 border-bauhaus-black p-5 shadow-hard-sm hover:-translate-y-0.5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-black text-bauhaus-black text-lg truncate uppercase">{job.title}</h3>
                    <span className={`shrink-0 px-2.5 py-0.5 text-xs font-black uppercase border-2 border-bauhaus-black ${
                      job.status === 'open' ? 'bg-bauhaus-blue text-white' : 'bg-bauhaus-red text-white'
                    }`}>
                      {job.status === 'open' ? 'Active' : 'Closed'}
                    </span>
                  </div>
                  {job.description && <p className="text-sm text-bauhaus-black/50 line-clamp-1 mb-2 font-medium">{job.description}</p>}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-bauhaus-black/50 font-bold">
                    <span className="capitalize">{job.jobType}</span>
                    {job.package && <span>📦 {job.package}</span>}
                    {job.location && <span>📍 {job.location}</span>}
                    <span>🎯 {job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                    {job.deadline && (
                      <span className={new Date(job.deadline) < new Date() ? 'text-bauhaus-red' : ''}>
                        ⏰ {new Date(job.deadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => navigate(`/company/jobs/${job._id}/applicants`)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-bauhaus-blue/10 text-bauhaus-blue text-sm font-black hover:bg-bauhaus-blue hover:text-white border-2 border-bauhaus-blue transition-colors uppercase">
                    <Users className="w-4 h-4" /> Applicants
                  </button>
                  <button onClick={() => navigate(`/company/jobs/${job._id}/edit`)}
                    className="p-2 text-bauhaus-yellow hover:bg-bauhaus-yellow/10 border-2 border-transparent hover:border-bauhaus-yellow transition" title="Edit Job">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleStatus(job._id, job.status)}
                    className={`p-2 border-2 transition ${job.status === 'open' ? 'text-bauhaus-red border-transparent hover:border-bauhaus-red hover:bg-bauhaus-red/10' : 'text-bauhaus-blue border-transparent hover:border-bauhaus-blue hover:bg-bauhaus-blue/10'}`}
                    title={job.status === 'open' ? 'Close Job' : 'Reopen Job'}>
                    {job.status === 'open' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyJobList;
