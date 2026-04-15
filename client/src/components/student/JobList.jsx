import { useState, useEffect } from 'react';
import { Search, Briefcase, Target } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';
import JobCard from './JobCard';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [jobsRes, profileRes] = await Promise.all([
          api.get('/student/jobs'),
          api.get('/student/profile')
        ]);
        if (jobsRes.data.success) setJobs(jobsRes.data.data);
        if (profileRes.data.success) setStudentProfile(profileRes.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchAll();
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
      <div>
        <h1 className="text-2xl font-black text-bauhaus-black mb-1 uppercase tracking-wider">Eligible Jobs</h1>
        <p className="text-bauhaus-black/50 text-sm mb-2 font-medium">Jobs matching your CGPA, branch, and backlog criteria</p>
        <div className="inline-flex items-center gap-1.5 mb-6 text-xs text-bauhaus-blue bg-bauhaus-blue/10 px-3 py-1.5 border-2 border-bauhaus-blue font-black uppercase tracking-wider">
          <Target className="w-3.5 h-3.5" />
          Jobs sorted by skill match — strong matches first
        </div>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 text-sm border-2 border-bauhaus-black font-bold ${message.type === 'success' ? 'bg-bauhaus-yellow text-bauhaus-black' : 'bg-bauhaus-red text-white'}`}>
          {message.text}
        </div>
      )}

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-bauhaus-black/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs or companies..."
          className="bauhaus-input pl-11"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-bauhaus-black/40">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-black uppercase">No eligible jobs found</p>
          <p className="text-sm mt-1 font-medium">Check back later for new opportunities</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(job => (
            <JobCard key={job._id} job={job} onApply={handleApply} applying={applying === job._id} studentProfile={studentProfile} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;
