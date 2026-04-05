import { useState, useEffect, useRef } from 'react';
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
<<<<<<< HEAD
=======

  // Logo upload state
  const [logoData, setLogoData] = useState(null);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');
  const logoInputRef = useRef(null);
>>>>>>> main

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/company/profile');
        if (res.data.success) {
          setProfile(res.data.data);
          setLogoData(res.data.data.logo || null);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Logo upload handlers
  const handleLogoSelect = (e) => {
    setLogoError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      setLogoError('Only JPG, PNG, WEBP, or SVG allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Logo must be under 2MB');
      return;
    }

    setSelectedLogo(file);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLogoUpload = async () => {
    if (!selectedLogo) return;
    setLogoUploading(true);
    setLogoError('');
    try {
      const fd = new FormData();
      fd.append('logo', selectedLogo);
      const res = await api.post('/company/profile/logo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setLogoData(res.data.data.logo);
        setSelectedLogo(null);
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
        setMessage({ type: 'success', text: 'Logo saved!' });
      }
    } catch (err) {
      setLogoError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleLogoCancel = () => {
    setSelectedLogo(null);
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    setLogoError('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleChange = (e) => {
    setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validateField = (name, value) => {
    let err = '';
<<<<<<< HEAD
    if (name === 'hrPhone' && value && !/^[0-9]{10}$/.test(value)) err = 'Phone must be exactly 10 digits';
    if (name === 'website' && value && !/^https?:\/\//.test(value)) err = 'Must start with http:// or https://';
    if (name === 'hrEmail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) err = 'Please enter a valid email';
=======
    if (name === 'hrPhone' && value && !/^[0-9]{10}$/.test(value))
      err = 'Phone must be exactly 10 digits';
    if (name === 'website' && value && !/^https?:\/\//.test(value))
      err = 'Must start with http:// or https://';
    if (name === 'hrEmail' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      err = 'Please enter a valid email';
>>>>>>> main
    setErrors(prev => ({ ...prev, [name]: err }));
  };

  const validateAll = () => {
    const e = {};
<<<<<<< HEAD
    if (profile.hrPhone && !/^[0-9]{10}$/.test(profile.hrPhone)) e.hrPhone = 'Phone must be exactly 10 digits';
    if (profile.website && !/^https?:\/\//.test(profile.website)) e.website = 'Must start with http:// or https://';
    if (profile.hrEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.hrEmail)) e.hrEmail = 'Please enter a valid email';
=======
    if (profile.hrPhone && !/^[0-9]{10}$/.test(profile.hrPhone))
      e.hrPhone = 'Phone must be exactly 10 digits';
    if (profile.website && !/^https?:\/\//.test(profile.website))
      e.website = 'Must start with http:// or https://';
    if (profile.hrEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.hrEmail))
      e.hrEmail = 'Please enter a valid email';
>>>>>>> main
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
<<<<<<< HEAD
        name: profile.name, industry: profile.industry, location: profile.location,
        website: profile.website, description: profile.description,
        hrName: profile.hrName, hrEmail: profile.hrEmail, hrPhone: profile.hrPhone,
=======
        name: profile.name,
        industry: profile.industry,
        location: profile.location,
        website: profile.website,
        description: profile.description,
        hrName: profile.hrName,
        hrEmail: profile.hrEmail,
        hrPhone: profile.hrPhone,
>>>>>>> main
        tier: profile.tier
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Profile updated!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!profile) return <p className="text-center text-slate-500 mt-10">Profile not found.</p>;

<<<<<<< HEAD
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition text-sm";
  const inputErr = "w-full px-4 py-2.5 rounded-xl border border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
  const errText = "text-xs text-red-500 mt-1";
=======
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm";
  const inputErr = "w-full px-4 py-2.5 rounded-xl border border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition-all text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
  const errText = "text-xs text-red-500 mt-1 font-medium";

  const displayLogoSrc = logoPreview || logoData?.url || null;
  const companyInitial = (profile.name || 'C').charAt(0).toUpperCase();
>>>>>>> main

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Company Profile</h1>
      </motion.div>

      {message.text && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`mb-4 p-3 rounded-xl text-sm border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-600 border-green-100'
              : 'bg-red-50 text-red-600 border-red-100'
          }`}>
          {message.text}
        </motion.div>
      )}

      <div className="space-y-6">

        {/* Company Logo */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Company Logo</h2>
          <div className="flex items-center gap-6">

            {/* Square logo container */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-slate-100 bg-slate-50 flex items-center justify-center">
                {displayLogoSrc && (
                  <img
                    src={displayLogoSrc}
                    alt="Company logo"
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                )}
                <span
                  className="text-2xl font-bold text-slate-500 select-none"
                  style={{ display: displayLogoSrc ? 'none' : 'flex' }}
                >
                  {companyInitial}
                </span>
              </div>

              {/* Camera button */}
              <label
                htmlFor="logoInput"
                className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow-md"
                title="Change company logo"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </label>
              <input
                id="logoInput"
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleLogoSelect}
              />
            </div>

            {/* Right info + controls */}
            <div className="flex flex-col gap-2">
              {logoPreview ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <img
                    src={logoPreview}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-contain border border-slate-200 p-0.5"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleLogoUpload}
                      disabled={logoUploading}
                      className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                      {logoUploading ? 'Saving...' : 'Save logo'}
                    </button>
                    <button
                      onClick={handleLogoCancel}
                      className="px-4 py-1.5 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  {logoData?.url
                    ? 'Click the camera icon to change your logo'
                    : 'No logo uploaded yet.'}
                </p>
              )}
              <p className="text-xs text-slate-400">Recommended: square PNG or SVG · max 2MB</p>
              {logoError && <p className="text-xs text-red-500">{logoError}</p>}
            </div>

          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Company Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
<<<<<<< HEAD
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
=======
            <div>
              <label className={labelClass}>Company Name</label>
              <input type="text" name="name" value={profile.name || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Industry</label>
              <input type="text" name="industry" value={profile.industry || ''} onChange={handleChange} className={inputClass} placeholder="e.g. IT, Finance" />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input type="text" name="location" value={profile.location || ''} onChange={handleChange} className={inputClass} placeholder="e.g. Bangalore" />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input
                type="url"
                name="website"
                value={profile.website || ''}
                onChange={handleChange}
                onBlur={() => validateField('website', profile.website)}
                className={errors.website ? inputErr : inputClass}
                placeholder="https://"
              />
              {errors.website && <p className={errText}>{errors.website}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea name="description" value={profile.description || ''} onChange={handleChange} className={inputClass} rows="3" />
            </div>
>>>>>>> main
          </div>
        </div>

        {/* HR Contact */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">HR Contact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>HR Name</label>
              <input type="text" name="hrName" value={profile.hrName || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>HR Email</label>
              <input
                type="email"
                name="hrEmail"
                value={profile.hrEmail || ''}
                onChange={handleChange}
                onBlur={() => validateField('hrEmail', profile.hrEmail)}
                className={errors.hrEmail ? inputErr : inputClass}
              />
              {errors.hrEmail && <p className={errText}>{errors.hrEmail}</p>}
            </div>
            <div>
              <label className={labelClass}>HR Phone</label>
              <input
                type="text"
                name="hrPhone"
                value={profile.hrPhone || ''}
                onChange={handleChange}
                onBlur={() => validateField('hrPhone', profile.hrPhone)}
                className={errors.hrPhone ? inputErr : inputClass}
              />
              {errors.hrPhone && <p className={errText}>{errors.hrPhone}</p>}
            </div>
          </div>
        </div>

        {/* Tier */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Company Tier</h2>
          <TierSelector
            selected={profile.tier || 'tier2'}
            onChange={(tier) => setProfile(prev => ({ ...prev, tier }))}
          />
        </div>

        {/* Approval Status */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${profile.isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {profile.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
          </span>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default CompanyProfile;
