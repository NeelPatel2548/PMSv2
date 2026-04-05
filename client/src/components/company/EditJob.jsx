import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, X, PlusCircle } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';
import SkillsSelector from '../common/SkillsSelector';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const branches = ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'Other'];

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/company/jobs/${id}`);
        if (res.data.success) {
          const j = res.data.data;
          // Format date for input
          if (j.deadline) {
            j.deadline = new Date(j.deadline).toISOString().split('T')[0];
          }
          setFormData(j);
        }
      } catch (err) {
        console.error('Failed to fetch job', err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBranchChange = (branch) => {
    const current = formData.eligibleBranches || [];
    if (current.includes(branch)) {
      setFormData({ ...formData, eligibleBranches: current.filter(b => b !== branch) });
    } else {
      setFormData({ ...formData, eligibleBranches: [...current, branch] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // NOTE: Status is purposefully removed because it uses a PATCH endpoint now.
      const payload = { ...formData };
      delete payload.status;
      delete payload.company;
      delete payload._id;
      delete payload.__v;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.applicationCount;

      const res = await api.put(`/company/jobs/${id}`, payload);
      if (res.data.success) {
        navigate(`/company/jobs/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!formData) return <p className="text-center text-slate-500 mt-10">Job not found.</p>;

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Job Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Update details for {formData.title}</p>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm">
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-8">
        
        {/* Basic Info */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>Job Title *</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description *</label>
              <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Job Type *</label>
              <select name="jobType" required value={formData.jobType} onChange={handleChange} className={inputClass}>
                <option value="fulltime">Full Time</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="e.g. Remote, Bangalore" />
            </div>
          </div>
        </section>

        {/* Compensation */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Compensation & Terms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Package (CTC)</label>
              <input type="text" name="package" value={formData.package} onChange={handleChange} className={inputClass} placeholder="e.g. 12 LPA" />
            </div>
            <div>
              <label className={labelClass}>Stipend (if internship)</label>
              <input type="text" name="stipend" value={formData.stipend} onChange={handleChange} className={inputClass} placeholder="e.g. 30k/month" />
            </div>
            <div>
              <label className={labelClass}>Bond Period</label>
              <input type="text" name="bondPeriod" value={formData.bondPeriod} onChange={handleChange} className={inputClass} placeholder="e.g. 2 years" />
            </div>
            <div>
              <label className={labelClass}>Number of Openings</label>
              <input type="number" name="openings" min="1" value={formData.openings} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Requirements & Eligibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className={labelClass}>Minimum CGPA</label>
              <input type="number" step="0.1" name="minCGPA" min="0" max="10" value={formData.minCGPA || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Active Backlogs</label>
              <input type="number" name="maxBacklogs" min="0" value={formData.maxBacklogs || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Application Deadline</label>
              <input type="date" name="deadline" value={formData.deadline || ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="mb-5">
            <label className={labelClass}>Required Skills</label>
            <SkillsSelector
              selected={formData.requiredSkills || []}
              onChange={(skills) => setFormData({ ...formData, requiredSkills: skills })}
              maxSkills={8}
            />
          </div>

          <div>
            <label className={labelClass}>Eligible Branches (Leave empty for all)</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {branches.map(branch => (
                <label key={branch} className="flex items-center gap-2 cursor-pointer p-2 pr-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={(formData.eligibleBranches || []).includes(branch)}
                    onChange={() => handleBranchChange(branch)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">{branch}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition disabled:opacity-60 flex items-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
