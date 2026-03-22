import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, XCircle } from 'lucide-react';
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

// Timeline steps in order
const timelineSteps = ['applied', 'shortlisted', 'interview', 'selected'];

const getStepState = (currentStatus, stepStatus) => {
  if (currentStatus === 'rejected' || currentStatus === 'withdrawn') {
    const idx = timelineSteps.indexOf(stepStatus);
    const curIdx = Math.max(timelineSteps.indexOf(currentStatus), 0);
    return idx <= curIdx ? 'completed' : 'pending';
  }
  const currentIdx = timelineSteps.indexOf(currentStatus);
  const stepIdx = timelineSteps.indexOf(stepStatus);
  if (stepIdx < currentIdx) return 'completed';
  if (stepIdx === currentIdx) return 'current';
  return 'pending';
};

const ApplicationTracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/applications');
        if (res.data.success) setApplications(res.data.data);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return;
    setWithdrawing(id);
    try {
      await api.put(`/student/applications/${id}/withdraw`);
      setApplications(prev => prev.map(a => a._id === id ? { ...a, status: 'withdrawn' } : a));
    } catch { /* ignore */ } finally { setWithdrawing(null); }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">My Applications</h1>
        <p className="text-slate-500 text-sm mb-6">Track your job application progress</p>
      </motion.div>

      {applications.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No applications yet</p>
          <p className="text-sm mt-1">Browse eligible jobs and start applying</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, i) => (
            <motion.div
              key={app._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{app.job?.title || 'Job'}</h3>
                  <p className="text-sm text-slate-500">{app.company?.name || app.job?.company?.name || ''}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[app.status] || 'bg-slate-100'}`}>
                      {app.status}
                    </span>
                    {app.currentRound && <span className="text-xs text-slate-400">Round: {app.currentRound}</span>}
                    {app.offeredPackage && <span className="text-xs text-green-600 font-medium">Package: {app.offeredPackage}</span>}
                  </div>
                  {app.remarks && <p className="text-xs text-slate-400 mt-1">{app.remarks}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {!['selected', 'rejected', 'withdrawn'].includes(app.status) && (
                    <button
                      onClick={() => handleWithdraw(app._id)}
                      disabled={withdrawing === app._id}
                      className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 font-medium flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />{withdrawing === app._id ? 'Withdrawing...' : 'Withdraw'}
                    </button>
                  )}
                </div>
              </div>

              {/* Timeline Stepper */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  {timelineSteps.map((step, idx) => {
                    const state = getStepState(app.status, step);
                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            state === 'completed' ? 'bg-emerald-500' :
                            state === 'current' ? 'bg-indigo-500 ring-4 ring-indigo-100' :
                            'bg-slate-300'
                          }`} />
                          <span className={`text-[10px] mt-1.5 font-medium capitalize ${
                            state === 'completed' ? 'text-emerald-600' :
                            state === 'current' ? 'text-indigo-600' :
                            'text-slate-400'
                          }`}>{step}</span>
                        </div>
                        {idx < timelineSteps.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1.5 rounded-full ${
                            getStepState(app.status, timelineSteps[idx + 1]) !== 'pending'
                              ? 'bg-emerald-300'
                              : 'bg-slate-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-3">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationTracker;
