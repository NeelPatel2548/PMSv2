import { useState, useEffect, useRef } from 'react';
import { Save } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';
import TierSelector from '../common/TierSelector';
import { useAuth } from '../../context/AuthContext';

const CompanyProfile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const [logoData, setLogoData] = useState(null);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState('');
  const logoInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/company/profile');
        if (res.data.success) {
          setProfile(res.data.data);
          setLogoData(res.data.data.logo || null);
        }
      } catch {} finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleLogoSelect = (e) => {
    setLogoError('');
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) { setLogoError('Only JPG, PNG, WEBP, or SVG allowed'); return; }
    if (file.size > 2 * 1024 * 1024) { setLogoError('Logo must be under 2MB'); return; }
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
      const res = await api.post('/company/profile/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        setLogoData(res.data.data.logo);
        setSelectedLogo(null);
        if (logoPreview) URL.revokeObjectURL(logoPreview);
        setLogoPreview(null);
        setMessage({ type: 'success', text: 'Logo saved!' });
      }
    } catch (err) { setLogoError(err.response?.data?.message || 'Upload failed.'); }
    finally { setLogoUploading(false); }
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
    if (!validateAll()) { setMessage({ type: 'error', text: 'Please fix the errors before saving' }); return; }
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await api.put('/company/profile', {
        name: profile.name, industry: profile.industry, location: profile.location,
        website: profile.website, description: profile.description,
        hrName: profile.hrName, hrEmail: profile.hrEmail, hrPhone: profile.hrPhone, tier: profile.tier
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Profile updated!' });
        // Sync company name into AuthContext so navbar updates immediately
        if (profile.name) updateUser({ name: profile.name });
      }
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update' }); }
    finally { setSaving(false); }
  };

  if (loading) return <Loader />;
  if (!profile) return <p className="text-center text-bauhaus-black/50 mt-10 font-bold uppercase">Profile not found.</p>;

  const inputClass = "bauhaus-input";
  const inputErr = "w-full px-4 py-2.5 border-2 border-bauhaus-red shadow-[2px_2px_0px_0px_#D02020] outline-none transition-all text-sm font-medium";
  const labelClass = "block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-1.5";
  const errText = "text-xs text-bauhaus-red mt-1 font-bold";

  const displayLogoSrc = logoPreview || logoData?.url || null;
  const companyInitial = (profile.name || 'C').charAt(0).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-black text-bauhaus-black mb-6 uppercase tracking-wider">Company Profile</h1>

      {message.text && (
        <div className={`mb-4 p-3 text-sm border-2 border-bauhaus-black font-bold ${
          message.type === 'success' ? 'bg-bauhaus-yellow text-bauhaus-black' : 'bg-bauhaus-red text-white'
        }`}>{message.text}</div>
      )}

      <div className="space-y-6">
        {/* Logo */}
        <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
          <h2 className="text-lg font-black text-bauhaus-black mb-4 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">Company Logo</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <div className="w-24 h-24 overflow-hidden border-4 border-bauhaus-black bg-bauhaus-muted flex items-center justify-center">
                {displayLogoSrc && <img src={displayLogoSrc} alt="Logo" className="w-full h-full object-contain p-1" onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />}
                <span className="text-2xl font-black text-bauhaus-black/50 select-none" style={{ display: displayLogoSrc ? 'none' : 'flex' }}>{companyInitial}</span>
              </div>
              <label htmlFor="logoInput" className="absolute bottom-0 right-0 w-7 h-7 bg-bauhaus-red rounded-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-colors border-2 border-bauhaus-black" title="Change logo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              </label>
              <input id="logoInput" ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" className="hidden" onChange={handleLogoSelect} />
            </div>
            <div className="flex flex-col gap-2">
              {logoPreview ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <img src={logoPreview} alt="Preview" className="w-12 h-12 object-contain border-2 border-bauhaus-blue p-0.5" />
                  <div className="flex gap-2">
                    <button onClick={handleLogoUpload} disabled={logoUploading} className="px-4 py-1.5 bg-bauhaus-blue text-white text-sm font-bold border-2 border-bauhaus-black hover:opacity-90 disabled:opacity-50 transition uppercase">{logoUploading ? 'Saving...' : 'Save logo'}</button>
                    <button onClick={handleLogoCancel} className="px-4 py-1.5 border-2 border-bauhaus-black text-bauhaus-black text-sm font-bold hover:bg-bauhaus-muted transition uppercase">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-bauhaus-black/50 font-medium">{logoData?.url ? 'Click the camera icon to change your logo' : 'No logo uploaded yet.'}</p>
              )}
              <p className="text-xs text-bauhaus-black/30 font-bold uppercase tracking-wider">Square PNG or SVG · max 2MB</p>
              {logoError && <p className="text-xs text-bauhaus-red font-bold">{logoError}</p>}
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
          <h2 className="text-lg font-black text-bauhaus-black mb-4 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">Company Details</h2>
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

        {/* HR Contact */}
        <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
          <h2 className="text-lg font-black text-bauhaus-black mb-4 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">HR Contact</h2>
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

        {/* Tier */}
        <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
          <h2 className="text-lg font-black text-bauhaus-black mb-4 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">Company Tier</h2>
          <TierSelector selected={profile.tier || 'tier2'} onChange={(tier) => setProfile(prev => ({ ...prev, tier }))} />
        </div>

        {/* Approval */}
        <div className="bg-white border-4 border-bauhaus-black p-4 shadow-hard-sm">
          <span className={`px-3 py-1 text-sm font-black border-2 border-bauhaus-black uppercase ${profile.isApproved ? 'bg-bauhaus-blue text-white' : 'bg-bauhaus-yellow text-bauhaus-black'}`}>
            {profile.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
          </span>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 bg-bauhaus-red text-white font-black hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 border-4 border-bauhaus-black shadow-hard-md active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider">
          <Save className="w-5 h-5" />{saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default CompanyProfile;
