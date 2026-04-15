import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import api from '../../services/api';

const RoundManager = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const applicationId = location.state?.applicationId || '';
  const studentName = location.state?.studentName || 'Student';

  const [formData, setFormData] = useState({
    applicationId, roundName: '', roundNumber: 1,
    scheduledAt: '', mode: 'online', venue: '', meetingLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/company/interviews', {
        ...formData,
        roundNumber: parseInt(formData.roundNumber)
      });
      if (res.data.success) {
        setSuccess('Interview scheduled successfully!');
        setTimeout(() => navigate(`/company/jobs/${jobId}/applicants`), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule');
    } finally { setLoading(false); }
  };

  const inputClass = "bauhaus-input";
  const labelClass = "block text-xs font-black uppercase tracking-widest text-bauhaus-black/60 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-bauhaus-black mb-1 uppercase tracking-wider">Schedule Interview Round</h1>
      <p className="text-bauhaus-black/50 text-sm mb-6 font-medium">For: {studentName}</p>

      {error && <div className="mb-4 p-3 bg-bauhaus-red text-white text-sm border-2 border-bauhaus-black font-bold">{error}</div>}
      {success && <div className="mb-4 p-3 bg-bauhaus-yellow text-bauhaus-black text-sm border-2 border-bauhaus-black font-bold">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white border-4 border-bauhaus-black p-6 shadow-hard-md space-y-4">
        <input type="hidden" name="applicationId" value={formData.applicationId} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className={labelClass}>Round Name *</label><input type="text" name="roundName" value={formData.roundName} onChange={handleChange} required className={inputClass} placeholder="e.g. Technical, HR" /></div>
          <div><label className={labelClass}>Round Number *</label><input type="number" name="roundNumber" value={formData.roundNumber} onChange={handleChange} min="1" required className={inputClass} /></div>
          <div><label className={labelClass}>Scheduled Date/Time *</label><input type="datetime-local" name="scheduledAt" value={formData.scheduledAt} onChange={handleChange} required className={inputClass} /></div>
          <div><label className={labelClass}>Mode *</label><select name="mode" value={formData.mode} onChange={handleChange} className={inputClass}><option value="online">Online</option><option value="offline">Offline</option></select></div>
          {formData.mode === 'offline' && (
            <div className="sm:col-span-2"><label className={labelClass}>Venue</label><input type="text" name="venue" value={formData.venue} onChange={handleChange} className={inputClass} placeholder="Room 301, Main Building" /></div>
          )}
          {formData.mode === 'online' && (
            <div className="sm:col-span-2"><label className={labelClass}>Meeting Link</label><input type="url" name="meetingLink" value={formData.meetingLink} onChange={handleChange} className={inputClass} placeholder="https://meet.google.com/..." /></div>
          )}
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-bauhaus-blue text-white font-black hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 border-4 border-bauhaus-black shadow-hard-md active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider">
          <Send className="w-5 h-5" />{loading ? 'Scheduling...' : 'Schedule Interview'}
        </button>
      </form>
    </div>
  );
};

export default RoundManager;
