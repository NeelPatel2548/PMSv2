import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Briefcase } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';
import JobCard from './JobCard';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/student/jobs');
        if (res.data.success) setJobs(res.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    setApplying(jobId);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.post(`/student/apply/${jobId}`);
      if (res.data.success) {
        setJobs(prev => prev.filter(j => j._id !== jobId));
        setMessage({ type: 'success', text: 'Application submitted!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to apply' });
    } finally { setApplying(null); }
  };

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.company?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Eligible Jobs</h1>
        <p className="text-slate-500 text-sm mb-6">Jobs matching your CGPA, branch, and backlog criteria</p>
      </motion.div>

      {message.text && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`mb-4 p-3 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {message.text}
        </motion.div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs or companies..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No eligible jobs found</p>
          <p className="text-sm mt-1">Check back later for new opportunities</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => (
            <JobCard key={job._id} job={job} onApply={handleApply} applying={applying === job._id} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;
