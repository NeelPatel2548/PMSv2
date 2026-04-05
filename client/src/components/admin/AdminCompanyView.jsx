import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle, XCircle, Building2, Globe, MapPin, Users,
  Mail, Phone, User, Briefcase, AlertCircle, Loader2
} from 'lucide-react';
import api from '../../services/api';

const tierLabels = {
  tier1: { label: 'Tier 1', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  tier2: { label: 'Tier 2', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  mass_recruiter: { label: 'Mass Recruiter', cls: 'bg-green-100 text-green-700 border-green-200' }
};

const AdminCompanyView = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const [companyRes, jobsRes] = await Promise.all([
          api.get(`/admin/companies/${companyId}`),
          api.get(`/admin/jobs?company=${companyId}`)
        ]);
        if (companyRes.data.success) setCompany(companyRes.data.data);
        if (jobsRes.data.success) {
          const jobData = jobsRes.data.data;
          // Filter to only this company's jobs (backend may not support query param)
          const all = Array.isArray(jobData) ? jobData : (jobData.results || []);
          setJobs(all.filter(j => {
            const cid = j.company?._id || j.company;
            return String(cid) === String(companyId);
          }));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load company profile.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [companyId]);

  const handleApproval = async (approve) => {
    setApproving(true);
    try {
      const res = await api.put(`/admin/companies/${companyId}/approve`, { isApproved: approve });
      if (res.data.success) {
        setCompany(prev => ({ ...prev, isApproved: approve }));
        showToast(approve ? 'Company approved successfully!' : 'Company approval revoked.');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
        <button onClick={() => navigate(-1)} className="mt-4 flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Companies
        </button>
      </div>
    );
  }

  if (!company) return null;

  const tierInfo = tierLabels[company.tier] || { label: company.tier, cls: 'bg-slate-100 text-slate-600' };
  const logoSrc = company.logo?.url || null;
  const initial = (company.name || 'C').charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 right-6 z-50 px-5 py-3 bg-slate-900 text-white text-sm rounded-xl shadow-xl"
        >
          {toast}
        </motion.div>
      )}

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Companies
      </button>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">

          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-slate-200">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={company.name}
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span
              className="text-3xl font-bold text-slate-500"
              style={{ display: logoSrc ? 'none' : 'flex' }}
            >
              {initial}
            </span>
          </div>

          {/* Company info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{company.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${tierInfo.cls}`}>
                    {tierInfo.label}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${company.isApproved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {company.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
                  </span>
                </div>
              </div>

              {/* Approve / Reject */}
              <div className="flex gap-2 shrink-0">
                {!company.isApproved ? (
                  <button
                    onClick={() => handleApproval(true)}
                    disabled={approving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {approving ? 'Approving...' : 'Approve'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleApproval(false)}
                    disabled={approving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    {approving ? 'Revoking...' : 'Revoke Approval'}
                  </button>
                )}
              </div>
            </div>

            {/* Quick info row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-slate-500">
              {company.industry && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" /> {company.industry}
                </span>
              )}
              {company.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> {company.location}
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-indigo-600 hover:underline"
                >
                  <Globe className="w-4 h-4" /> {company.website}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-sm text-slate-600 leading-relaxed">{company.description}</p>
          </div>
        )}
      </motion.div>

      {/* HR Contact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
      >
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" /> HR Contact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">HR Name</p>
              <p className="text-sm font-medium text-slate-800">{company.hrName || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">HR Email</p>
              <p className="text-sm font-medium text-slate-800 break-all">{company.hrEmail || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">HR Phone</p>
              <p className="text-sm font-medium text-slate-800">{company.hrPhone || '—'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
      >
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" /> Account Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Registered Email</p>
            <p className="font-medium text-slate-800 break-all">{company.user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Account Status</p>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${company.user?.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {company.user?.isActive ? 'Active' : 'Suspended'}
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Joined</p>
            <p className="font-medium text-slate-800">
              {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : '—'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Jobs Posted */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.11 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
      >
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-indigo-500" /> Drives Posted
          <span className="ml-auto text-xs text-slate-400 font-normal">{jobs.length} total</span>
        </h2>

        {jobs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-slate-300">
            <Briefcase className="w-10 h-10" />
            <p className="text-sm text-slate-400">No drives posted yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase">
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Package</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {jobs.map(job => (
                  <tr key={job._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 font-medium text-slate-800 pr-4">{job.title}</td>
                    <td className="py-3 text-slate-500 capitalize pr-4">{job.jobType || '—'}</td>
                    <td className="py-3 text-slate-700 pr-4">
                      {job.package ? `₹${job.package} LPA` : job.stipend ? `₹${job.stipend}/mo` : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${job.status === 'open' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

    </div>
  );
};

export default AdminCompanyView;
