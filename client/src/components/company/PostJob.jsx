import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, X } from 'lucide-react';
import api from '../../services/api';
import SkillsSelector from '../common/SkillsSelector';

const PostJob = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', description: '', jobType: 'fulltime', package: '', stipend: '',
    bondPeriod: '', location: '', minCGPA: 0, maxBacklogs: 0,
    eligibleBranches: [], requiredSkills: [], openings: 1, deadline: '', status: 'open'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const branches = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleBranch = (branch) => {
    setFormData(prev => ({
      ...prev,
      eligibleBranches: prev.eligibleBranches.includes(branch)
        ? prev.eligibleBranches.filter(b => b !== branch)
        : [...prev.eligibleBranches, branch]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/company/jobs', {
        ...formData,
        minCGPA: parseFloat(formData.minCGPA) || 0,
        maxBacklogs: parseInt(formData.maxBacklogs) || 0,
        openings: parseInt(formData.openings) || 1
      });
      if (res.data.success) navigate('/company/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally { setLoading(false); }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Post a New Job</h1>
      </motion.div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Job Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className={labelClass}>Job Title *</label><input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputClass} placeholder="e.g. Software Engineer" /></div>
            <div className="sm:col-span-2"><label className={labelClass}>Description</label><textarea name="description" value={formData.description} onChange={handleChange} className={inputClass} rows="4" placeholder="Job description..." /></div>
            <div><label className={labelClass}>Job Type *</label><select name="jobType" value={formData.jobType} onChange={handleChange} className={inputClass}><option value="fulltime">Full Time</option><option value="internship">Internship</option></select></div>
            <div><label className={labelClass}>Location</label><input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="e.g. Bangalore" /></div>
            <div><label className={labelClass}>Package (e.g. "5-8 LPA")</label><input type="text" name="package" value={formData.package} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Stipend (for internships)</label><input type="text" name="stipend" value={formData.stipend} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Bond Period</label><input type="text" name="bondPeriod" value={formData.bondPeriod} onChange={handleChange} className={inputClass} placeholder="e.g. 2 Years" /></div>
            <div><label className={labelClass}>Openings</label><input type="number" name="openings" value={formData.openings} onChange={handleChange} min="1" className={inputClass} /></div>
            <div><label className={labelClass}>Deadline</label><input type="date" name="deadline" value={formData.deadline} onChange={handleChange} className={inputClass} /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Eligibility Criteria</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><label className={labelClass}>Min CGPA</label><input type="number" name="minCGPA" value={formData.minCGPA} onChange={handleChange} min="0" max="10" step="0.1" className={inputClass} /></div>
            <div><label className={labelClass}>Max Active Backlogs</label><input type="number" name="maxBacklogs" value={formData.maxBacklogs} onChange={handleChange} min="0" className={inputClass} /></div>
          </div>
          <div>
            <label className={labelClass}>Eligible Branches (leave empty for all)</label>
            <div className="flex flex-wrap gap-2">
              {branches.map(b => (
                <button key={b} type="button" onClick={() => toggleBranch(b)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    formData.eligibleBranches.includes(b) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}>{b}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Required Skills</h2>
          <SkillsSelector
            selected={formData.requiredSkills}
            onChange={(skills) => setFormData(prev => ({ ...prev, requiredSkills: skills }))}
            maxSkills={8}
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-60 shadow-lg shadow-indigo-500/25">
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

export default PostJob;
