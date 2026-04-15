import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
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
          if (j.deadline) j.deadline = new Date(j.deadline).toISOString().split('T')[0];
          setFormData(j);
        }
      } catch (err) {
        console.error('Failed to fetch job', err);
        setError('Failed to load job details');
      } finally { setLoading(false); }
    };
    fetchJob();
  }, [id]);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

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
      const payload = { ...formData };
      delete payload.status; delete payload.company; delete payload._id;
      delete payload.__v; delete payload.createdAt; delete payload.updatedAt; delete payload.applicationCount;
      const res = await api.put(`/company/jobs/${id}`, payload);
      if (res.data.success) navigate(`/company/jobs/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job');
    } finally { setSaving(false); }
  };

  if (loading) return <Loader />;
  if (!formData) return <p className="text-center text-bauhaus-black/50 mt-10 font-bold uppercase">Job not found.</p>;

  const inputClass = "bauhaus-input";
  const labelClass = "block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-1.5";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-bauhaus-black/40 hover:text-bauhaus-black hover:bg-bauhaus-muted transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-bauhaus-black uppercase tracking-wider">Edit Job Profile</h1>
          <p className="text-bauhaus-black/50 text-sm mt-1 font-medium">Update details for {formData.title}</p>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-bauhaus-red text-white border-2 border-bauhaus-black text-sm font-bold">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border-4 border-bauhaus-black p-6 md:p-8 shadow-hard-md space-y-8">
        <section>
          <h2 className="text-lg font-black text-bauhaus-black mb-4 pb-2 border-b-2 border-bauhaus-black uppercase tracking-wider">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2"><label className={labelClass}>Job Title *</label><input type="text" name="title" required value={formData.title} onChange={handleChange} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Description *</label><textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Job Type *</label><select name="jobType" required value={formData.jobType} onChange={handleChange} className={inputClass}><option value="fulltime">Full Time</option><option value="internship">Internship</option></select></div>
            <div><label className={labelClass}>Location</label><input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="e.g. Remote, Bangalore" /></div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-black text-bauhaus-black mb-4 pb-2 border-b-2 border-bauhaus-black uppercase tracking-wider">Compensation & Terms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div><label className={labelClass}>Package (CTC)</label><input type="text" name="package" value={formData.package} onChange={handleChange} className={inputClass} placeholder="e.g. 12 LPA" /></div>
            <div><label className={labelClass}>Stipend (if internship)</label><input type="text" name="stipend" value={formData.stipend} onChange={handleChange} className={inputClass} placeholder="e.g. 30k/month" /></div>
            <div><label className={labelClass}>Bond Period</label><input type="text" name="bondPeriod" value={formData.bondPeriod} onChange={handleChange} className={inputClass} placeholder="e.g. 2 years" /></div>
            <div><label className={labelClass}>Number of Openings</label><input type="number" name="openings" min="1" value={formData.openings} onChange={handleChange} className={inputClass} /></div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-black text-bauhaus-black mb-4 pb-2 border-b-2 border-bauhaus-black uppercase tracking-wider">Requirements & Eligibility</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div><label className={labelClass}>Minimum CGPA</label><input type="number" step="0.1" name="minCGPA" min="0" max="10" value={formData.minCGPA || ''} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Max Active Backlogs</label><input type="number" name="maxBacklogs" min="0" value={formData.maxBacklogs || ''} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Application Deadline</label><input type="date" name="deadline" value={formData.deadline || ''} onChange={handleChange} className={inputClass} /></div>
          </div>

          <div className="mb-5">
            <label className={labelClass}>Required Skills</label>
            <SkillsSelector selected={formData.requiredSkills || []} onChange={(skills) => setFormData({ ...formData, requiredSkills: skills })} maxSkills={8} />
          </div>

          <div>
            <label className={labelClass}>Eligible Branches (Leave empty for all)</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {branches.map(branch => (
                <label key={branch} className="flex items-center gap-2 cursor-pointer p-2 pr-4 border-2 border-bauhaus-black/20 hover:border-bauhaus-black transition">
                  <input type="checkbox" checked={(formData.eligibleBranches || []).includes(branch)}
                    onChange={() => handleBranchChange(branch)}
                    className="w-4 h-4 accent-bauhaus-blue" />
                  <span className="text-sm font-bold text-bauhaus-black">{branch}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <div className="pt-6 border-t-2 border-bauhaus-black flex justify-end gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 border-2 border-bauhaus-black text-bauhaus-black font-black hover:bg-bauhaus-muted transition uppercase tracking-wider">Cancel</button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-bauhaus-blue text-white font-black border-2 border-bauhaus-black shadow-hard-sm hover:opacity-90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition disabled:opacity-60 flex items-center gap-2 uppercase tracking-wider">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
