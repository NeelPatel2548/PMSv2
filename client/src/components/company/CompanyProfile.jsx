import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';
import TierSelector from '../common/TierSelector';

const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/company/profile');
        if (res.data.success) setProfile(res.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validateField = (name, value) => {
    let err = '';
    if (name === 'hrPhone' && value && !/^[0-9]{10}$/.test(value)) err = 'Phone must be exactly 10 digits';
    if (name === 'website' && value && !/^https?:\/\//.test(value)) err = 'Must start with http:// or https://';
    if (name === 'hrEmail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) err = 'Please enter a valid email';
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const validateAll = () => {
    const e = {};
    if (profile.hrPhone && !/^[0-9]{10}$/.test(profile.hrPhone)) e.hrPhone = 'Phone must be exactly 10 digits';
    if (profile.website && !/^https?:\/\//.test(profile.website)) e.website = 'Must start with http:// or https://';
    if (profile.hrEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.hrEmail)) e.hrEmail = 'Please enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateAll()) {
      setMessage({ type: 'error', text: 'Please fix the errors before saving' });
      return;
    }
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.put('/company/profile', {
        name: profile.name, industry: profile.industry, location: profile.location,
        website: profile.website, description: profile.description,
        hrName: profile.hrName, hrEmail: profile.hrEmail, hrPhone: profile.hrPhone,
        tier: profile.tier
      });
      if (res.data.success) setMessage({ type: 'success', text: 'Profile updated!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update' });
    } finally { setSaving(false); }
  };

  if (loading) return <Loader />;
  if (!profile) return <p className="text-center text-slate-500 mt-10">Profile not found.</p>;

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition text-sm";
  const inputErr = "w-full px-4 py-2.5 rounded-xl border border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
  const errText = "text-xs text-red-500 mt-1";

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Company Profile</h1>
      </motion.div>

      {message.text && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`mb-4 p-3 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>{message.text}</motion.div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Company Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Company Name</label><input type="text" name="name" value={profile.name || ''} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Industry</label><input type="text" name="industry" value={profile.industry || ''} onChange={handleChange} className={inputClass} placeholder="e.g. IT, Finance" /></div>
            <div><label className={labelClass}>Location</label><input type="text" name="location" value={profile.location || ''} onChange={handleChange} className={inputClass} placeholder="e.g. Bangalore" /></div>
            <div>
              <label className={labelClass}>Website</label>
              <input type="url" name="website" value={profile.website || ''} onChange={handleChange} onBlur={() => validateField('website', profile.website)} className={errors.website ? inputErr : inputClass} placeholder="https://" />
              {errors.website && <p className={errText}>{errors.website}</p>}
            </div>
            <div className="sm:col-span-2"><label className={labelClass}>Description</label><textarea name="description" value={profile.description || ''} onChange={handleChange} className={inputClass} rows="3" /></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">HR Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>HR Name</label><input type="text" name="hrName" value={profile.hrName || ''} onChange={handleChange} className={inputClass} /></div>
            <div>
              <label className={labelClass}>HR Email</label>
              <input type="email" name="hrEmail" value={profile.hrEmail || ''} onChange={handleChange} onBlur={() => validateField('hrEmail', profile.hrEmail)} className={errors.hrEmail ? inputErr : inputClass} />
              {errors.hrEmail && <p className={errText}>{errors.hrEmail}</p>}
            </div>
            <div>
              <label className={labelClass}>HR Phone</label>
              <input type="text" name="hrPhone" value={profile.hrPhone || ''} onChange={handleChange} onBlur={() => validateField('hrPhone', profile.hrPhone)} className={errors.hrPhone ? inputErr : inputClass} />
              {errors.hrPhone && <p className={errText}>{errors.hrPhone}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Company Tier</h2>
          <TierSelector
            selected={profile.tier || 'tier2'}
            onChange={(tier) => setProfile(prev => ({ ...prev, tier }))}
          />
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${profile.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {profile.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
            </span>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold hover:from-primary-700 hover:to-primary-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />{saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default CompanyProfile;
