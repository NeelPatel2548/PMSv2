import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, Building2, Globe, MapPin, Users,
  Mail, Phone, User, Briefcase, AlertCircle, Loader2
} from 'lucide-react';
import api from '../../services/api';

const tierLabels = {
  tier1: { label: 'Tier 1', cls: 'bg-bauhaus-yellow text-bauhaus-black' },
  tier2: { label: 'Tier 2', cls: 'bg-bauhaus-blue text-white' },
  mass_recruiter: { label: 'Mass Recruiter', cls: 'bg-bauhaus-red text-white' }
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
          <div className="bauhaus-loader"><div></div><div></div><div></div></div>
          <p className="text-sm text-bauhaus-black/50 font-bold uppercase">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className="flex items-center gap-3 p-4 bg-bauhaus-red text-white border-2 border-bauhaus-black font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
        <button onClick={() => navigate(-1)} className="mt-4 flex items-center gap-2 text-sm text-bauhaus-black/60 hover:text-bauhaus-blue transition font-bold uppercase">
          <ArrowLeft className="w-4 h-4" /> Back to Companies
        </button>
      </div>
    );
  }

  if (!company) return null;

  const tierInfo = tierLabels[company.tier] || { label: company.tier, cls: 'bg-bauhaus-muted text-bauhaus-black/60' };
  const logoSrc = company.logo?.url || null;
  const initial = (company.name || 'C').charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 bg-bauhaus-black text-white text-sm font-black border-2 border-bauhaus-yellow shadow-hard-sm uppercase">
          {toast}
        </div>
      )}

      {/* Back button */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-bauhaus-black/50 hover:text-bauhaus-blue transition font-bold uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" /> Back to Companies
      </button>

      {/* Header card */}
      <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-md">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          {/* Logo */}
          <div className="w-20 h-20 bg-bauhaus-muted flex items-center justify-center overflow-hidden shrink-0 border-4 border-bauhaus-black">
            {logoSrc ? (
              <img src={logoSrc} alt={company.name} className="w-full h-full object-contain p-1"
                onError={(e) => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }} />
            ) : null}
            <span className="text-3xl font-black text-bauhaus-black/50" style={{ display: logoSrc ? 'none' : 'flex' }}>{initial}</span>
          </div>

          {/* Company info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-bauhaus-black uppercase tracking-wider">{company.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 text-xs font-black uppercase border-2 border-bauhaus-black ${tierInfo.cls}`}>{tierInfo.label}</span>
                  <span className={`px-2.5 py-0.5 text-xs font-black uppercase border-2 border-bauhaus-black ${company.isApproved ? 'bg-bauhaus-blue text-white' : 'bg-bauhaus-yellow text-bauhaus-black'}`}>
                    {company.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
                  </span>
                </div>
              </div>

              {/* Approve / Reject */}
              <div className="flex gap-2 shrink-0">
                {!company.isApproved ? (
                  <button onClick={() => handleApproval(true)} disabled={approving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-bauhaus-blue text-white text-sm font-black border-2 border-bauhaus-black hover:opacity-90 disabled:opacity-50 transition uppercase">
                    <CheckCircle className="w-4 h-4" />{approving ? 'Approving...' : 'Approve'}
                  </button>
                ) : (
                  <button onClick={() => handleApproval(false)} disabled={approving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-bauhaus-red text-white text-sm font-black border-2 border-bauhaus-black hover:opacity-90 disabled:opacity-50 transition uppercase">
                    <XCircle className="w-4 h-4" />{approving ? 'Revoking...' : 'Revoke Approval'}
                  </button>
                )}
              </div>
            </div>

            {/* Quick info row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-bauhaus-black/50 font-bold">
              {company.industry && <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-bauhaus-black/30" /> {company.industry}</span>}
              {company.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-bauhaus-black/30" /> {company.location}</span>}
              {company.website && (
                <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-bauhaus-blue hover:underline">
                  <Globe className="w-4 h-4" /> {company.website}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {company.description && (
          <div className="mt-5 pt-5 border-t-2 border-bauhaus-black">
            <p className="text-sm text-bauhaus-black/70 leading-relaxed font-medium">{company.description}</p>
          </div>
        )}
      </div>

      {/* HR Contact */}
      <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
        <h2 className="text-sm font-black text-bauhaus-black mb-4 flex items-center gap-2 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">
          <User className="w-4 h-4 text-bauhaus-red" /> HR Contact
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: User, label: 'HR Name', value: company.hrName || '—', color: 'bg-bauhaus-blue' },
            { icon: Mail, label: 'HR Email', value: company.hrEmail || '—', color: 'bg-bauhaus-red' },
            { icon: Phone, label: 'HR Phone', value: company.hrPhone || '—', color: 'bg-bauhaus-yellow' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2.5">
              <div className={`w-8 h-8 ${item.color} flex items-center justify-center shrink-0 border-2 border-bauhaus-black ${item.color === 'bg-bauhaus-yellow' ? 'text-bauhaus-black' : 'text-white'}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-bauhaus-black/30 font-bold uppercase">{item.label}</p>
                <p className="text-sm font-bold text-bauhaus-black break-all">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account info */}
      <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
        <h2 className="text-sm font-black text-bauhaus-black mb-4 flex items-center gap-2 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">
          <Users className="w-4 h-4 text-bauhaus-blue" /> Account Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-bauhaus-black/30 font-bold uppercase mb-0.5">Registered Email</p>
            <p className="font-bold text-bauhaus-black break-all">{company.user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-bauhaus-black/30 font-bold uppercase mb-0.5">Account Status</p>
            <span className={`inline-block px-2.5 py-0.5 text-xs font-black uppercase border-2 border-bauhaus-black ${company.user?.isActive ? 'bg-bauhaus-blue text-white' : 'bg-bauhaus-red text-white'}`}>
              {company.user?.isActive ? 'Active' : 'Suspended'}
            </span>
          </div>
          <div>
            <p className="text-xs text-bauhaus-black/30 font-bold uppercase mb-0.5">Joined</p>
            <p className="font-bold text-bauhaus-black">{company.createdAt ? new Date(company.createdAt).toLocaleDateString() : '—'}</p>
          </div>
        </div>
      </div>

      {/* Jobs Posted */}
      <div className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-sm">
        <h2 className="text-sm font-black text-bauhaus-black mb-4 flex items-center gap-2 uppercase tracking-wider border-b-2 border-bauhaus-black pb-2">
          <Briefcase className="w-4 h-4 text-bauhaus-yellow" /> Drives Posted
          <span className="ml-auto text-xs text-bauhaus-black/30 font-bold">{jobs.length} total</span>
        </h2>

        {jobs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-bauhaus-black/30">
            <Briefcase className="w-10 h-10" />
            <p className="text-sm text-bauhaus-black/40 font-bold uppercase">No drives posted yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b-2 border-bauhaus-black text-xs text-bauhaus-black/40 uppercase">
                  <th className="pb-3 font-black tracking-wider">Role</th>
                  <th className="pb-3 font-black tracking-wider">Type</th>
                  <th className="pb-3 font-black tracking-wider">Package</th>
                  <th className="pb-3 font-black tracking-wider">Status</th>
                  <th className="pb-3 font-black tracking-wider">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job._id} className="border-b border-bauhaus-muted hover:bg-bauhaus-muted/30 transition">
                    <td className="py-3 font-bold text-bauhaus-black pr-4">{job.title}</td>
                    <td className="py-3 text-bauhaus-black/50 capitalize pr-4 font-medium">{job.jobType || '—'}</td>
                    <td className="py-3 text-bauhaus-black font-bold pr-4">
                      {job.package ? `₹${job.package} LPA` : job.stipend ? `₹${job.stipend}/mo` : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2.5 py-0.5 text-xs font-black uppercase border-2 border-bauhaus-black ${job.status === 'open' ? 'bg-bauhaus-blue text-white' : 'bg-bauhaus-muted text-bauhaus-black/50'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 text-bauhaus-black/50 font-medium">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminCompanyView;
