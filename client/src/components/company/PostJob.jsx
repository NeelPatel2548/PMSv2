import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
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

  const inputClass = "bauhaus-input";
  const labelClass = "block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-1.5";

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-black text-bauhaus-black mb-6 uppercase tracking-wider">Post a New Job</h1>

      {error && <div className="mb-4 p-3 bg-bauhaus-red text-white text-sm border-2 border-bauhaus-black font-bold">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
          <h2 className="text-lg font-black text-bauhaus-black mb-4 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">Job Details</h2>
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

        <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
          <h2 className="text-lg font-black text-bauhaus-black mb-4 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">Eligibility Criteria</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><label className={labelClass}>Min CGPA</label><input type="number" name="minCGPA" value={formData.minCGPA} onChange={handleChange} min="0" max="10" step="0.1" className={inputClass} /></div>
            <div><label className={labelClass}>Max Active Backlogs</label><input type="number" name="maxBacklogs" value={formData.maxBacklogs} onChange={handleChange} min="0" className={inputClass} /></div>
          </div>
          <div>
            <label className={labelClass}>Eligible Branches (leave empty for all)</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {branches.map(b => (
                <button key={b} type="button" onClick={() => toggleBranch(b)}
                  className={`px-3 py-1.5 text-sm font-black transition-colors border-2 uppercase ${
                    formData.eligibleBranches.includes(b)
                      ? 'bg-bauhaus-blue text-white border-bauhaus-black'
                      : 'bg-bauhaus-muted text-bauhaus-black/60 border-bauhaus-black/20 hover:border-bauhaus-black'
                  }`}>{b}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
          <h2 className="text-lg font-black text-bauhaus-black mb-4 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">Required Skills</h2>
          <SkillsSelector
            selected={formData.requiredSkills}
            onChange={(skills) => setFormData(prev => ({ ...prev, requiredSkills: skills }))}
            maxSkills={8}
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-bauhaus-red text-white font-black hover:opacity-90 transition-all disabled:opacity-60 border-4 border-bauhaus-black shadow-hard-md active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider flex items-center justify-center gap-2">
          <PlusCircle className="w-5 h-5" />{loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
};

export default PostJob;
