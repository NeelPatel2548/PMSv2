import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, FileText, CheckCircle, XCircle, Calendar, Download, Eye } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';
import ResumeViewer, { downloadResume } from '../common/ResumeViewer';

const statusColors = {
  applied: 'bg-bauhaus-blue text-white',
  shortlisted: 'bg-bauhaus-yellow text-bauhaus-black',
  interview: 'bg-bauhaus-red text-white',
  selected: 'bg-bauhaus-blue text-white',
  rejected: 'bg-bauhaus-muted text-bauhaus-black/60',
  withdrawn: 'bg-bauhaus-muted text-bauhaus-black/40',
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

  const [interviewFor, setInterviewFor] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    roundName: '', roundNumber: 1, scheduledAt: '', mode: 'online', venue: '', meetingLink: ''
  });
  const [scheduling, setScheduling] = useState(false);
  const [resumeView, setResumeView] = useState(null); // { url, name }

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
      } catch {} finally { setLoading(false); }
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
      if (res.data.success) setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
    } catch (err) { alert(err.response?.data?.message || 'Failed to update status'); }
    finally { setUpdating(null); }
  };

  const handleScheduleInterview = async (appId) => {
    if (!interviewForm.roundName.trim() || !interviewForm.scheduledAt) { alert('Please fill in round name and date/time'); return; }
    setScheduling(true);
    try {
      const res = await api.post('/company/interviews', { applicationId: appId, ...interviewForm });
      if (res.data.success) {
        setApplicants(prev => prev.map(a => a._id === appId ? { ...a, status: 'interview', currentRound: interviewForm.roundName } : a));
        setInterviewFor(null);
        setInterviewForm({ roundName: '', roundNumber: 1, scheduledAt: '', mode: 'online', venue: '', meetingLink: '' });
        alert('Interview scheduled successfully!');
      }
    } catch (err) { alert(err.response?.data?.message || 'Failed to schedule interview'); }
    finally { setScheduling(false); }
  };

  if (loading) return <Loader />;

  const filtered = filter === 'all' ? applicants : applicants.filter(a => a.status === filter);
  const stats = {
    total: applicants.length,
    applied: applicants.filter(a => a.status === 'applied').length,
    shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
    interview: applicants.filter(a => a.status === 'interview').length,
    selected: applicants.filter(a => a.status === 'selected').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
  };

  const inputClass = "bauhaus-input";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/company/jobs')} className="p-2 -ml-2 text-bauhaus-black/40 hover:text-bauhaus-black hover:bg-bauhaus-muted transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-bauhaus-black uppercase tracking-wider">Applicants</h1>
          {job && <p className="text-bauhaus-black/50 text-sm mt-0.5 font-medium">{job.title}</p>}
        </div>
        <button
          onClick={async () => {
            setExporting(true);
            try {
              const res = await api.get(`/company/jobs/${jobId}/export`, { responseType: 'blob' });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const a = document.createElement('a');
              a.href = url; a.download = `applicants_${jobId}.csv`;
              document.body.appendChild(a); a.click(); a.remove();
              window.URL.revokeObjectURL(url);
            } catch { alert('Failed to export CSV'); }
            finally { setExporting(false); }
          }}
          disabled={exporting || applicants.length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-bauhaus-blue text-white text-sm font-black border-2 border-bauhaus-black hover:opacity-90 transition disabled:opacity-50 uppercase tracking-wider"
          id="export-csv-btn"
        >
          <Download className="w-4 h-4" />{exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-bauhaus-muted text-bauhaus-black' },
          { label: 'Applied', value: stats.applied, color: 'bg-bauhaus-blue/10 text-bauhaus-blue' },
          { label: 'Shortlisted', value: stats.shortlisted, color: 'bg-bauhaus-yellow/30 text-bauhaus-black' },
          { label: 'Interview', value: stats.interview, color: 'bg-bauhaus-red/10 text-bauhaus-red' },
          { label: 'Selected', value: stats.selected, color: 'bg-bauhaus-blue/20 text-bauhaus-blue' },
          { label: 'Rejected', value: stats.rejected, color: 'bg-bauhaus-muted text-bauhaus-black/50' },
        ].map(s => (
          <div key={s.label} className={`px-4 py-2 text-center border-2 border-bauhaus-black ${s.color}`}>
            <span className="text-lg font-black">{s.value}</span>{' '}
            <span className="text-xs font-bold uppercase">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-black capitalize transition-all border-b-4 ${
              filter === tab
                ? 'border-bauhaus-blue text-bauhaus-blue'
                : 'border-transparent text-bauhaus-black/40 hover:text-bauhaus-black hover:border-bauhaus-black/20'
            } uppercase`}>
            {tab === 'all' ? `All (${stats.total})` : `${tab} (${stats[tab]})`}
          </button>
        ))}
      </div>

      {/* Applicant Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-bauhaus-black/40">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-black uppercase">{filter === 'all' ? 'No applications yet' : `No ${filter} applications`}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => (
            <div key={app._id} className="bg-white border-4 border-bauhaus-black p-5 shadow-hard-sm hover:-translate-y-0.5 transition-all">
              {/* Student Info */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="relative w-10 h-10 bg-bauhaus-blue text-white font-black flex items-center justify-center shrink-0 text-sm overflow-hidden border-2 border-bauhaus-black">
                    {app.student?.profilePicture?.url ? (
                      <img src={app.student.profilePicture.url} alt="" className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                    ) : null}
                    <span className="absolute inset-0 flex items-center justify-center" style={{ display: app.student?.profilePicture?.url ? 'none' : 'flex' }}>
                      {app.student?.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-bauhaus-black uppercase">{app.student?.user?.name || 'Student'}</h3>
                    <p className="text-sm text-bauhaus-black/50 font-medium">{app.student?.user?.email}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-bauhaus-black/50 font-bold">
                      <span>{app.student?.branch || '—'} • {app.student?.passingYear || '—'}</span>
                      <span>CGPA: <strong className="text-bauhaus-black">{app.student?.cgpa ?? '—'}</strong></span>
                      <span>Backlogs: <strong className="text-bauhaus-black">{app.student?.activeBacklogs ?? 0}</strong></span>
                      {app.student?.enrollmentNo && <span>Enr: {app.student.enrollmentNo}</span>}
                    </div>
                  </div>
                </div>
                <span className={`shrink-0 px-2.5 py-0.5 text-xs font-black capitalize border-2 border-bauhaus-black uppercase ${statusColors[app.status]}`}>{app.status}</span>
              </div>

              {/* Skills */}
              {app.student?.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {app.student.skills.map((s, j) => (
                    <span key={j} className="px-2.5 py-0.5 bg-bauhaus-blue/10 text-xs font-bold text-bauhaus-blue border-2 border-bauhaus-blue">{s}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-bauhaus-muted">
                <span className="text-xs text-bauhaus-black/30 font-bold">Applied {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}</span>
                <div className="flex flex-wrap gap-2">
                  {app.student?.resumeUrl ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => setResumeView({ url: app.student.resumeUrl, name: app.student?.user?.name || 'Student' })}
                        className="flex items-center gap-1 px-3 py-1.5 bg-bauhaus-muted text-xs text-bauhaus-black font-bold hover:bg-bauhaus-yellow/30 transition border-2 border-bauhaus-black/20 uppercase"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button
                        onClick={() => downloadResume(app.student.resumeUrl, app.student?.user?.name)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-bauhaus-muted text-xs text-bauhaus-black font-bold hover:bg-bauhaus-yellow/30 transition border-2 border-bauhaus-black/20 uppercase"
                      >
                        <Download className="w-3 h-3" /> PDF
                      </button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-bauhaus-muted/50 text-xs text-bauhaus-black/30 cursor-not-allowed font-bold border-2 border-bauhaus-black/10 uppercase">
                      <FileText className="w-3 h-3" /> No Resume
                    </span>
                  )}

                  {!['selected', 'rejected', 'withdrawn'].includes(app.status) && (
                    <>
                      {app.status === 'applied' && (
                        <button onClick={() => updateStatus(app._id, 'shortlisted')} disabled={updating === app._id}
                          className="px-3 py-1.5 bg-bauhaus-yellow text-bauhaus-black text-xs font-black hover:opacity-80 disabled:opacity-50 border-2 border-bauhaus-black uppercase">
                          Shortlist
                        </button>
                      )}
                      {['applied', 'shortlisted'].includes(app.status) && (
                        <button onClick={() => setInterviewFor(interviewFor === app._id ? null : app._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-bauhaus-red/10 text-bauhaus-red text-xs font-black hover:bg-bauhaus-red hover:text-white border-2 border-bauhaus-red transition uppercase">
                          <Calendar className="w-3 h-3" /> Interview
                        </button>
                      )}
                      <button onClick={() => updateStatus(app._id, 'selected')} disabled={updating === app._id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-bauhaus-blue/10 text-bauhaus-blue text-xs font-black hover:bg-bauhaus-blue hover:text-white border-2 border-bauhaus-blue transition disabled:opacity-50 uppercase">
                        <CheckCircle className="w-3 h-3" /> Select
                      </button>
                      <button onClick={() => updateStatus(app._id, 'rejected')} disabled={updating === app._id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-bauhaus-red/10 text-bauhaus-red text-xs font-black hover:bg-bauhaus-red hover:text-white border-2 border-bauhaus-red transition disabled:opacity-50 uppercase">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Interview Scheduling Form */}
              {interviewFor === app._id && (
                <div className="mt-4 p-4 bg-bauhaus-yellow/10 border-2 border-bauhaus-yellow space-y-3">
                  <h4 className="text-sm font-black text-bauhaus-black uppercase">Schedule Interview for {app.student?.user?.name}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><label className="block text-xs font-black text-bauhaus-black/60 mb-1 uppercase tracking-wider">Round Name *</label><input type="text" value={interviewForm.roundName} onChange={(e) => setInterviewForm({...interviewForm, roundName: e.target.value})} className={inputClass} placeholder="e.g. Technical Round 1" /></div>
                    <div><label className="block text-xs font-black text-bauhaus-black/60 mb-1 uppercase tracking-wider">Round Number</label><input type="number" min="1" value={interviewForm.roundNumber} onChange={(e) => setInterviewForm({...interviewForm, roundNumber: parseInt(e.target.value) || 1})} className={inputClass} /></div>
                    <div><label className="block text-xs font-black text-bauhaus-black/60 mb-1 uppercase tracking-wider">Date & Time *</label><input type="datetime-local" value={interviewForm.scheduledAt} onChange={(e) => setInterviewForm({...interviewForm, scheduledAt: e.target.value})} className={inputClass} /></div>
                    <div><label className="block text-xs font-black text-bauhaus-black/60 mb-1 uppercase tracking-wider">Mode</label><select value={interviewForm.mode} onChange={(e) => setInterviewForm({...interviewForm, mode: e.target.value})} className={inputClass}><option value="online">Online</option><option value="offline">Offline</option></select></div>
                    {interviewForm.mode === 'offline' ? (
                      <div className="sm:col-span-2"><label className="block text-xs font-black text-bauhaus-black/60 mb-1 uppercase tracking-wider">Venue</label><input type="text" value={interviewForm.venue} onChange={(e) => setInterviewForm({...interviewForm, venue: e.target.value})} className={inputClass} placeholder="e.g. Room 101" /></div>
                    ) : (
                      <div className="sm:col-span-2"><label className="block text-xs font-black text-bauhaus-black/60 mb-1 uppercase tracking-wider">Meeting Link</label><input type="url" value={interviewForm.meetingLink} onChange={(e) => setInterviewForm({...interviewForm, meetingLink: e.target.value})} className={inputClass} placeholder="https://meet.google.com/..." /></div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleScheduleInterview(app._id)} disabled={scheduling}
                      className="px-4 py-2 bg-bauhaus-blue text-white text-sm font-black border-2 border-bauhaus-black hover:opacity-90 transition disabled:opacity-50 uppercase">{scheduling ? 'Scheduling...' : 'Schedule'}</button>
                    <button onClick={() => setInterviewFor(null)} className="px-4 py-2 border-2 border-bauhaus-black text-sm text-bauhaus-black font-bold hover:bg-bauhaus-muted transition uppercase">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between bg-white border-4 border-bauhaus-black p-4">
          <p className="text-sm text-bauhaus-black/50 font-bold">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border-2 border-bauhaus-black text-sm font-black disabled:opacity-40 hover:bg-bauhaus-muted transition uppercase">Prev</button>
            <button disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border-2 border-bauhaus-black text-sm font-black disabled:opacity-40 hover:bg-bauhaus-muted transition uppercase">Next</button>
          </div>
        </div>
      )}

      {/* Resume Viewer Modal */}
      {resumeView && (
        <ResumeViewer
          url={resumeView.url}
          studentName={resumeView.name}
          onClose={() => setResumeView(null)}
        />
      )}
    </div>
  );
};

export default ApplicantList;
