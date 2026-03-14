import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Send } from 'lucide-react';
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

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition text-sm";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Schedule Interview Round</h1>
        <p className="text-slate-500 text-sm mb-6">For: {studentName}</p>
      </motion.div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>}
      {success && <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-600 text-sm border border-green-100">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
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
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold hover:from-purple-700 hover:to-violet-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
          <Send className="w-5 h-5" />{loading ? 'Scheduling...' : 'Schedule Interview'}
        </button>
      </form>
    </div>
  );
};

export default RoundManager;
