import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ChevronRight, FileText, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const statusColors = {
  applied: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  interview: 'bg-purple-100 text-purple-700',
  selected: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-500',
};

const ApplicantList = () => {
  const { jobId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [selectedJob, setSelectedJob] = useState(jobId || null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/company/jobs');
        if (res.data.success) {
          setJobs(res.data.data);
          if (!selectedJob && res.data.data.length > 0) setSelectedJob(res.data.data[0]._id);
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedJob) fetchApplicants(selectedJob);
  }, [selectedJob]);

  const fetchApplicants = async (id) => {
    try {
      const res = await api.get(`/company/jobs/${id}/applicants`);
      if (res.data.success) setApplicants(res.data.data);
    } catch { setApplicants([]); }
  };

  const updateStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      await api.put(`/company/applications/${appId}/status`, { status });
      setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
    } catch { /* ignore */ } finally { setUpdating(null); }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          {jobId ? 'Applicants' : 'My Jobs & Applicants'}
        </h1>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Job List */}
        <div className="lg:col-span-1 space-y-2">
          {jobs.map(job => (
            <button key={job._id} onClick={() => setSelectedJob(job._id)}
              className={`w-full text-left p-3 rounded-xl transition-colors ${
                selectedJob === job._id ? 'bg-primary-50 border border-primary-200' : 'bg-white border border-slate-100 hover:bg-slate-50'
              }`}>
              <p className="font-medium text-sm text-slate-800 truncate">{job.title}</p>
              <p className="text-xs text-slate-400">{job.jobType} • {job.status}</p>
            </button>
          ))}
        </div>

        {/* Applicants */}
        <div className="lg:col-span-3">
          {!selectedJob ? (
            <p className="text-center text-slate-400 py-16">Select a job to view applicants.</p>
          ) : applicants.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">No applicants yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applicants.map((app, i) => (
                <motion.div key={app._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-white rounded-2xl p-5 border border-slate-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{app.student?.user?.name || 'Student'}</h3>
                      <p className="text-sm text-slate-500">{app.student?.user?.email}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                        <span>{app.student?.branch || '—'}</span>
                        <span>CGPA: {app.student?.cgpa ?? '—'}</span>
                        <span>Backlogs: {app.student?.activeBacklogs ?? 0}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[app.status]}`}>{app.status}</span>
                  </div>

                  {app.student?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {app.student.skills.slice(0, 4).map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-slate-100 text-xs">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {app.student?.resumeUrl && (
                      <a href={app.student.resumeUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-600 hover:bg-slate-200">
                        <FileText className="w-3 h-3" />Resume
                      </a>
                    )}
                    {!['selected', 'rejected', 'withdrawn'].includes(app.status) && (
                      <>
                        <button onClick={() => updateStatus(app._id, 'shortlisted')} disabled={updating === app._id}
                          className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium hover:bg-amber-200 disabled:opacity-50">Shortlist</button>
                        <Link to={`/company/jobs/${selectedJob}/rounds`} state={{ applicationId: app._id, studentName: app.student?.user?.name }}
                          className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium hover:bg-purple-200">Schedule Interview</Link>
                        <button onClick={() => updateStatus(app._id, 'selected')} disabled={updating === app._id}
                          className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 disabled:opacity-50 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />Select
                        </button>
                        <button onClick={() => updateStatus(app._id, 'rejected')} disabled={updating === app._id}
                          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 disabled:opacity-50 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />Reject
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantList;
