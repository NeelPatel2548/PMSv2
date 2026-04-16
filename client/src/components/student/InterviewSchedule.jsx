import { useState, useEffect } from 'react';
import { Calendar, Video, MapPin, Clock, ExternalLink, Ban } from 'lucide-react';
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
  const past = interviews.filter(i => (i.status === 'completed') || (i.status === 'scheduled' && new Date(i.scheduledAt) < new Date()));
  const cancelled = interviews.filter(i => i.status === 'cancelled');

  const resultColors = { pass: 'text-bauhaus-blue', fail: 'text-bauhaus-red', pending: 'text-bauhaus-yellow' };

  return (
    <div className="max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-bauhaus-black mb-1 uppercase tracking-wider">Interview Schedule</h1>
        <p className="text-bauhaus-black/50 text-sm mb-6 font-medium">Your interview rounds and results</p>
      </div>

      {interviews.length === 0 ? (
        <div className="text-center py-16 text-bauhaus-black/40">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-black uppercase">No interviews scheduled</p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xs font-black text-bauhaus-black/50 uppercase tracking-[0.3em] mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((int, i) => {
                  const d = new Date(int.scheduledAt);
                  return (
                    <div key={int._id} className="bg-white border-4 border-bauhaus-blue p-5 shadow-hard-sm hover:-translate-y-0.5 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="bg-bauhaus-black min-w-[60px] text-center p-3 flex-shrink-0 border-2 border-bauhaus-black">
                          <span className="text-[10px] uppercase font-black text-white/60">{months[d.getMonth()]}</span>
                          <span className="block text-2xl font-black text-white leading-tight">{d.getDate()}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-bauhaus-black uppercase">{int.roundName} <span className="text-bauhaus-black/40 font-bold text-sm normal-case">(Round {int.roundNumber})</span></h3>
                          <p className="text-sm text-bauhaus-black/50 font-medium">{int.company?.name} — {int.job?.title}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-bauhaus-black/50 font-bold">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`flex items-center gap-1 px-2 py-0.5 font-black border-2 ${
                              int.mode === 'online' ? 'bg-bauhaus-blue/10 text-bauhaus-blue border-bauhaus-blue' : 'bg-bauhaus-red/10 text-bauhaus-red border-bauhaus-red'
                            }`}>
                              {int.mode === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                              {int.mode === 'online' ? 'Online' : 'Offline'}
                            </span>
                            {int.venue && <span>{int.venue}</span>}
                          </div>
                          {int.meetingLink && (
                            <a href={int.meetingLink} target="_blank" rel="noreferrer"
                              className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 bg-bauhaus-yellow text-bauhaus-black text-xs font-black border-2 border-bauhaus-black shadow-hard-sm hover:opacity-90 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all uppercase tracking-wider">
                              <ExternalLink className="w-3 h-3" /> Join Meeting
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-xs font-black text-bauhaus-black/50 uppercase tracking-[0.3em] mb-3">Past</h2>
              <div className="space-y-3">
                {past.map(int => {
                  const d = new Date(int.scheduledAt);
                  return (
                    <div key={int._id} className="bg-white border-2 border-bauhaus-muted p-5 opacity-70">
                      <div className="flex items-start gap-4">
                        <div className="bg-bauhaus-muted min-w-[60px] text-center p-3 flex-shrink-0 border-2 border-bauhaus-black/20">
                          <span className="text-[10px] uppercase font-black text-bauhaus-black/40">{months[d.getMonth()]}</span>
                          <span className="block text-2xl font-black text-bauhaus-black/50 leading-tight">{d.getDate()}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-bauhaus-black/70">{int.roundName} <span className="text-bauhaus-black/40 font-medium text-sm">(Round {int.roundNumber})</span></h3>
                          <p className="text-sm text-bauhaus-black/40 font-medium">{int.company?.name} — {int.job?.title}</p>
                          <p className="text-xs text-bauhaus-black/40 mt-1 font-medium">{d.toLocaleString()}</p>
                          {int.feedback && <p className="text-xs text-bauhaus-black/40 mt-1 italic font-medium">"{int.feedback}"</p>}
                        </div>
                        <span className={`text-sm font-black flex-shrink-0 ${resultColors[int.result] || 'text-bauhaus-black/40'}`}>
                          {int.result === 'pass' ? '✅ Passed' : int.result === 'fail' ? '❌ Failed' : '⏳ Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {cancelled.length > 0 && (
            <div>
              <h2 className="text-xs font-black text-bauhaus-black/50 uppercase tracking-[0.3em] mb-3">Cancelled</h2>
              <div className="space-y-3">
                {cancelled.map(int => {
                  const d = new Date(int.scheduledAt);
                  return (
                    <div key={int._id} className="bg-bauhaus-muted/50 border-2 border-bauhaus-black/10 p-5 opacity-50">
                      <div className="flex items-start gap-4">
                        <div className="bg-bauhaus-muted min-w-[60px] text-center p-3 flex-shrink-0 border-2 border-bauhaus-black/10">
                          <span className="text-[10px] uppercase font-black text-bauhaus-black/30">{months[d.getMonth()]}</span>
                          <span className="block text-2xl font-black text-bauhaus-black/30 leading-tight">{d.getDate()}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-bauhaus-black/40 line-through">{int.roundName} <span className="text-bauhaus-black/30 font-medium text-sm no-underline">(Round {int.roundNumber})</span></h3>
                          <p className="text-sm text-bauhaus-black/30 font-medium">{int.company?.name} — {int.job?.title}</p>
                          <p className="text-xs text-bauhaus-black/30 mt-1 font-medium">{d.toLocaleString()}</p>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-black text-bauhaus-red/60 flex-shrink-0 px-2 py-1 bg-bauhaus-red/5 border border-bauhaus-red/20">
                          <Ban className="w-3 h-3" />
                          {int.cancelledReason || 'Cancelled'}
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
