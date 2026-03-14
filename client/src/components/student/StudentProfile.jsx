import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, PlusCircle, X, Upload, Linkedin, Github, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);

  // Tag inputs
  const [skillInput, setSkillInput] = useState('');

  // Project form
  const [projectForm, setProjectForm] = useState({ title: '', description: '', link: '' });

  // Cert form
  const [certForm, setCertForm] = useState({ title: '', issuedBy: '', year: '', link: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/profile');
        if (res.data.success) setProfile(res.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNameChange = (value) => {
    setProfile(prev => ({
      ...prev,
      user: { ...prev.user, name: value },
      _userName: value
    }));
  };

  // Skills
  const addSkill = () => {
    if (skillInput.trim() && !profile.skills?.includes(skillInput.trim())) {
      handleChange('skills', [...(profile.skills || []), skillInput.trim()]);
      setSkillInput('');
    }
  };
  const removeSkill = (i) => {
    handleChange('skills', profile.skills.filter((_, idx) => idx !== i));
  };

  // Projects
  const addProject = () => {
    if (!projectForm.title.trim()) return;
    handleChange('projects', [...(profile.projects || []), { ...projectForm }]);
    setProjectForm({ title: '', description: '', link: '' });
  };
  const removeProject = (i) => {
    handleChange('projects', profile.projects.filter((_, idx) => idx !== i));
  };

  // Certifications
  const addCert = () => {
    if (!certForm.title.trim()) return;
    handleChange('certifications', [...(profile.certifications || []), { ...certForm }]);
    setCertForm({ title: '', issuedBy: '', year: '', link: '' });
  };
  const removeCert = (i) => {
    handleChange('certifications', profile.certifications.filter((_, idx) => idx !== i));
  };

  // Resume upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Only PDF files are allowed' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File must be under 2MB' });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res = await api.post('/student/resume', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        handleChange('resumeUrl', res.data.data.resumeUrl);
        setMessage({ type: 'success', text: 'Resume uploaded!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed' });
    } finally { setUploading(false); }
  };

  // Save profile
  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        name: profile._userName || profile.user?.name,
        phone: profile.phone,
        address: profile.address,
        gender: profile.gender,
        dob: profile.dob,
        linkedin: profile.linkedin,
        github: profile.github,
        skills: profile.skills || [],
        projects: profile.projects || [],
        certifications: profile.certifications || [],
        internshipExperience: profile.internshipExperience
      };
      const res = await api.put('/student/profile', payload);
      if (res.data.success) {
        setProfile(res.data.data);
        setMessage({ type: 'success', text: 'Profile saved successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Save failed' });
    } finally { setSaving(false); }
  };

  if (loading) return <Loader />;
  if (!profile) return <p className="text-center text-slate-500 mt-10">Profile not found.</p>;

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
  const readOnly = "w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-500 cursor-not-allowed";

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>
      </motion.div>

      {message.text && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`mb-4 p-3 rounded-xl text-sm border flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
          {message.text}
        </motion.div>
      )}

      <div className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Name</label><input type="text" value={(profile._userName ?? profile.user?.name) || ''} onChange={(e) => handleNameChange(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass}>Email</label><input type="email" value={profile.user?.email || ''} readOnly className={readOnly} /></div>
            <div><label className={labelClass}>Phone</label><input type="text" value={profile.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Gender</label>
              <select value={profile.gender || ''} onChange={(e) => handleChange('gender', e.target.value)} className={inputClass}>
                <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
              </select>
            </div>
            <div><label className={labelClass}>Date of Birth</label><input type="date" value={profile.dob ? profile.dob.substring(0, 10) : ''} onChange={(e) => handleChange('dob', e.target.value)} className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={labelClass}>Address</label><textarea value={profile.address || ''} onChange={(e) => handleChange('address', e.target.value)} className={inputClass} rows="2" /></div>
          </div>
        </div>

        {/* Academic Info — READ ONLY */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Academic Records</h2>
          <p className="text-xs text-slate-400 mb-4">These fields are managed by administration and cannot be edited.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className={labelClass}>Enrollment No</label><input value={profile.enrollmentNo || '—'} readOnly className={readOnly} /></div>
            <div><label className={labelClass}>Branch</label><input value={profile.branch || '—'} readOnly className={readOnly} /></div>
            <div><label className={labelClass}>Passing Year</label><input value={profile.passingYear || '—'} readOnly className={readOnly} /></div>
            <div><label className={labelClass}>CGPA</label><input value={profile.cgpa ?? '—'} readOnly className={readOnly} /></div>
            <div><label className={labelClass}>10th %</label><input value={profile.tenthPercentage ?? '—'} readOnly className={readOnly} /></div>
            <div><label className={labelClass}>12th %</label><input value={profile.twelfthPercentage ?? '—'} readOnly className={readOnly} /></div>
            <div><label className={labelClass}>Active Backlogs</label><input value={profile.activeBacklogs ?? 0} readOnly className={readOnly} /></div>
            <div><label className={labelClass}>Placement Status</label><input value={profile.placementStatus || 'unplaced'} readOnly className={readOnly} /></div>
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Online Profiles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className={labelClass}>LinkedIn</label>
              <Linkedin className="absolute left-3 bottom-3 w-4 h-4 text-slate-400" />
              <input type="url" value={profile.linkedin || ''} onChange={(e) => handleChange('linkedin', e.target.value)} className={`${inputClass} pl-9`} placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="relative">
              <label className={labelClass}>GitHub</label>
              <Github className="absolute left-3 bottom-3 w-4 h-4 text-slate-400" />
              <input type="url" value={profile.github || ''} onChange={(e) => handleChange('github', e.target.value)} className={`${inputClass} pl-9`} placeholder="https://github.com/..." />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Skills</h2>
          <div className="flex gap-2 mb-3">
            <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} className={inputClass} placeholder="Add a skill and press Enter" />
            <button type="button" onClick={addSkill} className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition"><PlusCircle className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(profile.skills || []).map((skill, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-sm border border-primary-100">
                {skill}
                <button onClick={() => removeSkill(i)}><X className="w-3 h-3 text-primary-400 hover:text-red-500" /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Projects</h2>
          <div className="space-y-3 mb-4">
            {(profile.projects || []).map((p, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-800">{p.title}</p>
                  {p.description && <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>}
                  {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-xs text-primary-600 mt-0.5 block">{p.link}</a>}
                </div>
                <button onClick={() => removeProject(i)} className="p-1 rounded-lg hover:bg-red-100"><X className="w-4 h-4 text-slate-400 hover:text-red-500" /></button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input type="text" value={projectForm.title} onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))} className={inputClass} placeholder="Project title *" />
            <input type="text" value={projectForm.description} onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))} className={inputClass} placeholder="Short description" />
            <div className="flex gap-2">
              <input type="url" value={projectForm.link} onChange={(e) => setProjectForm(prev => ({ ...prev, link: e.target.value }))} className={inputClass} placeholder="Link (optional)" />
              <button type="button" onClick={addProject} className="px-3 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition"><PlusCircle className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Certifications</h2>
          <div className="space-y-3 mb-4">
            {(profile.certifications || []).map((c, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-800">{c.title}</p>
                  <p className="text-xs text-slate-500">{c.issuedBy}{c.year ? ` • ${c.year}` : ''}</p>
                  {c.link && <a href={c.link} target="_blank" rel="noreferrer" className="text-xs text-primary-600 mt-0.5 block">{c.link}</a>}
                </div>
                <button onClick={() => removeCert(i)} className="p-1 rounded-lg hover:bg-red-100"><X className="w-4 h-4 text-slate-400 hover:text-red-500" /></button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input type="text" value={certForm.title} onChange={(e) => setCertForm(prev => ({ ...prev, title: e.target.value }))} className={inputClass} placeholder="Certificate name *" />
            <input type="text" value={certForm.issuedBy} onChange={(e) => setCertForm(prev => ({ ...prev, issuedBy: e.target.value }))} className={inputClass} placeholder="Issued by" />
            <input type="text" value={certForm.year} onChange={(e) => setCertForm(prev => ({ ...prev, year: e.target.value }))} className={inputClass} placeholder="Year" />
            <div className="flex gap-2">
              <input type="url" value={certForm.link} onChange={(e) => setCertForm(prev => ({ ...prev, link: e.target.value }))} className={inputClass} placeholder="Link (optional)" />
              <button type="button" onClick={addCert} className="px-3 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition"><PlusCircle className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Internship Experience */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Internship Experience</h2>
          <textarea value={profile.internshipExperience || ''} onChange={(e) => handleChange('internshipExperience', e.target.value)} className={inputClass} rows="3" placeholder="Describe your internship experiences..." />
        </div>

        {/* Resume */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Resume</h2>
          {profile.resumeUrl && (
            <p className="text-sm text-green-600 mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Resume uploaded
            </p>
          )}
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition cursor-pointer">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Resume (PDF, max 2MB)'}
            <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />{saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default StudentProfile;
