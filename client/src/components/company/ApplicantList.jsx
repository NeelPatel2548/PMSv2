import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, FileText, CheckCircle, XCircle, Calendar, Download } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const statusColors = {
  applied: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  interview: 'bg-purple-100 text-purple-700',
  selected: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-500',
};

const TABS = ['all', 'applied', 'shortlisted', 'interview', 'selected', 'rejected'];

const ApplicantList = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Interview form state
  const [interviewFor, setInterviewFor] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    roundName: '', roundNumber: 1, scheduledAt: '', mode: 'online', venue: '', meetingLink: ''
  });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appRes] = await Promise.all([
          api.get(`/company/jobs/${jobId}`),
          api.get(`/company/jobs/${jobId}/applicants?page=${page}&limit=20`)
        ]);
        if (jobRes.data.success) setJob(jobRes.data.data);
        if (appRes.data.success) {
          const data = appRes.data.data;
          setApplicants(data.results || data);
          if (data.pagination) setPagination(data.pagination);
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetchData();
  }, [jobId, page]);

  const updateStatus = async (appId, status) => {
    if (status === 'selected') {
      if (!window.confirm('Mark this candidate as SELECTED? This will update their placement status.')) return;
    }
    if (status === 'rejected') {
      if (!window.confirm('Reject this candidate? This action cannot be easily undone.')) return;
    }
    setUpdating(appId);
    try {
      const res = await api.put(`/company/applications/${appId}/status`, { status });
      if (res.data.success) {
        setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally { setUpdating(null); }
  };

  const handleScheduleInterview = async (appId) => {
    if (!interviewForm.roundName.trim() || !interviewForm.scheduledAt) {
      alert('Please fill in round name and date/time');
      return;
    }
    setScheduling(true);
    try {
      const res = await api.post('/company/interviews', {
        applicationId: appId,
        ...interviewForm
      });
      if (res.data.success) {
        setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: 'interview', currentRound: interviewForm.roundName } : a));
        setInterviewFor(null);
        setInterviewForm({ roundName: '', roundNumber: 1, scheduledAt: '', mode: 'online', venue: '', meetingLink: '' });
        alert('Interview scheduled successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule interview');
    } finally { setScheduling(false); }
  };

  if (loading) return <Loader />;

  const filtered = filter === 'all' ? applicants : applicants.filter(a => a.status === filter);

  // Stats
  const stats = {
    total: applicants.length,
    applied: applicants.filter(a => a.status === 'applied').length,
    shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
    interview: applicants.filter(a => a.status === 'interview').length,
    selected: applicants.filter(a => a.status === 'selected').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
  };

  const inputClass = "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/company/jobs')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">Applicants</h1>
          {job && <p className="text-slate-500 text-sm mt-0.5">{job.title}</p>}
        </div>
        <button
          onClick={async () => {
            setExporting(true);
            try {
              const res = await api.get(`/company/jobs/${jobId}/export`, { responseType: 'blob' });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const a = document.createElement('a');
              a.href = url;
              a.download = `applicants_${jobId}.csv`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              alert('Failed to export CSV');
            } finally { setExporting(false); }
          }}
          disabled={exporting || applicants.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
          id="export-csv-btn"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-slate-100 text-slate-700' },
          { label: 'Applied', value: stats.applied, color: 'bg-blue-50 text-blue-700' },
          { label: 'Shortlisted', value: stats.shortlisted, color: 'bg-amber-50 text-amber-700' },
          { label: 'Interview', value: stats.interview, color: 'bg-purple-50 text-purple-700' },
          { label: 'Selected', value: stats.selected, color: 'bg-green-50 text-green-700' },
          { label: 'Rejected', value: stats.rejected, color: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-full px-4 py-1.5 text-center border bg-white ${s.color}`}>
            <span className="text-lg font-bold">{s.value}</span>{' '}
            <span className="text-xs font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-all border-b-2 rounded-none ${
              filter === tab
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}>
            {tab === 'all' ? `All (${stats.total})` : `${tab} (${stats[tab]})`}
          </button>
        ))}
      </div>

      {/* Applicant Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">{filter === 'all' ? 'No applications yet for this job' : `No ${filter} applications`}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app, i) => (
            <motion.div key={app._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-sm transition">
              {/* Student Info */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {/* Student avatar — profile picture or initials fallback */} {/* NEW */}
                  <div className="relative w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-sm overflow-hidden"> {/* NEW */}
                    {app.student?.profilePicture?.url ? ( // NEW
                      <img // NEW
                        src={app.student.profilePicture.url} // NEW
                        alt="" // NEW
                        className="w-full h-full object-cover" // NEW
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} // NEW
                      /> // NEW
                    ) : null} // NEW
                    <span className="absolute inset-0 flex items-center justify-center" style={{ display: app.student?.profilePicture?.url ? 'none' : 'flex' }}> {/* NEW */}
                      {app.student?.user?.name?.charAt(0)?.toUpperCase() || '?'} // NEW
                    </span> // NEW
                  </div> {/* NEW */}
                  <div>
                    <h3 className="font-semibold text-slate-800">{app.student?.user?.name || 'Student'}</h3>
                    <p className="text-sm text-slate-500">{app.student?.user?.email}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                      <span>{app.student?.branch || '—'} • {app.student?.passingYear || '—'}</span>
                      <span>CGPA: <strong className="text-slate-700">{app.student?.cgpa ?? '—'}</strong></span>
                      <span>Backlogs: <strong className="text-slate-700">{app.student?.activeBacklogs ?? 0}</strong></span>
                      {app.student?.enrollmentNo && <span>Enr: {app.student.enrollmentNo}</span>}
                    </div>
                  </div>
                </div>
                <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[app.status]}`}>{app.status}</span>
              </div>


              {/* Skills */}
              {app.student?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {app.student.skills.map((s, j) => (
                    <span key={j} className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-xs font-medium text-indigo-700 border border-indigo-100">{s}</span>
                  ))}
                </div>
              )}

              {/* Meta + Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">Applied {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}</span>
                <div className="flex flex-wrap gap-2">
                  {app.student?.resumeUrl ? (
                    <a href={app.student.resumeUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-xs text-slate-700 hover:bg-slate-200 font-medium">
                      <FileText className="w-3 h-3" /> View Resume
                    </a>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 text-xs text-slate-400 cursor-not-allowed" title="No resume uploaded">
                      <FileText className="w-3 h-3" /> No Resume
                    </span>
                  )}

                  {!['selected', 'rejected', 'withdrawn'].includes(app.status) && (
                    <>
                      {app.status === 'applied' && (
                        <button onClick={() => updateStatus(app._id, 'shortlisted')} disabled={updating === app._id}
                          className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-medium hover:bg-amber-200 disabled:opacity-50">
                          Shortlist
                        </button>
                      )}
                      {['applied', 'shortlisted'].includes(app.status) && (
                        <button onClick={() => setInterviewFor(interviewFor === app._id ? null : app._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium hover:bg-purple-200">
                          <Calendar className="w-3 h-3" /> Schedule Interview
                        </button>
                      )}
                      <button onClick={() => updateStatus(app._id, 'selected')} disabled={updating === app._id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 disabled:opacity-50">
                        <CheckCircle className="w-3 h-3" /> Select
                      </button>
                      <button onClick={() => updateStatus(app._id, 'rejected')} disabled={updating === app._id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 disabled:opacity-50">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Interview Scheduling Form */}
              {interviewFor === app._id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 p-4 rounded-xl bg-purple-50 border border-purple-100 space-y-3">
                  <h4 className="text-sm font-semibold text-purple-800">Schedule Interview for {app.student?.user?.name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Round Name *</label>
                      <input type="text" value={interviewForm.roundName} onChange={(e) => setInterviewForm({...interviewForm, roundName: e.target.value})} className={inputClass} placeholder="e.g. Technical Round 1" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Round Number</label>
                      <input type="number" min="1" value={interviewForm.roundNumber} onChange={(e) => setInterviewForm({...interviewForm, roundNumber: parseInt(e.target.value) || 1})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Date & Time *</label>
                      <input type="datetime-local" value={interviewForm.scheduledAt} onChange={(e) => setInterviewForm({...interviewForm, scheduledAt: e.target.value})} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Mode</label>
                      <select value={interviewForm.mode} onChange={(e) => setInterviewForm({...interviewForm, mode: e.target.value})} className={inputClass}>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                    {interviewForm.mode === 'offline' ? (
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Venue</label>
                        <input type="text" value={interviewForm.venue} onChange={(e) => setInterviewForm({...interviewForm, venue: e.target.value})} className={inputClass} placeholder="e.g. Room 101, Main Building" />
                      </div>
                    ) : (
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Meeting Link</label>
                        <input type="url" value={interviewForm.meetingLink} onChange={(e) => setInterviewForm({...interviewForm, meetingLink: e.target.value})} className={inputClass} placeholder="https://meet.google.com/..." />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleScheduleInterview(app._id)} disabled={scheduling}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50">
                      {scheduling ? 'Scheduling...' : 'Schedule'}
                    </button>
                    <button onClick={() => setInterviewFor(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100">
          <p className="text-sm text-slate-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition">Prev</button>
            <button disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium disabled:opacity-40 hover:bg-slate-50 transition">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantList;
