import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Video, MapPin, Clock, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import Loader from '../common/Loader';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
                {upcoming.map((int, i) => {
                  const d = new Date(int.scheduledAt);
                  return (
                    <motion.div key={int._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        {/* Date Block */}
                        <div className="bg-indigo-600 rounded-xl min-w-[60px] text-center p-3 flex-shrink-0 shadow-sm shadow-indigo-200">
                          <span className="text-[10px] uppercase font-semibold text-indigo-200">{months[d.getMonth()]}</span>
                          <span className="block text-2xl font-bold text-white leading-tight">{d.getDate()}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800">{int.roundName} <span className="text-slate-400 font-normal text-sm">(Round {int.roundNumber})</span></h3>
                          <p className="text-sm text-slate-500">{int.company?.name} — {int.job?.title}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                              int.mode === 'online' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {int.mode === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                              {int.mode === 'online' ? 'Online' : 'Offline'}
                            </span>
                            {int.venue && <span>{int.venue}</span>}
                          </div>
                          {int.meetingLink && (
                            <a href={int.meetingLink} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
                              <ExternalLink className="w-3 h-3" /> Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Past</h2>
              <div className="space-y-3">
                {past.map(int => {
                  const d = new Date(int.scheduledAt);
                  return (
                    <div key={int._id} className="bg-white rounded-2xl p-5 border border-slate-100 opacity-80">
                      <div className="flex items-start gap-4">
                        {/* Date Block (subdued) */}
                        <div className="bg-slate-200 rounded-xl min-w-[60px] text-center p-3 flex-shrink-0">
                          <span className="text-[10px] uppercase font-semibold text-slate-400">{months[d.getMonth()]}</span>
                          <span className="block text-2xl font-bold text-slate-500 leading-tight">{d.getDate()}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-700">{int.roundName} <span className="text-slate-400 font-normal text-sm">(Round {int.roundNumber})</span></h3>
                          <p className="text-sm text-slate-400">{int.company?.name} — {int.job?.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{d.toLocaleString()}</p>
                          {int.feedback && <p className="text-xs text-slate-400 mt-1 italic">"{int.feedback}"</p>}
                        </div>
                        <span className={`text-sm font-semibold flex-shrink-0 ${resultColors[int.result] || 'text-slate-400'}`}>
                          {int.result === 'pass' ? '✅ Passed' : int.result === 'fail' ? '❌ Failed' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewSchedule;
