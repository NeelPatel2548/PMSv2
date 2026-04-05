import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, PlusCircle, X, Upload, Linkedin, Github, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';
import SkillsSelector from '../common/SkillsSelector';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [picUploading, setPicUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const picInputRef = useRef(null);

  // Project form
  const [projectForm, setProjectForm] = useState({ title: '', description: '', link: '' });
  // Cert form
  const [certForm, setCertForm] = useState({ title: '', issuedBy: '', year: '', link: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/student/profile');
        if (res.data.success) {
          setProfile(res.data.data);
          setProfilePicture(res.data.data.profilePicture || null);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Profile picture handlers
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setUploadError('Only JPG, PNG, or WEBP images are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('Profile picture must be under 2MB');
      return;
    }

    setUploadError('');
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setPicUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);
      const res = await api.post('/student/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setProfilePicture(res.data.data.profilePicture);
        setPreviewUrl(null);
        setSelectedFile(null);
        setMessage({ type: 'success', text: 'Profile picture saved!' });
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed');
    } finally {
      setPicUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadError('');
    if (picInputRef.current) picInputRef.current.value = '';
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleNameChange = (value) => {
    setProfile(prev => ({
      ...prev,
      user: { ...prev.user, name: value },
      _userName: value
    }));
    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
  };

  const validateField = (field, value) => {
    let err = '';
    switch (field) {
      case 'phone':
        if (value && !/^[0-9]{10}$/.test(value)) err = `Phone must be exactly 10 digits (currently ${(value || '').length} digits)`;
        break;
      case 'dob':
        if (value && new Date(value) > new Date()) err = 'Date of birth cannot be in the future';
        break;
      case 'address':
        if (value && value.length < 5) err = 'Address must be at least 5 characters';
        break;
      case 'cgpa':
        if (value !== '' && value !== undefined && (value < 0 || value > 10)) err = 'CGPA must be between 0 and 10';
        break;
      case 'tenthPercentage':
      case 'twelfthPercentage':
        if (value !== '' && value !== undefined && (value < 0 || value > 100)) err = 'Percentage must be between 0 and 100';
        break;
      case 'passingYear':
        if (value !== '' && value !== undefined && (value < 2020 || value > 2030)) err = 'Must be between 2020 and 2030';
        break;
      case 'currentSemester':
        if (value !== '' && value !== undefined && (value < 1 || value > 8)) err = 'Must be between 1 and 8';
        break;
      case 'enrollmentNo':
        if (!value || !value.trim()) err = 'Enrollment number is required';
        else if (!/^\d{13}$/.test(value)) err = `Enrollment number must be exactly 13 digits (currently ${(value || '').length} digits)`;
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field) => {
    validateField(field, profile[field]);
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
    } finally {
      setUploading(false);
    }
  };

  const validateAll = () => {
    const newErrors = {};
    if (profile.phone && !/^[0-9]{10}$/.test(profile.phone))
      newErrors.phone = `Phone must be exactly 10 digits (currently ${(profile.phone || '').length} digits)`;
    if (profile.dob && new Date(profile.dob) > new Date())
      newErrors.dob = 'Date of birth cannot be in the future';
    if (profile.address && profile.address.length < 5)
      newErrors.address = 'Address must be at least 5 characters';
    if (!profile.academicVerified) {
      if (profile.enrollmentNo && !/^\d{13}$/.test(profile.enrollmentNo))
        newErrors.enrollmentNo = `Enrollment number must be exactly 13 digits (currently ${(profile.enrollmentNo || '').length} digits)`;
      if (profile.cgpa !== undefined && profile.cgpa !== '' && (profile.cgpa < 0 || profile.cgpa > 10))
        newErrors.cgpa = 'CGPA must be between 0 and 10';
      if (profile.tenthPercentage !== undefined && profile.tenthPercentage !== '' && (profile.tenthPercentage < 0 || profile.tenthPercentage > 100))
        newErrors.tenthPercentage = 'Percentage must be between 0 and 100';
      if (profile.twelfthPercentage !== undefined && profile.twelfthPercentage !== '' && (profile.twelfthPercentage < 0 || profile.twelfthPercentage > 100))
        newErrors.twelfthPercentage = 'Percentage must be between 0 and 100';
      if (profile.passingYear !== undefined && profile.passingYear !== '' && (profile.passingYear < 2020 || profile.passingYear > 2030))
        newErrors.passingYear = 'Must be between 2020 and 2030';
      if (profile.currentSemester !== undefined && profile.currentSemester !== '' && (profile.currentSemester < 1 || profile.currentSemester > 8))
        newErrors.currentSemester = 'Must be between 1 and 8';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateAll()) {
      setMessage({ type: 'error', text: 'Please fix the errors before saving' });
      return;
    }
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

      if (!profile.academicVerified) {
        payload.enrollmentNo = profile.enrollmentNo;
        payload.branch = profile.branch;
        payload.passingYear = profile.passingYear;
        payload.currentSemester = profile.currentSemester;
        payload.cgpa = profile.cgpa;
        payload.tenthPercentage = profile.tenthPercentage;
        payload.twelfthPercentage = profile.twelfthPercentage;
        payload.activeBacklogs = profile.activeBacklogs;
      }

      const res = await api.put('/student/profile', payload);
      if (res.data.success) {
        setProfile(res.data.data);
        setMessage({ type: 'success', text: 'Profile saved successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!profile) return <p className="text-center text-slate-500 mt-10">Profile not found.</p>;

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm";
  const inputErr = "w-full px-4 py-2.5 rounded-xl border border-red-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none transition-all text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";
  const readOnly = "w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-500 cursor-not-allowed";
  const errText = "text-xs text-red-500 mt-1 font-medium";
  const getInputClass = (field) => errors[field] ? inputErr : inputClass;

  const studentName = profile._userName || profile.user?.name || '';
  const displayUrl = previewUrl || profilePicture?.url || null;

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>
      </motion.div>

      {message.text && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-600 border border-green-100'
              : 'bg-red-50 text-red-700 border-l-4 border-red-500'
          }`}>
          {message.type === 'success' && <CheckCircle className="w-4 h-4" />}
          {message.text}
        </motion.div>
      )}

      <div className="space-y-6">

        {/* Profile Picture */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">

            {/* Avatar circle */}
            <div className="relative w-24 h-24 flex-shrink-0">
              {displayUrl && (
                <img
                  src={displayUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              )}
              <div
                className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-semibold"
                style={{ display: displayUrl ? 'none' : 'flex' }}
              >
                {studentName.charAt(0).toUpperCase() || 'S'}
              </div>

              {/* Camera overlay */}
              <label
                htmlFor="profilePicInput"
                className="absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow-md"
                title="Change profile picture"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </label>
              <input
                id="profilePicInput"
                ref={picInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {/* Right side info + action buttons */}
            <div className="flex flex-col gap-2">
              {previewUrl ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-300"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpload}
                      disabled={picUploading}
                      className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                      {picUploading ? 'Saving...' : 'Save photo'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-1.5 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  {profilePicture?.url
                    ? 'Click the camera icon to change your photo'
                    : 'No profile picture uploaded yet.'}
                </p>
              )}
              <p className="text-xs text-slate-400">JPG, PNG or WEBP · max 2MB</p>
              {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
            </div>

          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={(profile._userName ?? profile.user?.name) || ''}
                onChange={(e) => handleNameChange(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={profile.user?.email || ''} readOnly className={readOnly} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                maxLength={10}
                value={profile.phone || ''}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) handleChange('phone', val);
                }}
                onBlur={() => handleBlur('phone')}
                className={getInputClass('phone')}
                placeholder="10-digit number"
              />
              {errors.phone && <p className={errText}>{errors.phone}</p>}
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select
                value={profile.gender || ''}
                onChange={(e) => handleChange('gender', e.target.value)}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input
                type="date"
                value={profile.dob ? profile.dob.substring(0, 10) : ''}
                onChange={(e) => handleChange('dob', e.target.value)}
                onBlur={() => handleBlur('dob')}
                className={getInputClass('dob')}
              />
              {errors.dob && <p className={errText}>{errors.dob}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Address</label>
              <textarea
                value={profile.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                onBlur={() => handleBlur('address')}
                className={getInputClass('address')}
                rows="2"
              />
              {errors.address && <p className={errText}>{errors.address}</p>}
            </div>
          </div>
        </div>

        {/* Academic Records */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-slate-800">Academic Records</h2>
            {profile.academicVerified
              ? <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">✓ Verified</span>
              : (profile.enrollmentNo || profile.branch) && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">⏳ Pending</span>
              )
            }
          </div>

          {profile.academicVerified ? (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>
                Your academic records have been verified by the administration.
                {profile.academicVerifiedAt && ` Verified on ${new Date(profile.academicVerifiedAt).toLocaleDateString()}`}
              </span>
            </div>
          ) : profile.enrollmentNo || profile.branch || profile.cgpa != null ? (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm">
              <span>⏳ Your academic records are pending admin verification. You can still make changes.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm">
              <span>ℹ️ Fill in your academic details and save for admin verification.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Enrollment No</label>
              {profile.academicVerified
                ? <input value={profile.enrollmentNo || '—'} readOnly className={readOnly} />
                : (
                  <input
                    type="text"
                    maxLength={13}
                    value={profile.enrollmentNo || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 13) handleChange('enrollmentNo', val);
                    }}
                    onBlur={() => handleBlur('enrollmentNo')}
                    className={getInputClass('enrollmentNo')}
                    placeholder="13-digit number"
                  />
                )
              }
              {errors.enrollmentNo && <p className={errText}>{errors.enrollmentNo}</p>}
            </div>
            <div>
              <label className={labelClass}>Branch</label>
              {profile.academicVerified
                ? <input value={profile.branch || '—'} readOnly className={readOnly} />
                : (
                  <select
                    value={profile.branch || ''}
                    onChange={(e) => handleChange('branch', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select Branch</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="EE">EE</option>
                    <option value="ME">ME</option>
                    <option value="CE">CE</option>
                    <option value="Other">Other</option>
                  </select>
                )
              }
            </div>
            <div>
              <label className={labelClass}>Passing Year</label>
              {profile.academicVerified
                ? <input value={profile.passingYear || '—'} readOnly className={readOnly} />
                : (
                  <input
                    type="number"
                    min="2020"
                    max="2030"
                    value={profile.passingYear || ''}
                    onChange={(e) => handleChange('passingYear', parseInt(e.target.value) || '')}
                    onBlur={() => handleBlur('passingYear')}
                    className={getInputClass('passingYear')}
                  />
                )
              }
              {errors.passingYear && <p className={errText}>{errors.passingYear}</p>}
            </div>
            <div>
              <label className={labelClass}>Current Semester</label>
              {profile.academicVerified
                ? <input value={profile.currentSemester || '—'} readOnly className={readOnly} />
                : (
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={profile.currentSemester || ''}
                    onChange={(e) => handleChange('currentSemester', parseInt(e.target.value) || '')}
                    onBlur={() => handleBlur('currentSemester')}
                    className={getInputClass('currentSemester')}
                    placeholder="e.g. 6"
                  />
                )
              }
              {errors.currentSemester && <p className={errText}>{errors.currentSemester}</p>}
            </div>
            <div>
              <label className={labelClass}>CGPA</label>
              {profile.academicVerified
                ? <input value={profile.cgpa ?? '—'} readOnly className={readOnly} />
                : (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={profile.cgpa ?? ''}
                    onChange={(e) => handleChange('cgpa', parseFloat(e.target.value) || '')}
                    onBlur={() => handleBlur('cgpa')}
                    className={getInputClass('cgpa')}
                  />
                )
              }
              {errors.cgpa && <p className={errText}>{errors.cgpa}</p>}
            </div>
            <div>
              <label className={labelClass}>10th %</label>
              {profile.academicVerified
                ? <input value={profile.tenthPercentage ?? '—'} readOnly className={readOnly} />
                : (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={profile.tenthPercentage ?? ''}
                    onChange={(e) => handleChange('tenthPercentage', parseFloat(e.target.value) || '')}
                    onBlur={() => handleBlur('tenthPercentage')}
                    className={getInputClass('tenthPercentage')}
                  />
                )
              }
              {errors.tenthPercentage && <p className={errText}>{errors.tenthPercentage}</p>}
            </div>
            <div>
              <label className={labelClass}>12th %</label>
              {profile.academicVerified
                ? <input value={profile.twelfthPercentage ?? '—'} readOnly className={readOnly} />
                : (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={profile.twelfthPercentage ?? ''}
                    onChange={(e) => handleChange('twelfthPercentage', parseFloat(e.target.value) || '')}
                    onBlur={() => handleBlur('twelfthPercentage')}
                    className={getInputClass('twelfthPercentage')}
                  />
                )
              }
              {errors.twelfthPercentage && <p className={errText}>{errors.twelfthPercentage}</p>}
            </div>
            <div>
              <label className={labelClass}>Active Backlogs</label>
              {profile.academicVerified
                ? <input value={profile.activeBacklogs ?? 0} readOnly className={readOnly} />
                : (
                  <input
                    type="number"
                    min="0"
                    value={profile.activeBacklogs ?? ''}
                    onChange={(e) => handleChange('activeBacklogs', parseInt(e.target.value) || 0)}
                    className={inputClass}
                  />
                )
              }
            </div>
            <div>
              <label className={labelClass}>Placement Status</label>
              <input value={profile.placementStatus || 'unplaced'} readOnly className={readOnly} />
            </div>
          </div>
        </div>

        {/* Online Profiles */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Online Profiles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className={labelClass}>LinkedIn</label>
              <Linkedin className="absolute left-3 bottom-3 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={profile.linkedin || ''}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="relative">
              <label className={labelClass}>GitHub</label>
              <Github className="absolute left-3 bottom-3 w-4 h-4 text-slate-400" />
              <input
                type="url"
                value={profile.github || ''}
                onChange={(e) => handleChange('github', e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Skills</h2>
          <SkillsSelector
            selected={profile.skills || []}
            onChange={(skills) => handleChange('skills', skills)}
            maxSkills={10}
          />
        </div>

        {/* Projects */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Projects</h2>
          <div className="space-y-3 mb-4">
            {(profile.projects || []).map((p, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-800">{p.title}</p>
                  {p.description && <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>}
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 mt-0.5 block">
                      {p.link}
                    </a>
                  )}
                </div>
                <button onClick={() => removeProject(i)} className="p-1 rounded-lg hover:bg-red-100">
                  <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={projectForm.title}
              onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
              className={inputClass}
              placeholder="Project title *"
            />
            <input
              type="text"
              value={projectForm.description}
              onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
              className={inputClass}
              placeholder="Short description"
            />
            <div className="flex gap-2">
              <input
                type="url"
                value={projectForm.link}
                onChange={(e) => setProjectForm(prev => ({ ...prev, link: e.target.value }))}
                className={inputClass}
                placeholder="Link (optional)"
              />
              <button
                type="button"
                onClick={addProject}
                className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Certifications</h2>
          <div className="space-y-3 mb-4">
            {(profile.certifications || []).map((c, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-800">{c.title}</p>
                  <p className="text-xs text-slate-500">{c.issuedBy}{c.year ? ` • ${c.year}` : ''}</p>
                  {c.link && (
                    <a href={c.link} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 mt-0.5 block">
                      {c.link}
                    </a>
                  )}
                </div>
                <button onClick={() => removeCert(i)} className="p-1 rounded-lg hover:bg-red-100">
                  <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={certForm.title}
              onChange={(e) => setCertForm(prev => ({ ...prev, title: e.target.value }))}
              className={inputClass}
              placeholder="Certificate name *"
            />
            <input
              type="text"
              value={certForm.issuedBy}
              onChange={(e) => setCertForm(prev => ({ ...prev, issuedBy: e.target.value }))}
              className={inputClass}
              placeholder="Issued by"
            />
            <input
              type="text"
              value={certForm.year}
              onChange={(e) => setCertForm(prev => ({ ...prev, year: e.target.value }))}
              className={inputClass}
              placeholder="Year"
            />
            <div className="flex gap-2">
              <input
                type="url"
                value={certForm.link}
                onChange={(e) => setCertForm(prev => ({ ...prev, link: e.target.value }))}
                className={inputClass}
                placeholder="Link (optional)"
              />
              <button
                type="button"
                onClick={addCert}
                className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Internship Experience */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Internship Experience</h2>
          <textarea
            value={profile.internshipExperience || ''}
            onChange={(e) => handleChange('internshipExperience', e.target.value)}
            className={inputClass}
            rows="3"
            placeholder="Describe your internship experiences..."
          />
        </div>

        {/* Resume */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Resume</h2>
          {profile.resumeUrl && (
            <p className="text-sm text-green-600 mb-3 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Resume uploaded
            </p>
          )}
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition cursor-pointer">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Resume (PDF, max 2MB)'}
            <input
              type="file"
              accept=".pdf"
              onChange={handleResumeUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>

        {/* Spacer for sticky save button */}
        <div className="h-16 lg:h-0" />
      </div>

      {/* Sticky Save Button — desktop */}
      <div className="fixed bottom-6 right-6 z-30 hidden lg:block">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-60 flex items-center gap-2 shadow-xl shadow-indigo-500/25 hover:-translate-y-0.5"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Save Button — mobile */}
      <div className="lg:hidden mt-4">
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

export default StudentProfile;
