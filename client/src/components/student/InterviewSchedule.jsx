import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Video, MapPin, Clock } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const InterviewSchedule = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/interviews');
        if (res.data.success) setInterviews(res.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <Loader />;

  const upcoming = interviews.filter(i => i.status === 'scheduled' && new Date(i.scheduledAt) >= new Date());
  const past = interviews.filter(i => i.status !== 'scheduled' || new Date(i.scheduledAt) < new Date());

  const resultColors = { pass: 'text-green-600', fail: 'text-red-600', pending: 'text-amber-600' };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Interview Schedule</h1>
        <p className="text-slate-500 text-sm mb-6">Your interview rounds and results</p>
      </motion.div>

      {interviews.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No interviews scheduled</p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((int, i) => (
                  <motion.div key={int._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-5 border border-primary-100 border-l-4 border-l-primary-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800">{int.roundName} <span className="text-slate-400 font-normal text-sm">(Round {int.roundNumber})</span></h3>
                        <p className="text-sm text-slate-500">{int.company?.name} — {int.job?.title}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(int.scheduledAt).toLocaleString()}</span>
                          <span className="flex items-center gap-1">{int.mode === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}{int.mode}</span>
                          {int.venue && <span>{int.venue}</span>}
                        </div>
                        {int.meetingLink && <a href={int.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline mt-1 inline-block">Join Meeting →</a>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Past</h2>
              <div className="space-y-3">
                {past.map(int => (
                  <div key={int._id} className="bg-white rounded-2xl p-5 border border-slate-100 opacity-80">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-700">{int.roundName} <span className="text-slate-400 font-normal text-sm">(Round {int.roundNumber})</span></h3>
                        <p className="text-sm text-slate-400">{int.company?.name} — {int.job?.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(int.scheduledAt).toLocaleString()}</p>
                        {int.feedback && <p className="text-xs text-slate-400 mt-1 italic">"{int.feedback}"</p>}
                      </div>
                      <span className={`text-sm font-semibold ${resultColors[int.result] || 'text-slate-400'}`}>
                        {int.result === 'pass' ? '✅ Passed' : int.result === 'fail' ? '❌ Failed' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewSchedule;
